<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$id = $data->id ?? 0;

if (!$id) {
    echo json_encode(["status" => "error", "message" => "Thiếu thông tin!"]);
    exit;
}

$sql = "UPDATE borrow_logs SET status = 'Đã hủy' WHERE id = '$id' AND status = 'Pending'";
if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "success", "message" => "Đã hủy phiếu mượn thành công!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi hệ thống!"]);
}
?>