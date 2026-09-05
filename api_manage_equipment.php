<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Không có quyền thực hiện thao tác này!"]);
    exit;
}

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

$success = false;

// Sử dụng Prepared Statement cho từng hành động để chống SQL Injection
if ($action === 'add') {
    $stmt = $conn->prepare("INSERT INTO equipments (ma_tb, ten_tb, phong, status) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $ma_tb, $ten_tb, $phong, $status);
    $success = $stmt->execute();
} elseif ($action === 'update') {
    $stmt = $conn->prepare("UPDATE equipments SET ten_tb = ?, phong = ?, status = ? WHERE ma_tb = ?");
    $stmt->bind_param("ssss", $ten_tb, $phong, $status, $ma_tb);
    $success = $stmt->execute();
} elseif ($action === 'delete') {
    $stmt = $conn->prepare("DELETE FROM equipments WHERE ma_tb = ?");
    $stmt->bind_param("s", $ma_tb);
    $success = $stmt->execute();
}

if ($success) {
    echo json_encode(["status" => "success", "message" => "Thao tác thành công!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL hoặc thiết bị đang có liên kết dữ liệu!"]);
}
exit;
?>