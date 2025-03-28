// ✅ เปิด Modal แก้ไขข้อมูล
async function editPlace(type, id) {
    let res = await fetch(`/api/${type}?id=${id}`);
    let place = await res.json();
    place = place[0]

    $('#placeId').val(id);
    $('#placeName').val(place.name);
    $('#placeAddress').val(place.address);
    $('#placeOpeningHours').val(place.openingHours);
    $('#placePhotos').val(place.photos);
    $('#placeType').val(type);
    $('#placeLat').val(place.latitude);
    $('#placeLng').val(place.longitude);
    updateExtraFields(type);

    $('#placeCategory').val(place.category);

    if (type === 'accommodation') {
        $('#placePhone').val(place.phoneNumber);
        $('#placeWebsite').val(place.website);
        $('#placePrice').val(place.price);
    }

    $('#placeModalLabel').text('แก้ไขสถานที่');
    $('#placeModal').modal('show');
}

function updateExtraFields(type) {
    let extraFields = $('#extraFields');
    extraFields.empty();

    if (type === 'tourism') {
        extraFields.append(`
        <div class="mb-3">
            <label for="placeCategory" class="form-label">หมวดหมู่</label>
            <select class="form-select" id="placeCategory" name="category">
                <option value="สวนสาธารณะ">สวนสาธารณะ</option>
                <option value="พิพิธภัณฑ์">พิพิธภัณฑ์</option>
                <option value="วัด">วัด</option>
                <option value="สวนน้ำ">สวนน้ำ</option>
                <option value="สถานที่สักการะบูชา">สถานที่สักการะบูชา</option>
                <option value="คาเฟ่">คาเฟ่</option>
                <option value="สวนสัตว์">สวนสัตว์</option>
                <option value="อนุสรณ์สถาน">อนุสรณ์สถาน</option>
                <option value="อุทยานแห่งชาติ">อุทยานแห่งชาติ</option>
                <option value="อื่นๆ">อื่นๆ</option>
            </select>
        </div>
    `);
    } else {
        extraFields.append(`
        <div class="mb-3">
            <label for="placePhone" class="form-label">เบอร์โทร</label>
            <input type="text" class="form-control" id="placePhone" name="phoneNumber">
        </div>
        <div class="mb-3">
            <label for="placeWebsite" class="form-label">เว็บไซต์</label>
            <input type="text" class="form-control" id="placeWebsite" name="website">
        </div>
        <div class="mb-3">
            <label for="placePrice" class="form-label">ราคา</label>
            <input type="number" class="form-control" id="placePrice" name="price">
        </div>
        <div class="mb-3">
            <label for="placeCategory" class="form-label">หมวดหมู่</label>
            <select class="form-select" id="placeCategory" name="category">
                <option value="โรงแรม">โรงแรม</option>
                <option value="รีสอร์ท">รีสอร์ท</option>
                <option value="โฮสเทล">โฮสเทล</option>
                <option value="อพาร์ทเมนท์">อพาร์ทเมนท์</option>
                <option value="แคมป์ปิ้ง">แคมป์ปิ้ง</option>
                <option value="อื่นๆ">อื่นๆ</option>
            </select>
        </div>
    `);
    }
}

async function deletePlace(type, id) {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสถานที่นี้?')) {
        return;
    }

    let res = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE'
    });

    if (res.ok) {
        alert('ลบสถานที่สำเร็จ');
        location.reload();
    } else {
        alert('เกิดข้อผิดพลาดในการลบสถานที่');
    }
}

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

    // ✅ เปิด Modal เมื่อคลิกที่แผนที่
    map.on('click', function (e) {
        let { lat, lng } = e.latlng;

        $('#placeId').val('');
        $('#placeName').val('');
        $('#placeAddress').val('');
        $('#placeOpeningHours').val('');
        $('#placePhotos').val('');
        $('#placeType').val('tourism');
        $('#placeLat').val(lat);
        $('#placeLng').val(lng);

        updateExtraFields('tourism'); // โหลด fields ให้ถูกต้อง
        $('#placeModalLabel').text('เพิ่มสถานที่ใหม่');
        $('#placeModal').modal('show');
    });

    // ✅ เปลี่ยน fields ตามประเภท
    $('#placeType').change(function () {
        updateExtraFields($(this).val());
    });



    // ✅ บันทึกข้อมูลไปยัง API
    $('#placeForm').submit(async function (e) {
        e.preventDefault();

        let id = $('#placeId').val();
        let type = $('#placeType').val();
        let url = id ? `/api/${type}/${id}` : `/api/${type}`;
        let method = id ? 'PUT' : 'POST';

        let placeData = {
            name: $('#placeName').val(),
            address: $('#placeAddress').val(),
            openingHours: $('#placeOpeningHours').val(),
            photos: $('#placePhotos').val(),
            lat: parseFloat($('#placeLat').val()),
            long: parseFloat($('#placeLng').val()),
            category: $('#placeCategory').val()
        };
        if (type === 'accommodation') {
            placeData.phoneNumber = $('#placePhone').val();
            placeData.website = $('#placeWebsite').val();
            placeData.price = $('#placePrice').val() ? parseInt($('#placePrice').val()) : null;
        }

        console.log(placeData)
        let res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(placeData)
        });

        if (res.ok) {
            $('#placeModal').modal('hide');
            alert(id ? 'อัปเดตข้อมูลสำเร็จ' : 'เพิ่มสถานที่สำเร็จ');
            location.reload();
        } else {
            alert('เกิดข้อผิดพลาด');
        }
    });


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
                                    <div class='col-12 d-flex justify-content-center gap-2'>
                                        <button class="btn btn-warning btn-sm" onclick="editPlace('tourism', ${place.id})">แก้ไข</button>
                                        <button class="btn btn-danger btn-sm" onclick="deletePlace('tourism', ${place.id})">ลบ</button>
                                    </div>
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
                                    <div class='col-12 d-flex justify-content-center gap-2'>
                                        <button class="btn btn-warning btn-sm" onclick="editPlace('accommodation', ${place.id})">แก้ไข</button>
                                        <button class="btn btn-danger btn-sm" onclick="deletePlace('accommodation', ${place.id})">ลบ</button>
                                    </div>
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
                    color: "#E91E63", // สีขอบ
                    weight: 2,        // ความหนาของเส้น
                    opacity: 0.8,     // ความโปร่งใสของเส้น
                    fillColor: "#FFC0CB", // สีพื้นที่
                    fillOpacity: 0.5  // ความโปร่งใสของพื้นที่
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.AMP_NAMT) {
                        layer.bindPopup(`<b>เขต:</b> ${feature.properties.AMP_NAMT}`);
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
