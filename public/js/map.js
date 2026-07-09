const map = L.map("map").setView(
    [coordinates.latitude, coordinates.longitude],
    13
);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

L.marker([coordinates.latitude, coordinates.longitude])
    .addTo(map)
    .bindPopup(`
        <b>${coordinates.title}</b><br>
        ${coordinates.location}, ${coordinates.country}
    `)
    .openPopup();