<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

// Lấy toàn bộ phiếu mượn và bổ sung cột b.status, sắp xếp mới nhất lên đầu
$sql = "SELECT b.id, b.username, b.ma_tb, b.muc_dich, b.ngay_tra, b.status, e.ten_tb 
        FROM borrow_logs b 
        JOIN equipments e ON b.ma_tb = e.ma_tb 
        ORDER BY b.id DESC";
        
$result = mysqli_query($conn, $sql);

$borrows = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Đồng bộ từ khóa trạng thái với mã Javascript hiện tại
    if ($row['status'] === 'Chờ duyệt') {
        $row['status'] = 'Pending';
    }
    $borrows[] = $row;
}

echo json_encode($borrows);
?>