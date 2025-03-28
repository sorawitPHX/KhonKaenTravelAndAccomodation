$(document).ready(async () => {
    Notiflix.Loading.hourglass();

    let map = L.map('map').setView([16.40218, 102.81079], 12);
    
    let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="/">ฮ้อกกี้สีชมภู</a>'
    }).addTo(map);

    let Stadia_AlidadeSatellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="/">ฮ้อกกี้สีชมภู</a>',
        ext: 'jpg'
    });

    let baseMaps = {
        "OpenStreetMap": osm,
        "ภาพถ่ายดาวเทียม": Stadia_AlidadeSatellite
    };

    // ✅ สร้าง LayerGroup สำหรับแยกประเภทของจุด Marker
    let tourismLayer = L.layerGroup().addTo(map);  // เปิดอยู่ตั้งแต่แรก
    let accommodationLayer = L.layerGroup().addTo(map);  // เปิดอยู่ตั้งแต่แรก
    let khonkaenLayer = L.layerGroup().addTo(map)

    // ✅ เพิ่ม Layer ลงใน control panel
    let overlayMaps = {
        "สถานที่ท่องเที่ยว": tourismLayer,
        "ที่พัก": accommodationLayer,
        "จ.ขอนแก่น": khonkaenLayer
    };

    let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

    async function loadTourism() {
        const res = await fetch('/api/tourism');
        const data = await res.json();
        if (res.ok) {
            console.log('tourism', data);
            if (data.length !== 0) {
                data.forEach((place) => {
                    var icon = L.icon({
                        iconUrl: `/images/ประเภทสถานที่ท่องเที่ยว/${place.category}.png`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32]
                    });

                    // ✅ เพิ่ม Marker เข้า Layer Group
                    L.marker([place.latitude, place.longitude], { icon: icon })
                        .bindPopup(`
                            <div class="container-fluid">
                                <div class="row">
                                    <div class="col-12">
                                        <h5 class="popup-header">${place.name}</h5>
                                        <p><strong>หมวดหมู่:</strong> ${place.category}</p>
                                        <p><strong>เปิดให้บริการ:</strong> ${place.openingHours}</p>
                                        <p><strong>ที่อยู่:</strong> ${place.address ? place.address : 'ไม่ระบุ'}</p>
                                    </div>
                                    <div class="col-12">
                                        <a href="${place.photos}" data-fancybox="gallery" data-caption="${'รูปภาพ ' + place.name}">
                                            <img src="${place.photos}" class="img-thumbnail" alt="Click to view larger image">
                                        </a>
                                    </div>
                                </div>
                            </div>
                        `).addTo(tourismLayer); // ✅ เพิ่มเข้า Layer Group
                });
            } else {
                alert('ไม่พบข้อมูลท่องเที่ยว');
            }
        } else {
            alert('โหลดข้อมูลสถานที่ท่องเที่ยวไม่สำเร็จ');
        }
    }

    async function loadAccommodation() {
        const res = await fetch('/api/accommodation');
        const data = await res.json();
        if (res.ok) {
            console.log('accomodation', data);
            if (data.length !== 0) {
                data.forEach((place) => {
                    var icon = L.icon({
                        iconUrl: '/images/ที่พัก/type/0star.png',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32]
                    });

                    // ✅ เพิ่ม Marker เข้า Layer Group
                    L.marker([place.latitude, place.longitude], { icon: icon })
                        .bindPopup(`
                            <div class="container-fluid">
                                <div class="row">
                                    <div class="col-12">
                                        <h5 class="popup-header">${place.name}</h5>
                                        <p><strong>หมวดหมู่:</strong> ${place.category}</p>
                                        <p><strong>เปิดให้บริการ:</strong> ${place.openingHours}</p>
                                        <p><strong>ที่อยู่:</strong> ${place.address ? place.address : 'ไม่ระบุ'}</p>
                                    </div>
                                    <div class="col-12">
                                        <a href="${place.photos}" data-fancybox="gallery" data-caption="${'รูปภาพ ' + place.name}">
                                            <img src="${place.photos}" class="img-thumbnail" alt="Click to view larger image">
                                        </a>
                                    </div>
                                </div>
                            </div>
                        `).addTo(accommodationLayer); // ✅ เพิ่มเข้า Layer Group
                });
            } else {
                alert('ไม่พบข้อมูลที่พัก');
            }
        } else {
            alert('โหลดข้อมูลที่พักไม่สำเร็จ');
        }
    }

    async function loadKhonKaenGeoJSON() {
        try {
            const res = await fetch('/data/khon_polygon.geojson');
            const data = await res.json();
    
            let geoJsonLayer = L.geoJSON(data, {
                style: {
                    color: "#ff7800", // สีขอบ
                    weight: 2,        // ความหนาของเส้น
                    opacity: 0.8,     // ความโปร่งใสของเส้น
                    fillColor: "#ffcc00", // สีพื้นที่
                    fillOpacity: 0.5  // ความโปร่งใสของพื้นที่
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.name) {
                        layer.bindPopup(`<b>เขต:</b> ${feature.properties.name}`);
                    }
                }
            });
    
            khonkaenLayer.addLayer(geoJsonLayer); // ✅ เพิ่มเข้า Layer Group
        } catch (error) {
            console.error("โหลด GeoJSON ไม่สำเร็จ", error);
        }
    }
    
    await loadTourism();
    await loadAccommodation();
    await loadKhonKaenGeoJSON();

    Notiflix.Loading.remove();
});
