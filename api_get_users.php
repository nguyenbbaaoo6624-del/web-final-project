<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$sql = "SELECT username, role FROM users";
$result = mysqli_query($conn, $sql);
$users = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }
}

echo json_encode($users);
?>