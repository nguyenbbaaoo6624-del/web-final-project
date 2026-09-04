<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$id = $data->id ?? 0;
$thiet_bi = $data->ma_tb ?? ''; 
$chi_phi = $data->chi_phi ?? 0;
$nhat_ky = $data->nhat_ky ?? '';

if (!$id || empty($thiet_bi)) {
    echo json_encode(["status" => "error", "message" => "Thiếu dữ liệu!"]);
    exit;
}

$sql1 = "UPDATE report_logs SET status = 'Đã sửa xong', chi_phi = '$chi_phi', nhat_ky_sua = '$nhat_ky' WHERE id = '$id'";
$sql2 = "UPDATE equipments SET status = 'Sẵn sàng' WHERE ma_tb = '$thiet_bi' OR ten_tb = '$thiet_bi'";

if (mysqli_query($conn, $sql1) && mysqli_query($conn, $sql2)) {
    echo json_encode(["status" => "success", "message" => "Đã lưu nhật ký, chi phí và cập nhật thiết bị thành Sẵn sàng!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL!"]);
}
?>