<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$username = $data->username ?? '';
$password = $data->password ?? '';
$role = "sinhvien"; // Mặc định tài khoản tự đăng ký là Sinh viên

if (empty($username) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!"]);
    exit;
}

// Kiểm tra xem tên tài khoản đã tồn tại trong Database chưa (Sử dụng Prepared Statement)
$check_sql = "SELECT * FROM users WHERE username = ?";
$stmt_check = $conn->prepare($check_sql);
$stmt_check->bind_param("s", $username);
$stmt_check->execute();
$check_result = $stmt_check->get_result();

if ($check_result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Tên tài khoản đã tồn tại! Vui lòng chọn tên khác."]);
} else {
    // Nếu chưa tồn tại, tiến hành lưu vào DB bằng Prepared Statement
    $sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    $stmt_insert = $conn->prepare($sql);
    $stmt_insert->bind_param("sss", $username, $password, $role);
    
    if ($stmt_insert->execute()) {
        echo json_encode(["status" => "success", "message" => "Đăng ký thành công! Bạn có thể đăng nhập ngay."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi hệ thống!"]);
    }
}
exit;
?>