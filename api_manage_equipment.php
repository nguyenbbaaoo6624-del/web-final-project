<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';
$ma_tb = $data->ma_tb ?? '';
$ten_tb = $data->ten_tb ?? '';
$phong = $data->phong ?? 'Kho chung';
$status = $data->status ?? 'Sẵn sàng';

if (empty($action) || empty($ma_tb)) {
    echo json_encode(["status" => "error", "message" => "Thiếu dữ liệu!"]);
    exit;
}

if ($action === 'add') {
    $sql = "INSERT INTO equipments (ma_tb, ten_tb, phong, status) VALUES ('$ma_tb', '$ten_tb', '$phong', '$status')";
} elseif ($action === 'update') {
    $sql = "UPDATE equipments SET ten_tb='$ten_tb', phong='$phong', status='$status' WHERE ma_tb='$ma_tb'";
} elseif ($action === 'delete') {
    $sql = "DELETE FROM equipments WHERE ma_tb='$ma_tb'";
}

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "success", "message" => "Thao tác thành công!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL: " . mysqli_error($conn)]);
}
?>