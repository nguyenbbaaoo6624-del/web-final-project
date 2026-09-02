<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';
$sql = "SELECT * FROM report_logs ORDER BY id DESC";
$result = mysqli_query($conn, $sql);
$reports = [];
while ($row = mysqli_fetch_assoc($result)) {
    $reports[] = $row;
}
echo json_encode($reports);
?>