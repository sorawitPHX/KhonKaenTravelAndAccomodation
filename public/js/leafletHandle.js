$(document).ready(async () => {
    async function loadTourism() {
        const res = await fetch('/api/tourism')
        const data = await res.json()
        if (res.ok) {
            console.log('tourism', data)
            if (data.length != 0) {
                data.forEach((place, index) => {
                    var icon = L.icon({
                        iconUrl: `/images/ประเภทสถานที่ท่องเที่ยว/${place.category}.png`,
                        iconSize: [32, 32],  // ขนาดของ icon
                        iconAnchor: [16, 32],  // จุดยึดของ icon
                        popupAnchor: [0, -32],  // จุดแสดง popup
                    });

                    // สร้าง Marker และ Popup
                    L.marker([place.latitude, place.longitude], { icon: icon })
                        .addTo(map)
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
                        `)
                        
                })
            } else {
                alert('ไม่พบข้อมูลท่องเที่ยว')
            }
        } else {
            alert('โหลดข้อมูลสถานที่ท่องเที่ยวไม่สำเร็จ')
        }
    }
    async function loadAccommodation() {
        const res = await fetch('/api/accommodation')
        const data = await res.json()
        if (res.ok) {
            console.log('accomodation', data)
            if (data.length != 0) {
                data.forEach((place, index) => {
                    var icon = L.icon({
                        iconUrl: '/images/ที่พัก/type/0star.png',
                        iconSize: [32, 32],  // ขนาดของ icon
                        iconAnchor: [16, 32],  // จุดยึดของ icon
                        popupAnchor: [0, -32],  // จุดแสดง popup
                    });

                    // สร้าง Marker และ Popup
                    L.marker([place.latitude, place.longitude], { icon: icon })
                        .addTo(map)
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
                        `)
                        
                })
            } else {
                alert('ไม่พบข้อมูลท่องเที่ยว')
            }
        } else {
            alert('โหลดข้อมูลสถานที่ท่องเที่ยวไม่สำเร็จ')
        }
    }
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

    await loadTourism()
    await loadAccommodation()
})