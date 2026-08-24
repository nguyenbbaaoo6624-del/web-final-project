<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$sql = "SELECT * FROM equipments";
$result = mysqli_query($conn, $sql);

$equipments = [];
while ($row = mysqli_fetch_assoc($result)) {
    $equipments[] = $row;
}

echo json_encode($equipments);
?>