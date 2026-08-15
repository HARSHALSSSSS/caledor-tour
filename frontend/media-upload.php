<?php
/**
 * Persistent media uploads for cPanel.
 * Files are saved in /media and the URL is stored in MySQL by the admin CMS.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

function caledorAuthHeader() {
  $header = $_SERVER['HTTP_AUTHORIZATION']
    ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
    ?? '';
  if ($header === '' && !empty($_SERVER['HTTP_X_CALEDOR_TOKEN'])) {
    $header = 'Bearer ' . $_SERVER['HTTP_X_CALEDOR_TOKEN'];
  }
  return $header;
}

function caledorVerifyAdmin($authHeader) {
  if (!preg_match('/Bearer\s+\S+/', $authHeader)) {
    return false;
  }
  $url = 'https://caledor-tour.onrender.com/api/auth/me';
  $body = false;
  $status = 0;

  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 45,
      CURLOPT_HTTPHEADER => [$authHeader ? 'Authorization: ' . $authHeader : ''],
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
  } else {
    $ctx = stream_context_create([
      'http' => [
        'method' => 'GET',
        'header' => "Authorization: {$authHeader}\r\n",
        'timeout' => 45,
        'ignore_errors' => true,
      ],
    ]);
    $body = @file_get_contents($url, false, $ctx);
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
      $status = (int) $m[1];
    }
  }

  if ($status !== 200 || !$body) {
    return false;
  }
  $data = json_decode($body, true);
  return is_array($data) && !empty($data['user']);
}

$auth = caledorAuthHeader();
if (!caledorVerifyAdmin($auth)) {
  http_response_code(401);
  echo json_encode(['error' => 'Login required']);
  exit;
}

if (empty($_FILES['image']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
  http_response_code(400);
  echo json_encode(['error' => 'No image uploaded']);
  exit;
}

$file = $_FILES['image'];
if (!empty($file['error'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Upload failed']);
  exit;
}

$original = strtolower((string) $file['name']);
$ext = pathinfo($original, PATHINFO_EXTENSION);
$allowed = [
  'jpg' => true, 'jpeg' => true, 'png' => true, 'gif' => true, 'webp' => true, 'avif' => true,
  'mp4' => true, 'webm' => true, 'ogg' => true, 'ogv' => true, 'mov' => true, 'm4v' => true,
];
if ($ext === '' || empty($allowed[$ext])) {
  http_response_code(400);
  echo json_encode(['error' => 'Only image or video files are allowed']);
  exit;
}

$dir = __DIR__ . '/media';
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
  http_response_code(500);
  echo json_encode(['error' => 'Could not create media folder']);
  exit;
}

$safeBase = preg_replace('/[^a-z0-9._-]+/i', '-', pathinfo($original, PATHINFO_FILENAME));
$safeBase = trim($safeBase, '-') ?: 'file';
$filename = date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '-' . $safeBase . '.' . $ext;
$target = $dir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $target)) {
  http_response_code(500);
  echo json_encode(['error' => 'Could not save file']);
  exit;
}

echo json_encode([
  'success' => true,
  'url' => '/media/' . $filename,
]);
