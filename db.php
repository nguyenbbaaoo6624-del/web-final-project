<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "ql_muonthietbi";

$conn = mysqli_connect($host, $user, $pass, $dbname);

if (!$conn) {
    die(json_encode(["status" => "error", "message" => "Lỗi kết nối CSDL: " . mysqli_connect_error()]));
}
mysqli_set_charset($conn, "utf8mb4");
?>