<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$username = $data->username ?? '';

if (empty($username) || $username === 'admin') {
    echo json_encode(["status" => "error", "message" => "Không thể xóa tài khoản này!"]);
    exit;
}

$sql = "DELETE FROM users WHERE username = '$username'";
if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "success", "message" => "Đã xóa tài khoản!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi: Tài khoản đang có dữ liệu liên kết!"]);
}
?>