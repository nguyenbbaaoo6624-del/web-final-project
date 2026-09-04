<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$sql = "SELECT b.id, b.username, b.ma_tb, b.muc_dich, b.ngay_tra, b.status, b.ly_do_tu_choi, e.ten_tb 
        FROM borrow_logs b 
        LEFT JOIN equipments e ON b.ma_tb = e.ma_tb 
        ORDER BY b.id DESC";

$result = mysqli_query($conn, $sql);
$borrows = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $borrows[] = $row;
    }
}

echo json_encode($borrows);
?>