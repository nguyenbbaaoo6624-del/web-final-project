<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents("php://input"));

// Nhận dữ liệu từ Frontend gửi lên
$username = $data->username;
$ma_tb = $data->ma_tb;
$ngay_tra = $data->ngay_tra;
$muc_dich = isset($data->muc_dich) ? $data->muc_dich : '';
$status = 'Pending'; // Ép cứng trạng thái mặc định khi tạo mới là Pending

// Lệnh Insert đầy đủ các cột
$sql = "INSERT INTO borrow_logs (username, ma_tb, ngay_tra, muc_dich, status) 
        VALUES ('$username', '$ma_tb', '$ngay_tra', '$muc_dich', '$status')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "success", "message" => "Gửi yêu cầu mượn thành công!"]);
} else {
    // Trả về chi tiết lỗi SQL nếu có
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL: " . mysqli_error($conn)]);
}
?>