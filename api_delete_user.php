<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$username = $data->username;

// Không cho phép xóa tài khoản admin gốc đang đăng nhập
if ($username === 'admin') {
    echo json_encode(["status" => "error", "message" => "Không thể xóa tài khoản Admin gốc!"]);
    exit;
}

$sql = "DELETE FROM users WHERE username='$username'";
if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
}
?>