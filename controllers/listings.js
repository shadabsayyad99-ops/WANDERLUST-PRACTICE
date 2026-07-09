const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};


module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing You Requested For Does Not  Exist !!");
    return res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};



module.exports.createListing = async (req, res) => {
  console.log("Reached createListing");
  console.log(req.body);
  console.log(req.file);

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);

  // Create the full address
  const address = `${newListing.location}, ${newListing.country}`;

  try {

    const response = await axios.get(
      "http://api.positionstack.com/v1/forward",
      {
        params: {
          access_key: process.env.POSITIONSTACK_API_KEY,
          query: address,
        },
      }
    );

    // console.log(response.data);

    if (response.data.data.length > 0) {
      newListing.latitude = response.data.data[0].latitude;
      newListing.longitude = response.data.data[0].longitude;
    }

  } catch (err) {
    console.log("Positionstack Error:", err.message);
  }
  
newListing.owner = req.user._id;
newListing.image = { url, filename };

// console.log("Latitude:", newListing.latitude);
// console.log("Longitude:", newListing.longitude);

await newListing.save();

  req.flash("success", "New Listing Is Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing You Requested For Does Not  Exist !!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/,w_250");
  await res.render("listings/edit.ejs", { listing, originalImageUrl });
};


module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  // Update basic fields
  let listing = await Listing.findById(id);

  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;

  // Get new coordinates from Positionstack
  const address = `${listing.location}, ${listing.country}`;

  try {
    const response = await axios.get(
      "http://api.positionstack.com/v1/forward",
      {
        params: {
          access_key: process.env.POSITIONSTACK_API_KEY,
          query: address,
        },
      }
    );

    if (response.data.data.length > 0) {
      listing.latitude = response.data.data[0].latitude;
      listing.longitude = response.data.data[0].longitude;
    }

  } catch (err) {
    console.log("Positionstack Error:", err.message);
  }

  // Update image if a new one is uploaded
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = {
      url,
      filename,
    };
  }

  await listing.save();

  req.flash("success", "Updated Successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  // locals
  req.flash("success", "Listing Deleted !");
  res.redirect("/listings");
};


module.exports.searchListing =  async (req, res) => {
    const { q } = req.query;

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ]
    });

    res.render("listings/index", { allListings });
};