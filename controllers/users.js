const User = require("../models/user.js");

module.exports.renderSingUpForm=  (req, res) => {
  res.render("users/singup.ejs");
};

module.exports.registerUser = async (req, res, next) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      // console.log(registeredUser);
      req.login(registeredUser, (err)=>{
        if(err){ 
          return next(err);
        }
      req.flash("success", "Welcome to Wanderlust!!");
      res.redirect("/listings");
      })
      
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/singup");
    }
};

module.exports.rederLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.loginUser = async (req, res) => {
    req.session.save((err) => {
      if (err) return next(err);
      req.flash("success", "WELCOME BACK TO WANDERLUST !!");

      let redirectUrl = res.locals.redirectUrl || "/listings";
      delete req.session.redirectUrl;

      res.redirect(redirectUrl);
    });
};

module.exports.logoutUser = (req, res, next)=>{
  req.logOut((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success"," You Are LogOut Now");
    res.redirect("/listings");
  })
};