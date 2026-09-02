// ==========================================
// XỬ LÝ ĐĂNG NHẬP & ĐĂNG KÝ
// ==========================================
function xuLyDangNhap() {
    let u = document.getElementById('username').value;
    let p = document.getElementById('password').value;
    
    let roleElement = document.getElementById('role');
    let r = roleElement ? roleElement.value : null;

    if (u === "" || p === "") {
        alert("Vui lòng nhập đủ tài khoản và mật khẩu!");
        return;
    }

    fetch('api_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            if (r && data.role !== r) {
                alert("Lỗi phân quyền: Tài khoản không có quyền đăng nhập vai trò này!");
                return;
            }
            
            localStorage.setItem("currentUser", u);
            localStorage.setItem("currentRole", data.role);
            window.location.href = data.role === 'sinhvien' ? 'sinhvien.html' : 'admin.html';
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Lỗi đăng nhập:', error);
        alert("Không thể kết nối tới server!");
    });
}

function xuLyDangKy() {
    let u  = document.getElementById('reg_username').value;
    let p  = document.getElementById('reg_password').value;
    let cp = document.getElementById('reg_confirm_password').value;

    if (u === "" || p === "" || cp === "") {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    if (p !== cp) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    fetch('api_register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.status === "success") {
            window.location.href = 'login.html';
        }
    })
    .catch(error => {
        console.error('Lỗi đăng ký:', error);
        alert("Không thể kết nối tới server!");
    });
}

// ==========================================
// TRANG SINH VIÊN - Load thiết bị & Gửi yêu cầu
// ==========================================
function loadThietBi() {
    fetch('api_get_equipments.php')
    .then(res => res.json())
    .then(data => {
        let html = '';

        if (data.length === 0) {
            html = '<tr><td colspan="4" style="text-align:center;">Không có thiết bị nào</td></tr>';
        } else {
            data.forEach(tb => {
                html += `<tr>
                    <td>${tb.ma_tb}</td>
                    <td>${tb.ten_tb}</td>
                    <td>${tb.status}</td>
                    <td>
                        <button onclick="chonThietBi('${tb.ma_tb}', '${tb.ten_tb}')" class="btn-outline" style="padding: 5px 10px; font-size: 12px;">
                            Chọn
                        </button>
                    </td>
                </tr>`;
            });
        }
        let ds = document.getElementById('ds_thietbi');
        if(ds) ds.innerHTML = html;
    })
    .catch(error => {
        console.error('Lỗi load thiết bị:', error);
    });
}

function chonThietBi(ma, ten) {
    let tbElement = document.getElementById('tb_duoc_chon');
    if(tbElement) {
        tbElement.value = ma + ' - ' + ten;
        tbElement.setAttribute('data-matb', ma);
    }
}

function guiYeuCau() {
    let currentUser = localStorage.getItem("currentUser");
    let tbElement = document.getElementById('tb_duoc_chon');
    let ma_tb     = tbElement ? tbElement.getAttribute('data-matb') : null;
    let phongHoc  = document.getElementById('phong_hoc').value;
    let ngayTra   = document.getElementById('ngay_tra').value;
    let mucDichGoc = document.getElementById('muc_dich').value;

    if (!currentUser) return window.location.href = 'login.html';
    if (!ma_tb) return alert("Vui lòng chọn thiết bị!");
    if (!phongHoc || phongHoc < 1 || phongHoc > 30) return alert("Vui lòng nhập số phòng hợp lệ (1-30)!");
    if (!ngayTra) return alert("Vui lòng chọn ngày trả!");

    // Gộp Số phòng vào Mục đích
    let mucDich = `[Phòng ${phongHoc}] ${mucDichGoc}`;

    fetch('api_create_borrow.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: currentUser, ma_tb: ma_tb, ngay_tra: ngayTra, muc_dich: mucDich
        })
    }).then(res => res.json()).then(data => {
        alert(data.message);
        if (data.status === "success") {
            document.getElementById('formMuon').reset();
            loadThietBi();
            loadDuLieuSinhVien();
        }
    });
}

