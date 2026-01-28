<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $speed = $data['speed'] ?? 0;
    $log = "Speed: {$speed} MB/s - " . date('Y-m-d H:i:s') . "\n";
    file_put_contents('speed_logs.txt', $log, FILE_APPEND);
    echo json_encode(['status' => 'logged']);
}
?> 
