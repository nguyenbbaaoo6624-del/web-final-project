<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(["status" => "error", "message" => "Chưa đăng nhập!"]);
    exit;
}

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 1000; 
$offset = ($page - 1) * $limit;

// Sử dụng Prepared Statement
$sql = "SELECT b.id, b.username, b.ma_tb, b.muc_dich, b.ngay_tra, b.status, b.ly_do_tu_choi, e.ten_tb 
        FROM borrow_logs b 
        LEFT JOIN equipments e ON b.ma_tb = e.ma_tb 
        ORDER BY b.id DESC 
        LIMIT ? OFFSET ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$borrows = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $borrows[] = $row;
    }
}

echo json_encode($borrows);
exit;
?>