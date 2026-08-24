<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$id = $data->id;
$action = $data->action; // Sẽ nhận giá trị 'Đã duyệt' hoặc 'Từ chối'

$sql = "UPDATE borrow_logs SET status = '$action' WHERE id = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}
?>