// ==========================================
// XỬ LÝ ĐĂNG NHẬP
// ==========================================
function xuLyDangNhap() {
    let u = document.getElementById('username').value;
    let p = document.getElementById('password').value;
    let r = document.getElementById('role').value;

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
            // Đối chiếu role giao diện với role trong database
            if (data.role !== r) {
                alert("Lỗi phân quyền: Tài khoản không có quyền đăng nhập vai trò này!");
                return;
            }
            // Lưu thông tin người dùng vào localStorage
            localStorage.setItem("currentUser", u);
            localStorage.setItem("currentRole", data.role);

            // Chuyển trang theo role
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

// ==========================================
// XỬ LÝ ĐĂNG KÝ TÀI KHOẢN
// ==========================================
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
            window.location.href = 'index.html';
        }
    })
    .catch(error => {
        console.error('Lỗi đăng ký:', error);
        alert("Không thể kết nối tới server!");
    });
}

// ==========================================
// TRANG SINH VIÊN - Load danh sách thiết bị
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
                        <button onclick="chonThietBi('${tb.ma_tb}', '${tb.ten_tb}')">
                            Chọn mượn
                        </button>
                    </td>
                </tr>`;
            });
        }
        document.getElementById('ds_thietbi').innerHTML = html;
    })
    .catch(error => {
        console.error('Lỗi load thiết bị:', error);
        alert("Không thể tải danh sách thiết bị!");
    });
}

function chonThietBi(ma, ten) {
    document.getElementById('tb_duoc_chon').value = ma + ' - ' + ten;
    document.getElementById('tb_duoc_chon').setAttribute('data-matb', ma);
}

function guiYeuCau() {
    let currentUser = localStorage.getItem("currentUser");
    let ma_tb       = document.getElementById('tb_duoc_chon').getAttribute('data-matb');
    let ngayTra     = document.getElementById('ngay_tra').value;
    let mucDich     = document.getElementById('muc_dich').value;

    // Kiểm tra đã đăng nhập chưa
    if (!currentUser) {
        alert("Bạn chưa đăng nhập!");
        window.location.href = 'index.html';
        return;
    }

    if (!ma_tb) {
        alert("Vui lòng chọn thiết bị từ danh sách!");
        return;
    }

    if (!ngayTra) {
        alert("Vui lòng chọn ngày trả!");
        return;
    }

    fetch('api_create_borrow.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: currentUser,
            ma_tb:    ma_tb,
            ngay_tra: ngayTra,
            muc_dich: mucDich
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.status === "success") {
            document.getElementById('formMuon').reset();
            loadThietBi();  // load lại danh sách sau khi gửi yêu cầu
        }
    })
    .catch(error => {
        console.error('Lỗi gửi yêu cầu:', error);
        alert("Không thể gửi yêu cầu!");
    });
}

// ==========================================
// TRANG ADMIN - Load danh sách phiếu mượn
// ==========================================
function loadPhieuMuon() {
    fetch('api_get_borrows.php')
    .then(res => res.json())
    .then(data => {
        let html = '';

        if (data.length === 0) {
            html = '<tr><td colspan="5" style="text-align:center;">Không có yêu cầu nào đang chờ duyệt</td></tr>';
        } else {
            data.forEach(phieu => {
                html += `<tr id="phieu_${phieu.id}">
                    <td>PM-${phieu.id}</td>
                    <td>${phieu.username}</td>
                    <td>${phieu.ten_tb}</td>
                    <td>${phieu.muc_dich}</td>
                    <td>
                        <button onclick="xuLyPhieu(${phieu.id}, 'Đã duyệt')"
                                style="background-color:#2ecc71;">Duyệt</button>
                        <button onclick="xuLyPhieu(${phieu.id}, 'Từ chối')"
                                style="background-color:#e74c3c;">Từ chối</button>
                    </td>
                </tr>`;
            });
        }
        document.getElementById('ds_phieumuon').innerHTML = html;
    })
    .catch(error => {
        console.error('Lỗi load phiếu mượn:', error);
        alert("Không thể tải danh sách phiếu mượn!");
    });
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
            // Ẩn hàng đó đi sau khi xử lý
            document.getElementById('phieu_' + idPhieu).style.display = 'none';
        } else {
            alert("Có lỗi xảy ra: " + data.message);
        }
    })
    .catch(error => {
        console.error('Lỗi xử lý phiếu:', error);
        alert("Không thể xử lý yêu cầu!");
    });
}

// ==========================================
// TỰ ĐỘNG LOAD DỮ LIỆU KHI MỞ TRANG
// ==========================================
window.onload = function() {
    if (window.location.pathname.includes('sinhvien.html')) {
        loadThietBi();
    }
    if (window.location.pathname.includes('admin.html')) {
        loadPhieuMuon();
    }
}