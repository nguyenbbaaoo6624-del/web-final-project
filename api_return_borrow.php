<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(["status" => "error", "message" => "Chưa đăng nhập!"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';
$borrow_id = $data->borrow_id ?? 0;
$username = $_SESSION['user'];
$role = $_SESSION['role'] ?? '';

if (!$borrow_id || empty($action)) {
    echo json_encode(["status" => "error", "message" => "Dữ liệu không hợp lệ!"]);
    exit;
}

// 1. SINH VIÊN: Gửi yêu cầu trả thiết bị (Chỉ cho phép sinh viên sở hữu phiếu mượn đó)
if ($action === 'request_return') {
    $sql = "UPDATE borrow_logs SET status = 'Chờ xác nhận trả' WHERE id = ? AND username = ? AND status = 'Đã duyệt'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $borrow_id, $username);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["status" => "success", "message" => "Đã gửi yêu cầu trả thiết bị!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Không thể gửi yêu cầu! Phiếu không tồn tại hoặc chưa được duyệt."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi cập nhật CSDL!"]);
    }
}

// 2. ADMIN: Kiểm tra tình trạng & Xác nhận đã nhận lại thiết bị (Yêu cầu quyền admin)
elseif ($action === 'confirm_return') {
    if ($role !== 'admin') {
        echo json_encode(["status" => "error", "message" => "Không có quyền thực hiện thao tác này!"]);
        exit;
    }

    $condition = $data->condition ?? 'Bình thường'; 
    $ma_tb = $data->ma_tb ?? '';

    // Cập nhật trạng thái phiếu mượn & lưu ghi chú tình trạng trả sử dụng Prepared Statement
    $sql_log = "UPDATE borrow_logs SET status = 'Đã trả', muc_dich = CONCAT(muc_dich, ' [Tình trạng trả: ', ?, ']') WHERE id = ?";
    $stmt_log = $conn->prepare($sql_log);
    $stmt_log->bind_param("si", $condition, $borrow_id);
    
    // Nếu thiết bị bình thường -> Đổi về 'Sẵn sàng', ngược lại -> 'Bảo trì'
    $tb_status = ($condition === 'Bình thường') ? 'Sẵn sàng' : 'Bảo trì';
    $sql_equipment = "UPDATE equipments SET status = ? WHERE ma_tb = ?";
    $stmt_equipment = $conn->prepare($sql_equipment);
    $stmt_equipment->bind_param("ss", $tb_status, $ma_tb);

    if ($stmt_log->execute() && $stmt_equipment->execute()) {
        echo json_encode(["status" => "success", "message" => "Xác nhận trả thành công!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi xử lý xác nhận!"]);
    }
}
exit;
?>