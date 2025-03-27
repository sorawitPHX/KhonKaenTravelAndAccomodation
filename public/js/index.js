let map = L.map('map').setView([16.40218, 102.81079], 12);

let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 15,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let Stadia_AlidadeSatellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; CNES, Airbus DS, PlanetObserver (Contains Copernicus Data) | &copy; OpenMapTiles & OpenStreetMap contributors',
    ext: 'jpg'
});

let baseMaps = {
    "OpenStreetMap": osm,
    "ภาพถ่ายดาวเทียม": Stadia_AlidadeSatellite
};
let layerControl = L.control.layers(baseMaps).addTo(map);