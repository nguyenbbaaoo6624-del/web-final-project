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
$chi_phi = $data->chi_phi ?? 0;
$nhat_ky = $data->nhat_ky ?? '';
$thiet_bi = $data->thiet_bi ?? ''; 

if (!$id) {
    echo json_encode(["status" => "error", "message" => "Thiếu ID báo cáo!"]);
    exit;
}

// 1. Cập nhật phiếu báo hỏng thành Đã sửa xong, lưu chi phí và nhật ký (Đồng bộ tên bảng report_logs)
$sql_report = "UPDATE report_logs SET status = 'Đã sửa xong', chi_phi = ?, nhat_ky_sua = ? WHERE id = ?";
$stmt_report = $conn->prepare($sql_report);
$stmt_report->bind_param("dsi", $chi_phi, $nhat_ky, $id);

// 2. Tự động chuyển trạng thái thiết bị từ "Bảo trì" về "Sẵn sàng"
$sql_equip = "UPDATE equipments SET status = 'Sẵn sàng' WHERE ten_tb = ? AND status = 'Bảo trì' LIMIT 1";
$stmt_equip = $conn->prepare($sql_equip);
$stmt_equip->bind_param("s", $thiet_bi);

if ($stmt_report->execute()) {
    // Nếu có tên thiết bị được gửi lên, chạy lệnh mở khóa thiết bị
    if (!empty($thiet_bi)) {
        $stmt_equip->execute();
    }
    
    echo json_encode(["status" => "success", "message" => "Lưu nhật ký thành công! Thiết bị đã được đưa về trạng thái Sẵn sàng."]);
} else {
    echo json_encode(["status" => "error", "message" => "Lỗi truy vấn CSDL!"]);
}
exit;
?>