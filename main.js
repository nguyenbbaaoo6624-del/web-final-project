
// XỬ LÝ ĐĂNG NHẬP & ĐĂNG KÝ

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


// TRANG SINH VIÊN - Load thiết bị & Gửi yêu cầu

// Biến toàn cục lưu toàn bộ thiết bị
let allEquipments = []; 

// Hàm fetch dữ liệu từ CSDL
function loadThietBi() {
    fetch('api_get_equipments.php')
    .then(res => res.json())
    .then(data => {
        allEquipments = data;
        
        // Trích xuất danh sách các phòng duy nhất để tạo dropdown
        let danhSachPhong = [...new Set(data.map(tb => tb.phong).filter(p => p))];
        let dropdown = document.getElementById('loc_phong');
        
        if (dropdown) {
            let optionsHtml = '<option value="all">-- Vui lòng chọn phòng học --</option>';
            danhSachPhong.forEach(phong => {
                optionsHtml += `<option value="${phong}">${phong}</option>`;
            });
            dropdown.innerHTML = optionsHtml;
            
            // Gán giá trị mặc định là phòng đầu tiên trong danh sách để không hiện toàn bộ kho
            if (danhSachPhong.length > 0) {
                dropdown.value = danhSachPhong[0];
            }
        }
        
        // Gọi hàm render hiển thị dữ liệu
        renderThietBiSinhVien();
    })
    .catch(error => console.error('Lỗi tải thiết bị:', error));
}

// Hàm lọc và hiển thị danh sách thiết bị
function renderThietBiSinhVien() {
    let dropdown = document.getElementById('loc_phong');
    if (!dropdown) return;
    
    let selectedPhong = dropdown.value;
    
    // Lọc thiết bị theo phòng đã chọn
    let filteredData = allEquipments;
    if (selectedPhong !== 'all') {
        filteredData = allEquipments.filter(tb => tb.phong === selectedPhong);
    } else {
        // Nếu chọn "all", có thể làm rỗng mảng để không hiển thị gì cho đến khi chọn phòng
        filteredData = []; 
    }
    
    let html = '';
    filteredData.forEach(tb => {
        let statusColor = tb.status === 'Sẵn sàng' ? '#2ecc71' : (tb.status === 'Bảo trì' ? '#e74c3c' : '#f39c12');
        let actionBtn = tb.status === 'Sẵn sàng' 
            ? `<button onclick="chonThietBi('${tb.ma_tb}', '${tb.ten_tb}')" style="padding: 5px 15px; background: #3498db; color: white; border: none; border-radius: 3px; cursor: pointer;">Chọn</button>` 
            : `<span style="color: #7f8c8d; font-size: 13px;">Không khả dụng</span>`;
            
        html += `<tr>
            <td>${tb.ma_tb}</td>
            <td>${tb.ten_tb}</td>
            <td style="color:${statusColor};">${tb.status}</td>
            <td>${actionBtn}</td>
        </tr>`;
    });
    
    let tbody = document.getElementById('ds_thietbi');
    if (tbody) {
        tbody.innerHTML = html || '<tr><td colspan="4" style="text-align:center;">Không có thiết bị trong phòng này</td></tr>';
    }
}

// Sinh viên chọn thiết bị
function chonThietBi(maTb, tenTb) {
    document.getElementById('form_muon').style.display = 'block';
    document.getElementById('tb_duoc_chon').innerText = tenTb;
    document.getElementById('ma_tb_muon').value = maTb;
    
    let dropdown = document.getElementById('loc_phong');
    let phong = dropdown ? dropdown.value : 'Không xác định';
    document.getElementById('phong_su_dung').innerText = phong;
}

