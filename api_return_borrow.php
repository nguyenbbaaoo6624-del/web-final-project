<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';
$borrow_id = $data->borrow_id ?? 0;

if (!$borrow_id || empty($action)) {
    echo json_encode(["status" => "error", "message" => "Dữ liệu không hợp lệ!"]);
    exit;
}

// 1. SINH VIÊN: Gửi yêu cầu trả thiết bị
if ($action === 'request_return') {
    $sql = "UPDATE borrow_logs SET status = 'Chờ xác nhận trả' WHERE id = '$borrow_id'";
    if (mysqli_query($conn, $sql)) {
        echo json_encode(["status" => "success", "message" => "Đã gửi yêu cầu trả thiết bị!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi cập nhật CSDL!"]);
    }
}

// 2. ADMIN: Kiểm tra tình trạng & Xác nhận đã nhận lại thiết bị
if ($action === 'confirm_return') {
    $condition = $data->condition ?? 'Bình thường'; // Bình thường / Hỏng hóc / Mất thiết bị
    $ma_tb = $data->ma_tb ?? '';

    // Cập nhật trạng thái phiếu mượn & lưu ghi chú tình trạng trả
    $sql_log = "UPDATE borrow_logs SET status = 'Đã trả', muc_dich = CONCAT(muc_dich, ' [Tình trạng trả: ', '$condition', ']') WHERE id = '$borrow_id'";
    
    // Nếu thiết bị bình thường -> Đổi về 'Sẵn sàng', nếu hỏng hóc -> Đổi thành 'Bảo trì'
    $tb_status = ($condition === 'Bình thường') ? 'Sẵn sàng' : 'Bảo trì';
    $sql_equipment = "UPDATE equipments SET status = '$tb_status' WHERE ma_tb = '$ma_tb'";

    if (mysqli_query($conn, $sql_log) && mysqli_query($conn, $sql_equipment)) {
        echo json_encode(["status" => "success", "message" => "Xác nhận trả thành công!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi xử lý xác nhận!"]);
    }
}
?>