// ==========================================
// TRANG SINH VIÊN - Load lịch sử & Báo hỏng
// ==========================================
function loadDuLieuSinhVien() {
    let currentUser = localStorage.getItem("currentUser");
    if(!currentUser) return;
    
    let nameElement = document.getElementById("user_fullname");
    if(nameElement) nameElement.innerText = currentUser;

    fetch('api_get_borrows.php')
    .then(res => res.text())
    .then(text => {
        try {
            let data = JSON.parse(text);
            if (!Array.isArray(data)) data = [];
            
            let myBorrows = data.filter(p => p.username === currentUser);
            
            let htmlHistory = '';
            let htmlNoti = '';
            let htmlSelectBaoHong = '<option value="">-- Chọn thiết bị đang mượn --</option>';
            let countDangCho = 0;
            let countDangMuon = 0;
            
            myBorrows.forEach(p => {
                let statusColor = p.status === 'Pending' ? '#f39c12' : (p.status === 'Đã duyệt' ? '#2ecc71' : '#e74c3c');
                let statusText = p.status === 'Pending' ? 'Đang chờ' : p.status;
                let mucDich = p.muc_dich ? p.muc_dich : 'N/A';

                if(p.status === 'Pending') countDangCho++;
                if(p.status === 'Đã duyệt') {
                    countDangMuon++;
                    htmlSelectBaoHong += `<option value="${p.ten_tb}">${p.ten_tb} (Mã phiếu: PM-${p.id})</option>`;
                }

                htmlHistory += `<tr>
                    <td>PM-${p.id}</td>
                    <td>${p.ten_tb}</td>
                    <td>${mucDich}</td>
                    <td>${p.ngay_tra}</td>
                    <td><span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></td>
                </tr>`;
                
                if(p.status !== 'Pending') {
                    htmlNoti += `<li style="padding: 15px; border-bottom: 1px solid #eee;">
                        Yêu cầu mượn <b>${p.ten_tb}</b> của bạn đã bị <b>${p.status}</b> bởi Admin.
                    </li>`;
                }
            });
            
            if(document.getElementById('ds_lichsu_toanbo')) document.getElementById('ds_lichsu_toanbo').innerHTML = htmlHistory || '<tr><td colspan="5" style="text-align:center;">Chưa có lịch sử mượn</td></tr>';
            if(document.getElementById('ds_lichsu_ganday')) document.getElementById('ds_lichsu_ganday').innerHTML = htmlHistory || '<tr><td colspan="4" style="text-align:center;">Trống</td></tr>';
            if(document.getElementById('ds_thongbao')) document.getElementById('ds_thongbao').innerHTML = htmlNoti || '<li style="padding: 15px; text-align: center;">Chưa có thông báo mới.</li>';
            if(document.getElementById('thietbi_hong')) document.getElementById('thietbi_hong').innerHTML = htmlSelectBaoHong;
            
            if(document.getElementById('stat_dangcho')) document.getElementById('stat_dangcho').innerText = countDangCho;
            if(document.getElementById('stat_dangmuon')) document.getElementById('stat_dangmuon').innerText = countDangMuon;
        } catch(e) {
            console.error("Lỗi JSON:", text);
        }
    })
    .catch(error => console.error('Lỗi fetch:', error));
}

function guiBaoHong() {
    let currentUser = localStorage.getItem("currentUser");
    let thietBi = document.getElementById('thietbi_hong').value;
    let moTa = document.getElementById('mota_hong').value;

    if (!thietBi || !moTa) return alert("Vui lòng nhập đủ thông tin!");

    fetch('api_create_report.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, thiet_bi: thietBi, mo_ta: moTa })
    }).then(res => res.json()).then(data => {
        alert(data.message);
        if(data.status === "success") document.getElementById('formBaoHong').reset();
    });
}

