<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$username = $data->username ?? '';
$ma_tb = $data->ma_tb ?? '';
$muc_dich = $data->muc_dich ?? '';
$ngay_tra = $data->ngay_tra ?? '';

if (empty($username) || empty($ma_tb) || empty($muc_dich) || empty($ngay_tra)) {
    echo json_encode(["status" => "error", "message" => "Thiếu thông tin bắt buộc!"]);
    exit;
}

$sql = "INSERT INTO borrow_logs (username, ma_tb, muc_dich, ngay_tra, status) VALUES ('$username', '$ma_tb', '$muc_dich', '$ngay_tra', 'Pending')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "success", "message" => "Đăng ký thành công! Đang chờ Admin duyệt."]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL: " . mysqli_error($conn)]);
}
?>