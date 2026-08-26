<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$username = $data->username;
$password = $data->password;
$role = "sinhvien"; // Mặc định tài khoản tự đăng ký là Sinh viên

// Kiểm tra xem tên tài khoản đã tồn tại trong Database chưa
$check_sql = "SELECT * FROM users WHERE username = '$username'";
$check_result = mysqli_query($conn, $check_sql);

if (mysqli_num_rows($check_result) > 0) {
    echo json_encode(["status" => "error", "message" => "Tên tài khoản đã tồn tại! Vui lòng chọn tên khác."]);
} else {
    // Nếu chưa tồn tại, tiến hành lưu vào DB
    $sql = "INSERT INTO users (username, password, role) VALUES ('$username', '$password', '$role')";
    if (mysqli_query($conn, $sql)) {
        echo json_encode(["status" => "success", "message" => "Đăng ký thành công! Bạn có thể đăng nhập ngay."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . mysqli_error($conn)]);
    }
}
?>