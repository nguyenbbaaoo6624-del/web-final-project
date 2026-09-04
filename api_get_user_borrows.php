<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$username = $_GET['username'] ?? '';

if (empty($username)) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT b.id, b.ngay_tra, b.status, e.ten_tb 
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