// Sinh viên gửi form
function guiYeuCauMuon() {
    try {
        let currentUser = localStorage.getItem("currentUser");
        if(!currentUser) {
            alert("Vui lòng đăng nhập!");
            return;
        }
        
        // Kiểm tra các phần tử HTML xem có tồn tại không
        let maTbEl = document.getElementById('ma_tb_muon');
        let mucDichEl = document.getElementById('muc_dich_muon');
        let ngayTraEl = document.getElementById('ngay_tra');
        let phongEl = document.getElementById('phong_su_dung');
        
        if (!maTbEl || !mucDichEl || !ngayTraEl || !phongEl) {
            alert("Lỗi: Giao diện HTML của form mượn không khớp với Code JS. Hãy kiểm tra lại các ID.");
            return;
        }
        
        let maTb = maTbEl.value;
        let mucDichNhap = mucDichEl.value;
        let ngayTra = ngayTraEl.value;
        let phong = phongEl.innerText || 'Không xác định';
        
        if(!mucDichNhap || !ngayTra) {
            alert("Vui lòng nhập đầy đủ Mục đích và Ngày trả!");
            return;
        }
        
        // Nối tên phòng vào mục đích
        let mucDichGop = `[${phong}] ${mucDichNhap}`;

        fetch('api_borrow.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: currentUser, 
                ma_tb: maTb, 
                muc_dich: mucDichGop, 
                ngay_tra: ngayTra 
            })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if(data.status === 'success') {
                document.getElementById('form_muon').style.display = 'none';
                // Reset form
                document.getElementById('muc_dich_muon').value = '';
                document.getElementById('ngay_tra').value = '';
                loadDuLieuSinhVien(); // Tải lại bảng lịch sử
            }
        })
        .catch(error => {
            console.error('Lỗi mượn:', error);
            alert("Lỗi kết nối máy chủ! (Nhấn F12 -> Tab Console để xem chi tiết)");
        });
    } catch (e) {
        console.error('Lỗi Code JS:', e);
        alert("Lỗi thực thi JavaScript! (Nhấn F12 -> Tab Console để xem chi tiết)");
    }
}


// TRANG SINH VIÊN - Load lịch sử & Báo hỏng

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
                    actionBtn = `<br><button onclick="huyPhieuMuon(${p.id})" style="padding: 4px 8px; font-size: 12px; margin-top: 5px; cursor: pointer; background: #e74c3c; color: white; border: none; border-radius: 3px;">Hủy yêu cầu</button>`;
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
                } else if (p.status === 'Từ chối' || p.status === 'Đã hủy') {
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


// TRANG ADMIN - Load danh sách phiếu mượn & Xử lý

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

// Tính năng: Admin Duyệt hoặc Từ chối phiếu mượn
function xuLyPhieu(id, status) {
    let lyDo = '';
    if (status === 'Từ chối') {
        lyDo = prompt("Nhập lý do từ chối (VD: Trùng lịch, Hỏng...):");
        if (lyDo === null) return; 
    }

    fetch('api_process_borrow.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: id, 
            status: status, 
            ly_do_tu_choi: lyDo 
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            loadPhieuMuon(); // Tải lại bảng phiếu
            loadAdminTabs(); // Cập nhật lại số lượng và trạng thái thiết bị
        }
    })
    .catch(error => console.error("Lỗi xử lý phiếu:", error));
}

function huyPhieuMuon(id) {
    if(!confirm("Bạn có chắc chắn muốn hủy yêu cầu mượn này?")) return;
    
    fetch('api_cancel_borrow.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(data.status === 'success') loadDuLieuSinhVien();
    });
}