// ==========================================
// TRANG ADMIN - Load danh sách phiếu mượn & Xử lý
// ==========================================
function loadPhieuMuon() {
    let currentUser = localStorage.getItem("currentUser");
    let adminName = document.getElementById("admin_fullname");
    if(currentUser && adminName) adminName.innerText = currentUser;

    fetch('api_get_borrows.php')
    .then(res => res.text())
    .then(text => {
        let dashElement = document.getElementById('ds_phieumuon_dashboard') || document.getElementById('ds_phieumuon');
        let fullElement = document.getElementById('ds_phieumuon_full');
        let statChoElement = document.getElementById('stat_admin_cho');

        try {
            let data = JSON.parse(text);
            let htmlDash = '';
            let htmlFull = '';
            let countChoDuyet = 0;

            if (!Array.isArray(data) || data.length === 0) {
                htmlDash = '<tr><td colspan="5" style="text-align:center;">Không có yêu cầu nào</td></tr>';
                htmlFull = htmlDash;
            } else {
                data.forEach(phieu => {
                    let mucDich = phieu.muc_dich ? phieu.muc_dich : 'Không có';
                    
                    if(phieu.status === "Pending") {
                        countChoDuyet++;
                        htmlDash += `<tr id="phieu_dash_${phieu.id}">
                            <td>${phieu.username}</td>
                            <td>${phieu.ten_tb}</td>
                            <td>${mucDich}</td>
                            <td><button onclick="xuLyPhieu(${phieu.id}, 'Đã duyệt')" class="btn-icon btn-approve">✔️</button></td>
                            <td><button onclick="xuLyPhieu(${phieu.id}, 'Từ chối')" class="btn-icon btn-reject">❌</button></td>
                        </tr>`;
                    }

                    htmlFull += `<tr id="phieu_full_${phieu.id}">
                        <td>${phieu.username}</td>
                        <td>${phieu.ten_tb}</td>
                        <td>${mucDich}</td>
                        <td><b>${phieu.status}</b></td>
                        <td>
                            ${phieu.status === 'Pending' ? `
                                <button onclick="xuLyPhieu(${phieu.id}, 'Đã duyệt')" class="btn-icon btn-approve">✔️</button>
                                <button onclick="xuLyPhieu(${phieu.id}, 'Từ chối')" class="btn-icon btn-reject">❌</button>
                            ` : 'Đã xử lý'}
                        </td>
                    </tr>`;
                });
            }
            
            if(dashElement) dashElement.innerHTML = htmlDash || '<tr><td colspan="5" style="text-align:center;">Không có yêu cầu chờ duyệt</td></tr>';
            if(fullElement) fullElement.innerHTML = htmlFull;
            if(statChoElement) statChoElement.innerText = countChoDuyet;

        } catch(e) {
            console.error("Dữ liệu Backend lỗi, không phải JSON:", text);
            if(dashElement) {
                dashElement.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center;">Lỗi Backend. Nhấn F12 -> Network -> Chọn api_get_borrows.php -> Xem Response.</td></tr>';
            }
        }
    })
    .catch(error => console.error('Lỗi fetch:', error));
}

function xuLyPhieu(idPhieu, hanhDong) {
    fetch('api_update_borrow.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idPhieu, action: hanhDong })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("Đã " + hanhDong + " yêu cầu PM-" + idPhieu);
            loadPhieuMuon(); // Cập nhật lại bảng sau khi duyệt/từ chối
        } else {
            alert("Có lỗi xảy ra: " + data.message);
        }
    })
    .catch(error => {
        console.error('Lỗi xử lý phiếu:', error);
        alert("Không thể xử lý yêu cầu!");
    });
}

function loadAdminTabs() {
    // Tải danh sách Báo hỏng
    fetch('api_get_reports.php').then(res => res.json()).then(data => {
        let html = '';
        data.forEach(r => {
            html += `<tr><td>BH-${r.id}</td><td>${r.username}</td><td>${r.thiet_bi}</td><td>${r.mo_ta}</td><td>${r.ngay_bao}</td></tr>`;
        });
        let e = document.getElementById('ds_baohong');
        if(e) e.innerHTML = html || '<tr><td colspan="5" style="text-align:center;">Chưa có báo cáo hỏng</td></tr>';
        
        let statHong = document.getElementById('stat_admin_hong');
        if(statHong) statHong.innerText = data.length;
    });

    // Tải danh sách thiết bị cho Admin
    fetch('api_get_equipments.php').then(res => res.json()).then(data => {
        let html = '';
        data.forEach(tb => {
            html += `<tr><td>${tb.ma_tb}</td><td>${tb.ten_tb}</td><td>30</td><td>${tb.status}</td></tr>`;
        });
        let e = document.getElementById('ds_thietbi_admin');
        if(e) e.innerHTML = html;
        
        let statTb = document.getElementById('stat_admin_tongtb');
        if(statTb) statTb.innerText = data.length * 30; // 30 phòng x số loại thiết bị
    });
}

// ==========================================
// KHỞI TẠO DỮ LIỆU KHI LOAD TRANG
// ==========================================
window.onload = function() {
    if (window.location.pathname.includes('sinhvien.html')) {
        loadThietBi();
        loadDuLieuSinhVien();
    }
    if (window.location.pathname.includes('admin.html')) {
        loadPhieuMuon();
        loadAdminTabs();
    }
}
