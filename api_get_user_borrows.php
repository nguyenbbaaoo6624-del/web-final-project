<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

// Lấy username từ tham số URL (VD: api_get_user_borrows.php?username=sinhvien1)
$username = $_GET['username'] ?? '';

if (empty($username)) {
    echo json_encode([]);
    exit;
}

// Truy vấn lấy lịch sử mượn của user, sắp xếp mới nhất lên đầu
$sql = "SELECT b.id, b.ngay_tra, b.status, b.ngay_tao, e.ten_tb 
        FROM borrow_logs b 
        JOIN equipments e ON b.ma_tb = e.ma_tb 
        WHERE b.username = '$username' 
        ORDER BY b.id DESC";

$result = mysqli_query($conn, $sql);

$user_borrows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $user_borrows[] = $row;
}

echo json_encode($user_borrows);
?>