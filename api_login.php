<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$username = $data->username ?? '';
$password = $data->password ?? '';

$stmt = $conn->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    $_SESSION['user'] = $username;
    $_SESSION['role'] = $row['role'];
    
    echo json_encode(["status" => "success", "role" => $row['role']]);
} else {
    echo json_encode(["status" => "error", "message" => "Sai tài khoản hoặc mật khẩu!"]);
}
exit;
?>