<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(["status" => "error", "message" => "Chưa đăng nhập!"]);
    exit;
}

// Truy vấn lấy danh sách báo hỏng (không có tham số từ người dùng nên có thể dùng query trực tiếp)
$sql = "SELECT * FROM report_logs ORDER BY id DESC";
$result = $conn->query($sql);

$reports = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $reports[] = $row;
    }
}

echo json_encode($reports);
exit;
?>