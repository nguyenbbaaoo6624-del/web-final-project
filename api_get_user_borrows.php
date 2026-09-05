<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(["status" => "error", "message" => "Chưa đăng nhập!"]);
    exit;
}

$username = $_GET['username'] ?? '';

if (empty($username)) {
    echo json_encode([]);
    exit;
}

// Sử dụng Prepared Statement (Chống SQL Injection)
$sql = "SELECT b.id, b.ngay_tra, b.status, e.ten_tb 
        FROM borrow_logs b 
        JOIN equipments e ON b.ma_tb = e.ma_tb 
        WHERE b.username = ? 
        ORDER BY b.id DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$user_borrows = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $user_borrows[] = $row;
    }
}

echo json_encode($user_borrows);
exit;
?>