<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(["status" => "error", "message" => "Chưa đăng nhập!"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
// Lấy username trực tiếp từ Session để bảo mật, không lấy từ frontend
$username = $_SESSION['user'];
$thiet_bi = $data->thiet_bi ?? '';
$mo_ta = $data->mo_ta ?? '';

if (empty($thiet_bi) || empty($mo_ta)) {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập đủ thông tin!"]);
    exit;
}

// 1. Lưu thông tin báo hỏng bằng Prepared Statement (Chống SQL Injection)
$sql = "INSERT INTO report_logs (username, thiet_bi, mo_ta) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $username, $thiet_bi, $mo_ta);

if ($stmt->execute()) {
    // 2. Tự động chuyển trạng thái thiết bị sang "Bảo trì" ngay khi sinh viên báo hỏng
    $sql_equip = "UPDATE equipments SET status = 'Bảo trì' WHERE ten_tb = ? AND status = 'Đang sử dụng' LIMIT 1";
    $stmt_equip = $conn->prepare($sql_equip);
    $stmt_equip->bind_param("s", $thiet_bi);
    $stmt_equip->execute();

    echo json_encode(["status" => "success", "message" => "Đã gửi báo hỏng thành công! Thiết bị đã được chuyển sang trạng thái Bảo trì."]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi cập nhật CSDL!"]);
}
exit;
?>