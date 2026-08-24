//  Xử lý đăng nhập 
function xuLyDangNhap() {
    let u = document.getElementById('username').value;
    let p = document.getElementById('password').value;
    let r = document.getElementById('role').value; // Lấy giá trị role từ Dropdown trên giao diện

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
            // Đối chiếu role trên giao diện với role trong cơ sở dữ liệu
            if (data.role !== r) {
                alert("Lỗi phân quyền: Tài khoản của bạn không có quyền đăng nhập dưới vai trò này!");
                return; // Ngắt luồng, chặn chuyển trang
            }

            // Nếu khớp, cho phép đăng nhập và chuyển trang
            localStorage.setItem("currentUser", u); 
            window.location.href = data.role === 'sinhvien' ? 'sinhvien.html' : 'admin.html';
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Lỗi:', error));
}

//  Xử lý trang sinh viên 
function loadThietBi() {
    fetch('api_get_equipments.php')
    .then(res => res.json())
    .then(data => {
        let html = '';
        data.forEach(tb => {
            html += `<tr>
                <td>${tb.ma_tb}</td>
                <td>${tb.ten_tb}</td>
                <td>${tb.status}</td>
                <td><button onclick="chonThietBi('${tb.ma_tb}', '${tb.ten_tb}')">Chọn mượn</button></td>
            </tr>`;
        });
        document.getElementById('ds_thietbi').innerHTML = html;
    });
}

function chonThietBi(ma, ten) {
    document.getElementById('tb_duoc_chon').value = ma + ' - ' + ten;
    document.getElementById('tb_duoc_chon').setAttribute('data-matb', ma);
}

function guiYeuCau() {
    let currentUser = localStorage.getItem("currentUser");
    let ma_tb = document.getElementById('tb_duoc_chon').getAttribute('data-matb');
    let ngayTra = document.getElementById('ngay_tra').value;
    let mucDich = document.getElementById('muc_dich').value;

    if (!ma_tb || !ngayTra) {
        alert("Vui lòng chọn thiết bị và ngày trả!");
        return;
    }

    fetch('api_create_borrow.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: currentUser, 
            ma_tb: ma_tb, 
            ngay_tra: ngayTra, 
            muc_dich: mucDich 
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        document.getElementById('formMuon').reset();
    });
}

// Xử lý trang admin 
function loadPhieuMuon() {
    fetch('api_get_borrows.php')
    .then(res => res.json())
    .then(data => {
        let html = '';
        data.forEach(phieu => {
            html += `<tr id="phieu_${phieu.id}">
                <td>PM-${phieu.id}</td>
                <td>${phieu.username}</td>
                <td>${phieu.ten_tb}</td>
                <td>${phieu.muc_dich}</td>
                <td>
                    <button onclick="xuLyPhieu(${phieu.id}, 'Đã duyệt')" style="background-color: #2ecc71;">Duyệt</button>
                    <button onclick="xuLyPhieu(${phieu.id}, 'Từ chối')" style="background-color: #e74c3c;">Từ chối</button>
                </td>
            </tr>`;
        });
        document.getElementById('ds_phieumuon').innerHTML = html;
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
            alert("Đã " + hanhDong + " yêu cầu.");
            document.getElementById('phieu_' + idPhieu).style.display = 'none';
        }
    });
}

// Tự động chạy hàm load dữ liệu khi mở trang
if (window.location.pathname.includes('sinhvien.html')) loadThietBi();
if (window.location.pathname.includes('admin.html')) loadPhieuMuon();