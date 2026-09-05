<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(["status" => "error", "message" => "Chưa đăng nhập!"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
$id = $data->id ?? 0;
$username = $_SESSION['user'];

if (!$id) {
    echo json_encode(["status" => "error", "message" => "Thiếu thông tin!"]);
    exit;
}

// Sử dụng Prepared Statement để chống SQL Injection và đảm bảo người dùng chỉ có thể hủy phiếu của chính mình
$sql = "UPDATE borrow_logs SET status = 'Đã hủy' WHERE id = ? AND username = ? AND status = 'Pending'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $id, $username);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["status" => "success", "message" => "Đã hủy phiếu mượn thành công!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Không thể hủy! Phiếu không tồn tại, đã xử lý hoặc không thuộc về bạn."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi hệ thống!"]);
}
exit;
?>