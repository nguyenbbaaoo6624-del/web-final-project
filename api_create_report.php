<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';
$data = json_decode(file_get_contents("php://input"));
$username = $data->username;
$thiet_bi = $data->thiet_bi;
$mo_ta = $data->mo_ta;

$sql = "INSERT INTO report_logs (username, thiet_bi, mo_ta) VALUES ('$username', '$thiet_bi', '$mo_ta')";
if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "success", "message" => "Đã gửi báo hỏng thành công!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi: " . mysqli_error($conn)]);
}
?>