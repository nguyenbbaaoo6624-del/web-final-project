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
                let statusColor = '#f39c12';
                let statusText = p.status === 'Pending' ? 'Đang chờ' : p.status;
                let mucDich = p.muc_dich ? p.muc_dich : 'N/A';
                let actionBtn = '';

                if (p.status === 'Pending') {
                    countDangCho++;
                    statusColor = '#f39c12';
                } else if (p.status === 'Đã duyệt') {
                    countDangMuon++;
                    statusColor = '#2ecc71';
                    actionBtn = `<button onclick="yeuCauTra(${p.id})" class="btn-primary" style="padding: 4px 8px; font-size: 12px; margin-left: 8px;">Trả thiết bị</button>`;
                    htmlSelectBaoHong += `<option value="${p.ten_tb}">${p.ten_tb} (Mã phiếu: PM-${p.id})</option>`;
                } else if (p.status === 'Chờ xác nhận trả') {
                    statusColor = '#e67e22';
                    actionBtn = `<small style="color:#e67e22; margin-left: 8px;">(Đang chờ Admin duyệt trả)</small>`;
                } else if (p.status === 'Đã trả') {
                    statusColor = '#3498db';
                } else if (p.status === 'Từ chối') {
                    statusColor = '#e74c3c';
                }

                htmlHistory += `<tr>
                    <td>PM-${p.id}</td>
                    <td>${p.ten_tb}</td>
                    <td>${mucDich}</td>
                    <td>${p.ngay_tra}</td>
                    <td>
                        <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
                        ${actionBtn}
                    </td>
                </tr>`;
                
                if(p.status !== 'Pending') {
                    let lyDoText = (p.status === 'Từ chối' && p.ly_do_tu_choi) ? `<br><span style="color: #e74c3c; font-size: 13px;">Phản hồi từ Admin: <b>${p.ly_do_tu_choi}</b></span>` : '';
                    
                    htmlNoti += `<li style="padding: 15px; border-bottom: 1px solid #eee;">
                        Yêu cầu mượn <b>${p.ten_tb}</b> của bạn đã chuyển sang trạng thái: <b>${statusText}</b>. ${lyDoText}
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

// 1. SINH VIÊN: Gửi yêu cầu trả thiết bị
function yeuCauTra(borrowId) {
    if (!confirm("Bạn có chắc chắn muốn gửi yêu cầu trả thiết bị này?")) return;

    fetch('api_return_borrow.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'request_return',
            borrow_id: borrowId
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            loadDuLieuSinhVien(); // Refresh lại giao diện sinh viên
        }
    })
    .catch(error => console.error('Lỗi gửi yêu cầu trả:', error));
}

// 2. ADMIN: Kiểm tra tình trạng & Xác nhận đã nhận lại thiết bị
function xacNhanTraAdmin(borrowId, maTb) {
    let condition = prompt("Nhập tình trạng thiết bị khi nhận lại (VD: Bình thường, Hỏng nhẹ, Trầy xước):", "Bình thường");
    if (condition === null) return; // Nhấn Hủy
    if (condition.trim() === '') condition = "Bình thường";

    fetch('api_return_borrow.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'confirm_return',
            borrow_id: borrowId,
            ma_tb: maTb,
            condition: condition
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            loadPhieuMuon(); // Refresh bảng phiếu mượn Admin
            if (typeof loadAdminTabs === 'function') loadAdminTabs(); // Refresh danh sách thiết bị Admin
        }
    })
    .catch(error => console.error('Lỗi xác nhận trả:', error));
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
            
            // Khởi tạo mảng đếm số lượng mượn theo ngày (0: CN, 1: T2, 2: T3...)
            let weekCounts = [0, 0, 0, 0, 0, 0, 0]; 

            if (!Array.isArray(data) || data.length === 0) {
                htmlDash = '<tr><td colspan="5" style="text-align:center;">Không có yêu cầu nào</td></tr>';
                htmlFull = htmlDash;
            } else {
                data.forEach(phieu => {
                    let mucDich = phieu.muc_dich ? phieu.muc_dich : 'Không có';
                    
                    // Phân tích tần suất thực tế theo ngày
                    if (phieu.ngay_tra) {
                        let d = new Date(phieu.ngay_tra);
                        if (!isNaN(d.getTime())) weekCounts[d.getDay()]++;
                    }

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

                    let btnActionAdmin = 'Đã xử lý';
                    if (phieu.status === 'Pending') {
                        btnActionAdmin = `
                            <button onclick="xuLyPhieu(${phieu.id}, 'Đã duyệt')" class="btn-icon btn-approve">✔️</button>
                            <button onclick="xuLyPhieu(${phieu.id}, 'Từ chối')" class="btn-icon btn-reject">❌</button>
                        `;
                    } else if (phieu.status === 'Chờ xác nhận trả') {
                        btnActionAdmin = `
                            <button onclick="xacNhanTraAdmin(${phieu.id}, '${phieu.ma_tb}')" class="btn-primary" style="padding: 4px 10px; font-size: 12px; background-color: #27ae60;">
                                Nhận lại & Kiểm tra
                            </button>
                        `;
                    }

                    htmlFull += `<tr id="phieu_full_${phieu.id}">
                        <td>${phieu.username}</td>
                        <td>${phieu.ten_tb}</td>
                        <td>${mucDich}</td>
                        <td><b>${phieu.status}</b></td>
                        <td>${btnActionAdmin}</td>
                    </tr>`;
                });
            }
            
            if(dashElement) dashElement.innerHTML = htmlDash || '<tr><td colspan="5" style="text-align:center;">Không có yêu cầu chờ duyệt</td></tr>';
            if(fullElement) fullElement.innerHTML = htmlFull;
            if(statChoElement) statChoElement.innerText = countChoDuyet;

            // Render lại biểu đồ bằng dữ liệu thực
            let maxCount = Math.max(...weekCounts);
            if (maxCount === 0) maxCount = 1;
            
            let chartHtml = '';
            const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            
            // Xếp thứ tự biểu đồ từ Thứ 2 đến Chủ nhật
            for(let i = 1; i <= 7; i++) {
                let dayIndex = i % 7; 
                let height = (weekCounts[dayIndex] / maxCount) * 100;
                chartHtml += `
                <div style="display: flex; flex-direction: column; align-items: center; width: 12%;">
                    <div style="height: 150px; width: 100%; display: flex; align-items: flex-end; margin-bottom: 10px;">
                        <div class="bar" style="height: ${height}%; width: 100%; background-color: #3498db; border-radius: 3px 3px 0 0;"></div>
                    </div>
                    <span style="font-size: 12px; color: #7f8c8d; font-weight: bold;">${days[dayIndex]}</span>
                    <span style="font-size: 13px; color: #2c3e50;">${weekCounts[dayIndex]}</span>
                </div>`;
            }
            
            let chartContainer = document.querySelector('.chart-placeholder');
            if(chartContainer) {
                chartContainer.style.display = 'flex';
                chartContainer.style.justifyContent = 'space-between';
                chartContainer.style.alignItems = 'flex-end';
                chartContainer.innerHTML = chartHtml;
            }

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
    let lyDo = '';
    if (hanhDong === 'Từ chối') {
        lyDo = prompt("Nhập lý do từ chối & Thiết bị thay thế (nếu có):");
        if (lyDo === null) return; // Hủy bỏ thao tác nếu nhấn Cancel
        if (lyDo.trim() === '') return alert("Vui lòng nhập lý do từ chối!");
    }

    fetch('api_update_borrow.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idPhieu, action: hanhDong, ly_do: lyDo })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("Đã " + hanhDong + " yêu cầu PM-" + idPhieu);
            loadPhieuMuon(); 
        } else {
            alert("Có lỗi xảy ra: " + data.message);
        }
    })
    .catch(error => console.error('Lỗi xử lý phiếu:', error));
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
            let phong = tb.phong ? tb.phong : 'Kho chung';
            let statusColor = tb.status === 'Sẵn sàng' ? '#2ecc71' : (tb.status === 'Bảo trì' ? '#e74c3c' : '#f39c12');
            html += `<tr>
                <td>${tb.ma_tb}</td>
                <td>${tb.ten_tb}</td>
                <td><b>${phong}</b></td>
                <td style="color:${statusColor}; font-weight:bold;">${tb.status}</td>
                <td>
                    <button onclick="suaThietBi('${tb.ma_tb}', '${tb.ten_tb}', '${phong}', '${tb.status}')" style="padding: 5px 10px; background: #f39c12; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;">Sửa</button>
                    <button onclick="xoaThietBi('${tb.ma_tb}')" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">Xóa</button>
                </td>
            </tr>`;
        });
        let e = document.getElementById('ds_thietbi_admin');
        if(e) e.innerHTML = html;
        
        let statTb = document.getElementById('stat_admin_tongtb');
        if(statTb) statTb.innerText = data.length; 
    });

    // Tải danh sách Người dùng
    fetch('api_get_users.php').then(res => res.json()).then(data => {
        let html = '';
        data.forEach(u => {
            let btnXoa = u.role !== 'admin' ? `<button onclick="xoaNguoiDung('${u.username}')" class="btn-icon btn-reject" style="width:auto; padding:5px 10px; font-size:12px;">Xóa</button>` : '';
            html += `<tr><td>${u.username}</td><td>${u.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}</td><td>${btnXoa}</td></tr>`;
        });
        let e = document.getElementById('ds_nguoidung');
        if(e) e.innerHTML = html;
        
        let statUser = document.getElementById('stat_admin_user');
        if(statUser) statUser.innerText = data.length;
    }).catch(error => console.error('Lỗi load người dùng:', error));
}

function xoaNguoiDung(username) {
    if(!confirm("Bạn có chắc chắn muốn xóa tài khoản: " + username + "?")) return;
    
    fetch('api_delete_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("Đã xóa tài khoản " + username);
            loadAdminTabs(); // Tải lại bảng người dùng và số liệu
        } else {
            alert(data.message);
        }
    });
}

// ==========================================
// TÌM KIẾM DỮ LIỆU BẢNG
// ==========================================
function khoiTaoTimKiem(inputId, danhSachBangId) {
    let searchInput = document.getElementById(inputId);
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        let filter = this.value.toLowerCase();
        
        danhSachBangId.forEach(tbodyId => {
            let tbody = document.getElementById(tbodyId);
            if (!tbody) return;
            
            let rows = tbody.getElementsByTagName('tr');
            for (let i = 0; i < rows.length; i++) {
                let rowText = rows[i].textContent.toLowerCase();
                // Ẩn/hiện hàng dựa trên kết quả khớp chuỗi
                rows[i].style.display = rowText.includes(filter) ? '' : 'none';
            }
        });
    });
}

// ==========================================
// TRANG CHỦ - Quản lý trạng thái và nạp dữ liệu
// ==========================================
function dangXuat() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function kiemTraDangNhapTrangChu() {
    let currentUser = localStorage.getItem("currentUser");
    let currentRole = localStorage.getItem("currentRole");
    let authSection = document.getElementById("auth_section");
    let btnHero = document.getElementById("btn_hero_action");

    if (currentUser && authSection) {
        let dashboardUrl = currentRole === 'admin' ? 'admin.html' : 'sinhvien.html';
        
        // Thay nút Đăng nhập/Đăng ký bằng thông tin user
        authSection.innerHTML = `
            <span style="margin-right: 15px; font-weight: bold; color: #2c3e50;">Chào, ${currentUser}</span>
            <button class="btn-primary" onclick="window.location.href='${dashboardUrl}'">Bảng điều khiển</button>
            <button class="btn-outline" onclick="dangXuat()" style="margin-left: 10px;">Đăng xuất</button>
        `;

        // Đổi hướng nút banner
        if (btnHero) {
            btnHero.innerText = "Vào Bảng điều khiển";
            btnHero.onclick = function() { window.location.href = dashboardUrl; };
        }
    }
}

function loadTrangChu() {
    fetch('api_get_equipments.php')
    .then(res => res.json())
    .then(data => {
        let html = '';
        let top3 = data.slice(0, 3);
        let currentUser = localStorage.getItem("currentUser");
        let currentRole = localStorage.getItem("currentRole");
        
        let actionUrl = currentUser ? (currentRole === 'admin' ? 'admin.html' : 'sinhvien.html') : 'login.html';
        let btnText = currentUser ? 'Vào mượn ngay' : 'Đăng nhập để mượn';

        top3.forEach(tb => {
            html += `
            <div style="background: white; padding: 25px; border-radius: 10px; width: 30%; min-width: 250px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: center;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">${tb.ten_tb}</h3>
                <p style="color: #7f8c8d; margin-bottom: 15px;">Tình trạng: <strong style="color: ${tb.status === 'Sẵn sàng' ? '#2ecc71' : '#e74c3c'}">${tb.status}</strong></p>
                <button onclick="window.location.href='${actionUrl}'" class="btn-primary" style="padding: 8px 20px; border-radius: 5px;">${btnText}</button>
            </div>`;
        });
        
        let container = document.getElementById('ds_thietbi_trangchu');
        if(container) container.innerHTML = html;
    })
    .catch(error => console.error('Lỗi load trang chủ:', error));
}

let isEditMode = false;

// 1. Đưa dữ liệu lên Form để Xem chi tiết & Cập nhật
function suaThietBi(maTb, tenTb, phong, status) {
    document.getElementById('form_ma_tb').value = maTb;
    document.getElementById('form_ma_tb').disabled = true; 
    document.getElementById('form_ten_tb').value = tenTb;
    document.getElementById('form_phong_tb').value = phong;
    document.getElementById('form_status_tb').value = status;
    isEditMode = true;

let btnLuu = document.getElementById('btn_luu_tb');
    btnLuu.innerText = 'Cập nhật';
    btnLuu.style.background = '#f39c12';
}

// 2. Làm mới form
function lamMoiFormTb() {
    document.getElementById('form_ma_tb').value = '';
    document.getElementById('form_ma_tb').disabled = false;
    document.getElementById('form_ten_tb').value = '';
    document.getElementById('form_phong_tb').value = '';
    document.getElementById('form_status_tb').value = 'Sẵn sàng';
    isEditMode = false;
    
    // Đổi nút về Thêm mới
    let btnLuu = document.getElementById('btn_luu_tb');
    btnLuu.innerText = 'Thêm mới';
    btnLuu.style.background = '#3498db';
}

// 3. Xử lý Thêm mới hoặc Cập nhật
function luuThietBi() {
    let maTb = document.getElementById('form_ma_tb').value.trim();
    let tenTb = document.getElementById('form_ten_tb').value.trim();
    let phong = document.getElementById('form_phong_tb').value.trim();
    let status = document.getElementById('form_status_tb').value;

    if (!maTb || !tenTb || !phong) {
        alert("Vui lòng nhập đầy đủ Mã, Tên thiết bị và Phòng!");
        return;
    }

    let action = isEditMode ? 'update' : 'add';

    fetch('api_manage_equipment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action, ma_tb: maTb, ten_tb: tenTb, phong: phong, status: status })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            lamMoiFormTb();
            loadAdminTabs(); 
        }
    });
}

// 4. Xử lý Xóa / Thanh lý thiết bị
function xoaThietBi(maTb) {
    if (!confirm(`Bạn có chắc chắn muốn xóa/thanh lý thiết bị ${maTb}?`)) return;

    fetch('api_manage_equipment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ma_tb: maTb })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            lamMoiFormTb();
            loadAdminTabs();
        }
    })
    .catch(error => console.error('Lỗi xóa thiết bị:', error));
}

// ==========================================
// KHỞI TẠO DỮ LIỆU KHI LOAD TRANG
// ==========================================
window.onload = function() {
    let path = window.location.pathname;

    if (path.includes('sinhvien.html')) {
        loadThietBi();
        loadDuLieuSinhVien();
        if(typeof khoiTaoTimKiem === 'function') khoiTaoTimKiem('search_input', ['ds_thietbi', 'ds_lichsu_ganday', 'ds_lichsu_toanbo']);
    }
    else if (path.includes('admin.html')) {
        loadPhieuMuon();
        if(typeof loadAdminTabs === 'function') loadAdminTabs();
        if(typeof khoiTaoTimKiem === 'function') khoiTaoTimKiem('search_input', ['ds_phieumuon_dashboard', 'ds_phieumuon_full', 'ds_thietbi_admin', 'ds_nguoidung', 'ds_baohong']);
    }
    else {
        // Áp dụng cho index.html hoặc đường dẫn thư mục gốc
        kiemTraDangNhapTrangChu();
        loadTrangChu();
    }
}