<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

// Lấy các phiếu đang chờ duyệt kết hợp với tên thiết bị
$sql = "SELECT b.id, b.username, b.ma_tb, b.muc_dich, b.ngay_tra, e.ten_tb 
        FROM borrow_logs b 
        JOIN equipments e ON b.ma_tb = e.ma_tb 
        WHERE b.status = 'Chờ duyệt'";
$result = mysqli_query($conn, $sql);

$borrows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $borrows[] = $row;
}
echo json_encode($borrows);
?>