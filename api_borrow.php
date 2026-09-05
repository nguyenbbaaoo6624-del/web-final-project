<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

// Xác thực quyền bảo mật (Session)
if (!isset($_SESSION['user'])) {
    echo json_encode(["status" => "error", "message" => "Chưa đăng nhập!"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
// Lấy username trực tiếp từ Session để bảo mật, chống giả mạo từ Frontend
$username = $_SESSION['user'];
$ma_tb = $data->ma_tb ?? '';
$muc_dich = $data->muc_dich ?? '';
$ngay_tra = $data->ngay_tra ?? '';

if (empty($username) || empty($ma_tb) || empty($muc_dich) || empty($ngay_tra)) {
    echo json_encode(["status" => "error", "message" => "Thiếu thông tin bắt buộc!"]);
    exit;
}

// Kiểm tra giới hạn mượn 6 thiết bị
$check_sql = "SELECT COUNT(*) as total FROM borrow_logs WHERE username = ? AND status IN ('Pending', 'Đã duyệt', 'Chờ xác nhận trả')";
$stmt_check = $conn->prepare($check_sql);
$stmt_check->bind_param("s", $username);
$stmt_check->execute();
$result = $stmt_check->get_result();
$row = $result->fetch_assoc();

if ($row['total'] >= 6) {
    echo json_encode(["status" => "error", "message" => "Đã đạt giới hạn tối đa! Bạn đang giữ hoặc chờ duyệt 6 thiết bị."]);
    exit;
}

$insert_sql = "INSERT INTO borrow_logs (username, ma_tb, muc_dich, ngay_tra, status) VALUES (?, ?, ?, ?, 'Pending')";
$stmt_insert = $conn->prepare($insert_sql);
$stmt_insert->bind_param("ssss", $username, $ma_tb, $muc_dich, $ngay_tra);

if ($stmt_insert->execute()) {
    echo json_encode(["status" => "success", "message" => "Đăng ký thành công! Đang chờ Admin duyệt."]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL!"]);
}
exit;
?>