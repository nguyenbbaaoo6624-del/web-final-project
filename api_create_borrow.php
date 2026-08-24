<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$username = $data->username;
$ma_tb = $data->ma_tb;
$ngay_tra = $data->ngay_tra;
$muc_dich = $data->muc_dich;

$sql = "INSERT INTO borrow_logs (username, ma_tb, ngay_tra, muc_dich, status) 
        VALUES ('$username', '$ma_tb', '$ngay_tra', '$muc_dich', 'Chờ duyệt')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "success", "message" => "Gửi yêu cầu mượn thành công!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi: " . mysqli_error($conn)]);
}
?>