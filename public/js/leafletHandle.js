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

async function openReviewModal(type, placeId) {
    document.getElementById("reviewPlaceId").value = placeId;
    document.getElementById("reviewType").value = type;

    let res = await fetch(`/api/reviews/${type}/${placeId}`);
    let reviews = await res.json();

    // ดึง userId ของผู้ใช้ที่ล็อกอินอยู่
    let userRes = await fetch("/api/auth/current-user");
    let userData = await userRes.json();
    let currentUserId = userData?.id;
    let currentUserRole = userData?.role;

    let reviewHtml = reviews.map(review => {
        let userLiked = review.reviewLikes.some(like => like.userId === currentUserId);
        let btnClass = userLiked ? "btn-primary" : "btn-light"; // เปลี่ยนสีปุ่มเมื่อไลก์แล้ว

        // เพิ่มปุ่มลบรีวิวเมื่อรีวิวเป็นของผู้ใช้ที่ล็อกอิน
        let deleteButton = (review.userId === currentUserId || currentUserRole == 'admin') ? `
            <button class="btn btn-danger btn-sm" onclick="deleteReview(${review.id})">
                ลบรีวิว
            </button>
        ` : '';

        return `
            <div class="card p-2 mb-2">
                <strong>${review.user.name}</strong> คะแนนรีวิว ⭐${review.rating}
                <p>${review.comment}</p>
                <div class='text-end'>
                    <button class="btn ${btnClass} btn-sm" onclick="likeReview(${review.id}, this)">
                        👍 ${review.reviewLikes.length}
                    </button>
                    ${deleteButton}
                </div>
            </div>
        `;
    }).join('');

    document.getElementById("reviewsList").innerHTML = reviewHtml || "<p>ยังไม่มีรีวิว</p>";
    new bootstrap.Modal(document.getElementById("reviewModal")).show();
}

async function deleteReview(reviewId) {
    Notiflix.Confirm.show(
        'ลบข้อมูล',
        'คุณต้องการลบรีวิวนี้ใช่หรือไม่',
        'ใช่',
        'ไม่',
        async () => {
            let res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
            if (res.ok) {
                Notiflix.Report.success(
                    'ลบรีวิวเรียบร้อยแล้ว',
                    '',
                    'ตกลง',
                    () => {
                        let modal = bootstrap.Modal.getInstance(document.getElementById("reviewModal"));
                        if (modal) modal.hide(); // ปิด modal เดิมก่อน
                        setTimeout(() => openReviewModal(document.getElementById("reviewType").value, document.getElementById("reviewPlaceId").value), 300); // รอ modal ปิดก่อนแล้วเปิดใหม่
                    }
                )

            } else {
                if (res.status == 403) {
                    Notiflix.Report.info(
                        'โปรดทราบ',
                        'กรุณาเข้าสู่ระบบก่อนดำเนินการ',
                        'ตกลง',
                        () => {
                            window.location.href = '/signIn'
                        }
                    )
                } else {
                    Notiflix.Report.failure(
                        'เกิดข้อผิดพลาด',
                        `${data.error}`,
                        'ตกลง',
                    )
                }
            }
        },
        () => {

        },
    );
}


async function submitReview() {
    let placeId = document.getElementById("reviewPlaceId").value;
    let type = document.getElementById("reviewType").value;
    let rating = document.getElementById("reviewRating").value;
    let comment = document.getElementById("reviewComment").value;

    let res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, placeId, rating, comment })
    });

    if (res.ok) {
        Notiflix.Report.success(
            'รีวิวของคุณถูกบันทึกแล้ว',
            '',
            'ตกลง',
            () => {
                let modal = bootstrap.Modal.getInstance(document.getElementById("reviewModal"));
                if (modal) modal.hide(); // ปิด modal เดิมก่อน
                setTimeout(() => openReviewModal(type, placeId), 300); // รอ modal ปิดก่อนแล้วเปิดใหม่
            }
        )

    } else {
        if (res.status == 403) {
            Notiflix.Report.info(
                'โปรดทราบ',
                'กรุณาเข้าสู่ระบบก่อนดำเนินการ',
                'ตกลง',
                () => {
                    window.location.href = '/signIn'
                }
            )
        } else {
            Notiflix.Report.failure(
                'เกิดข้อผิดพลาด',
                `${data.error}`,
                'ตกลง',
            )
        }
    }
}

