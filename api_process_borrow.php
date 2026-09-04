<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$id = $data->id ?? 0;
$status = $data->status ?? ''; 
$ly_do = $data->ly_do_tu_choi ?? '';

if (!$id || !$status) {
    echo json_encode(["status" => "error", "message" => "Thiếu dữ liệu!"]);
    exit;
}

$query = "SELECT ma_tb FROM borrow_logs WHERE id = '$id'";
$result = mysqli_query($conn, $query);
$row = mysqli_fetch_assoc($result);
$ma_tb = $row['ma_tb'] ?? '';

if ($status === 'Đã duyệt') {
    $sql1 = "UPDATE borrow_logs SET status = 'Đã duyệt' WHERE id = '$id'";
    $sql2 = "UPDATE equipments SET status = 'Đang sử dụng' WHERE ma_tb = '$ma_tb'";
    
    if (mysqli_query($conn, $sql1) && mysqli_query($conn, $sql2)) {
        echo json_encode(["status" => "success", "message" => "Đã duyệt phiếu và cập nhật thiết bị!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi CSDL!"]);
    }
} elseif ($status === 'Từ chối') {
    $sql = "UPDATE borrow_logs SET status = 'Từ chối', ly_do_tu_choi = '$ly_do' WHERE id = '$id'";
    if (mysqli_query($conn, $sql)) {
        echo json_encode(["status" => "success", "message" => "Đã từ chối phiếu mượn!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi CSDL!"]);
    }
}
?>