function loadAdminTabs() {
    // Tải danh sách Báo hỏng
    fetch('api_get_reports.php').then(res => res.json()).then(data => {
        let html = '';
        let countHong = 0;
        data.forEach(rp => {
            if(rp.status === 'Chờ xử lý') countHong++;
            
            let logText = rp.status === 'Đã sửa xong' ? `Chi phí: ${rp.chi_phi}đ<br><small>${rp.nhat_ky_sua}</small>` : 'Đang chờ';
            
            let btn = rp.status === 'Chờ xử lý' 
                ? `<button onclick="hoanTatBaoTri(${rp.id}, '${rp.thiet_bi}')" style="padding: 5px 10px; background: #2ecc71; color: white; border: none; border-radius: 3px; cursor: pointer;">Sửa xong</button>` 
                : '<span style="color: green; font-weight: bold;">Hoàn tất</span>';
            
            html += `<tr>
                <td>${rp.id}</td>
                <td>${rp.username}</td>
                <td>${rp.thiet_bi}</td>
                <td>${rp.mo_ta}</td>
                <td>${rp.ngay_bao}</td>
                <td>${logText}</td>
                <td>${btn}</td>
            </tr>`;
        });
        let e = document.getElementById('ds_baohong');
        if(e) e.innerHTML = html;
        let statHong = document.getElementById('stat_admin_hong');
        if(statHong) statHong.innerText = countHong;
    });

    // Tải danh sách thiết bị cho Admin
    // Biến toàn cục lưu thiết bị bên trang admin
    if (typeof adminEquipments === 'undefined') {
        window.adminEquipments = [];
    }

    // Tải danh sách thiết bị cho Admin
    fetch('api_get_equipments.php').then(res => res.json()).then(data => {
        window.adminEquipments = data;
        
        let danhSachPhong = [...new Set(data.map(tb => tb.phong ? tb.phong : 'Kho chung'))];
        let dropdown = document.getElementById('loc_phong_admin');
        
        if (dropdown) {
            let currentVal = dropdown.value; // Giữ lại giá trị đang lọc khi tải lại dữ liệu
            let optionsHtml = '<option value="all">-- Tất cả thiết bị --</option>';
            danhSachPhong.forEach(phong => {
                optionsHtml += `<option value="${phong}">${phong}</option>`;
            });
            dropdown.innerHTML = optionsHtml;
            if (danhSachPhong.includes(currentVal)) {
                dropdown.value = currentVal;
            }
        }
        
        renderThietBiAdmin();
        
        let statTb = document.getElementById('stat_admin_tongtb');
        if(statTb) statTb.innerText = data.length; 
    });

    // Tải danh sách Người dùng
    fetch('api_get_users.php').then(res => res.json()).then(data => {
        let html = '';
        data.forEach(u => {
            html += `<tr>
                <td><b>${u.username}</b></td>
                <td>${u.role}</td>
                <td>
                    ${u.role !== 'admin' ? `<button onclick="xoaUser('${u.username}')" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">Xóa</button>` : 'Mặc định'}
                </td>
            </tr>`;
        });
        let e = document.getElementById('ds_nguoidung');
        if(e) e.innerHTML = html;
        let statUser = document.getElementById('stat_admin_user');
        if(statUser) statUser.innerText = data.length;
    });
}

// Hàm hiển thị danh sách thiết bị Admin dựa trên bộ lọc
function renderThietBiAdmin() {
    let dropdown = document.getElementById('loc_phong_admin');
    let selectedPhong = dropdown ? dropdown.value : 'all';
    
    let filteredData = window.adminEquipments;
    if (selectedPhong !== 'all') {
        filteredData = window.adminEquipments.filter(tb => (tb.phong ? tb.phong : 'Kho chung') === selectedPhong);
    }
    
    let html = '';
    filteredData.forEach(tb => {
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
    if(e) e.innerHTML = html || '<tr><td colspan="5" style="text-align:center;">Không có thiết bị</td></tr>';
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


// TÌM KIẾM DỮ LIỆU BẢNG

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


// TRANG CHỦ - Quản lý trạng thái và nạp dữ liệu

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

// Tính năng: Xác nhận đã sửa xong thiết bị
function hoanTatBaoTri(id, maTb) {
    let nhatKy = prompt("Nhập nhật ký sửa chữa (VD: Thay linh kiện...):", "");
    if (nhatKy === null) return; 
    let chiPhi = prompt("Nhập chi phí sửa chữa (VNĐ):", "0");
    if (chiPhi === null) return; 

    fetch('api_manage_report.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, ma_tb: maTb, nhat_ky: nhatKy, chi_phi: chiPhi })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(data.status === 'success') loadAdminTabs();
    });
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


// KHỞI TẠO DỮ LIỆU KHI LOAD TRANG

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