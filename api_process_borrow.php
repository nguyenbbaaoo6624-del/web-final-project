<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Không có quyền thực hiện thao tác này!"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
$id = $data->id ?? 0;
$status = $data->status ?? ''; 
$ly_do = $data->ly_do_tu_choi ?? '';

if (!$id || !$status) {
    echo json_encode(["status" => "error", "message" => "Thiếu dữ liệu!"]);
    exit;
}

// Sử dụng Prepared Statement để lấy ma_tb an toàn
$stmt_q = $conn->prepare("SELECT ma_tb FROM borrow_logs WHERE id = ?");
$stmt_q->bind_param("i", $id);
$stmt_q->execute();
$result = $stmt_q->get_result();
$row = $result->fetch_assoc();
$ma_tb = $row['ma_tb'] ?? '';

if ($status === 'Đã duyệt') {
    $stmt1 = $conn->prepare("UPDATE borrow_logs SET status = 'Đã duyệt' WHERE id = ?");
    $stmt1->bind_param("i", $id);
    
    $stmt2 = $conn->prepare("UPDATE equipments SET status = 'Đang sử dụng' WHERE ma_tb = ?");
    $stmt2->bind_param("s", $ma_tb);
    
    if ($stmt1->execute() && $stmt2->execute()) {
        echo json_encode(["status" => "success", "message" => "Đã duyệt phiếu và cập nhật thiết bị!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi CSDL!"]);
    }
} elseif ($status === 'Từ chối') {
    $stmt = $conn->prepare("UPDATE borrow_logs SET status = 'Từ chối', ly_do_tu_choi = ? WHERE id = ?");
    $stmt->bind_param("si", $ly_do, $id);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Đã từ chối phiếu mượn!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi CSDL!"]);
    }
}
exit;
?>