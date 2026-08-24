<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "ql_muonthietbi";

$conn = mysqli_connect($host, $user, $pass, $dbname);
mysqli_set_charset($conn, "utf8");

if (!$conn) {
    die("Lỗi kết nối CSDL: " . mysqli_connect_error());
}
?>