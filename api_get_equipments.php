<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(["status" => "error", "message" => "Chưa đăng nhập!"]);
    exit;
}

$sql = "SELECT * FROM equipments";
$result = $conn->query($sql);

$equipments = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $equipments[] = $row;
    }
}

echo json_encode($equipments);
exit;
?>