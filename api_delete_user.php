<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

// Xác thực quyền bảo mật (Session) và kiểm tra phân quyền Admin
if (!isset($_SESSION['user']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Không có quyền thực hiện thao tác này!"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
$username = $data->username ?? '';

// Chặn xóa các tài khoản không hợp lệ, tài khoản admin gốc, hoặc tự xóa chính mình
if (empty($username) || $username === 'admin' || $username === $_SESSION['user']) {
    echo json_encode(["status" => "error", "message" => "Không thể xóa tài khoản này!"]);
    exit;
}

// Sử dụng Prepared Statement (Chống SQL Injection)
$sql = "DELETE FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["status" => "success", "message" => "Đã xóa tài khoản thành công!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Tài khoản không tồn tại!"]);
    }
} else {
    // Lỗi thường xảy ra do Foreign Key Constraint (tài khoản còn dính phiếu mượn/báo hỏng)
    echo json_encode(["status" => "error", "message" => "Lỗi: Tài khoản đang có dữ liệu liên kết!"]);
}
exit;
?>