async function likeReview(reviewId) {
    let res = await fetch(`/api/reviews/${reviewId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId })
    });

    if (res.ok) {
        let modal = bootstrap.Modal.getInstance(document.getElementById("reviewModal"));
        if (modal) modal.hide();
        setTimeout(() => openReviewModal(document.getElementById("reviewType").value, document.getElementById("reviewPlaceId").value), 300);
    } else {
        if (res.status == 403) {
            Notiflix.Report.info(
                'โปรดทราบ',
                'กรุณาเข้าสู่ระบบก่อนดำเนินการ',
                'ตกลง',
                () => {
                    window.location.href = '/signIn'
                }
            )
        } else {
            Notiflix.Report.failure(
                'เกิดข้อผิดพลาด',
                `${data.error}`,
                'ตกลง',
            )
        }
    }
}

async function getCurrentUser() {
    const res = await fetch('/api/auth/current-user')
    const user = await res.json()
    if (res.ok && user) {
        return user
    }
}

$(document).ready(async () => {
    Notiflix.Loading.hourglass();
    const user = await getCurrentUser()
    // console.log(user)
    let map = L.map('map', {
        zoomControl: false  // ปิดปุ่ม Zoom ดั้งเดิม
    }).setView([16.468218482217885, 102.6308571861837], 9);

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
    let allMarkers = []; // เก็บ Marker ทั้งหมด

    // ✅ เพิ่ม Layer ลงใน control panel
    let overlayMaps = {
        "สถานที่ท่องเที่ยว": tourismLayer,
        "สถานที่พัก": accommodationLayer,
        "ขอบเขตจังหวัดขอนแก่น": khonkaenLayer
    };

    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    let layerControl = L.control.layers(baseMaps, overlayMaps, { position: 'bottomright' }).addTo(map);

    // ✅ เปิด Modal เมื่อคลิกที่แผนที่
    if (user?.role == 'admin') {
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
    }

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
                    const modifyContainer = user?.role == 'admin' ?
                        `<div class='col-12 d-flex justify-content-center gap-2'>
                                        <button class="btn btn-warning btn-sm" onclick="editPlace('tourism', ${place.id})">แก้ไข</button>
                                        <button class="btn btn-danger btn-sm" onclick="deletePlace('tourism', ${place.id})">ลบ</button>
                                    </div>
                                    <hr class='my-2'>
                                    ` : ''
                    let marker = L.marker([place.latitude, place.longitude], { icon: icon })
                        .bindPopup(`
                            <div class="container-fluid">
                                <div class="row">
                                    ${modifyContainer}
                                    
                                    <div class="col-12">
                                        <h5 class="popup-header fw-bold">${place.name}</h5>
                                        <p><strong>หมวดหมู่:</strong> ${place.category}</p>
                                        <p><strong>เปิดให้บริการ:</strong> ${place.openingHours}</p>
                                        <p><strong>ที่อยู่:</strong> ${place.address ? place.address : 'ไม่ระบุ'}</p>
                                    </div>
                                    <div class="col-12">
                                        <a href="${place.photos}" data-fancybox="gallery" data-caption="${'รูปภาพ ' + place.name}">
                                            <img src="${place.photos}" class="img-thumbnail" alt="Click to view larger image">
                                        </a>
                                    </div>
                                    <hr class='my-2'>
                                    <div class="col text-center">
                                        <button class="btn btn-info" onclick="openReviewModal('tourism', ${place.id})">อ่านรีวิว</button>
                                    </div>
                                </div>
                            </div>
                        `).addTo(tourismLayer); // ✅ เพิ่มเข้า Layer Group
                    allMarkers.push({ marker, name: place.name, type: 'สถานที่ท่องเที่ยว', icon: '✈️' });
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
                    const modifyContainer = user?.role == 'admin' ?
                        `<div class='col-12 d-flex justify-content-center gap-2'>
                                        <button class="btn btn-warning btn-sm" onclick="editPlace('accommodation', ${place.id})">แก้ไข</button>
                                        <button class="btn btn-danger btn-sm" onclick="deletePlace('accommodation', ${place.id})">ลบ</button>
                                    </div>
                                    <hr class='my-2'>
                                    ` : ''
                    let marker = L.marker([place.latitude, place.longitude], { icon: icon })
                        .bindPopup(`
                            <div class="container-fluid">
                                <div class="row">
                                    ${modifyContainer}
                                    <div class="col-12">
                                        <h5 class="popup-header fw-bold">${place.name}</h5>
                                        <p><strong>หมวดหมู่:</strong> ${place.category}</p>
                                        <p><strong>ราคา:</strong> ${place.price} บาท</p>
                                        <p><strong>เปิดให้บริการ:</strong> ${place.openingHours}</p>
                                        <p><strong>เบอร์ติดต่อ:</strong> ${place.phoneNumber}</p>
                                        <p><strong>เว็บไซต์:</strong> ${place.website ? place.website : 'ไม่พบ'}</p>
                                        <p><strong>ที่อยู่:</strong> ${place.address ? place.address : 'ไม่ระบุ'}</p>
                                    </div>
                                    <div class="col-12">
                                        <a href="${place.photos}" data-fancybox="gallery" data-caption="${'รูปภาพ ' + place.name}">
                                            <img src="${place.photos}" class="img-thumbnail" alt="Click to view larger image">
                                        </a>
                                    </div>
                                    <hr class='my-2'>
                                    <div class="col text-center">
                                        <button class="btn btn-info" onclick="openReviewModal('accommodation', ${place.id})">อ่านรีวิว</button>
                                    </div>
                                </div>
                            </div>
                        `).addTo(accommodationLayer); // ✅ เพิ่มเข้า Layer Group
                    allMarkers.push({ marker, name: place.name, type: 'ที่พัก', icon: '🛌🏻' });
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
    const searchResults = document.getElementById('searchResults')
    function searchMarker(query) {
        let matchedMarkers = allMarkers.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
        searchResults.innerHTML = ``
        if (matchedMarkers.length > 0 && query) {
            searchResults.classList.add("show");
            matchedMarkers.forEach((place, index) => {
                const li = document.createElement("li");
                li.classList.add("dropdown-item");
                li.innerHTML = `<strong>${place.icon}${place.name}</strong> - ${place.type}`;
                li.addEventListener("click", function () {
                    if (matchedMarkers[index]) {
                        map.setView(matchedMarkers[index].marker.getLatLng(), 12);
                        matchedMarkers[index].marker.openPopup();
                    }
                });
                searchResults.appendChild(li);
            });
        } else {
            searchResults.innerHTML = ``
            searchResults.classList.remove("show");
        }
    }

    $('#searchBox').on('input', (e) => {
        const query = e.target.value
        searchMarker(query)
    })

    await loadTourism();
    await loadAccommodation();
    await loadKhonKaenGeoJSON();

    Notiflix.Loading.remove();
});
