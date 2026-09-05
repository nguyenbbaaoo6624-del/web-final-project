<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(["status" => "error", "message" => "Chưa đăng nhập!"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
// Lấy username trực tiếp từ Session để bảo mật, không tin tưởng dữ liệu từ frontend gửi lên
$username = $_SESSION['user']; 
$old_pass = $data->old_pass ?? '';
$new_pass = $data->new_pass ?? '';

if (empty($old_pass) || empty($new_pass)) {
    echo json_encode(["status" => "error", "message" => "Thiếu thông tin mật khẩu!"]);
    exit;
}

$stmt = $conn->prepare("SELECT password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || $user['password'] !== $old_pass) {
    echo json_encode(["status" => "error", "message" => "Mật khẩu cũ không chính xác!"]);
    exit;
}

$update_stmt = $conn->prepare("UPDATE users SET password = ? WHERE username = ?");
$update_stmt->bind_param("ss", $new_pass, $username);

if ($update_stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Đổi mật khẩu thành công!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi cập nhật CSDL!"]);
}
exit;
?>