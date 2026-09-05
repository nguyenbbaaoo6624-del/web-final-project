<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(["status" => "error", "message" => "Chưa đăng nhập!"]);
    exit;
}

$sql = "SELECT username, role, mssv FROM users";
$result = $conn->query($sql);
$users = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

echo json_encode($users);
exit;
?>