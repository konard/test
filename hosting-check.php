<?php
/**
 * Hosting Requirements Checker for Anti-Corruption Monitoring System
 * For hostia.net "Business" plan: PHP 8.1, MySQL 8.0, 512 MB RAM
 */

echo "<h1>Проверка требований хостинга</h1>";
echo "<style>body{font-family:Arial,sans-serif;max-width:800px;margin:20px auto;}.ok{color:green;}.error{color:red;}.warning{color:orange;}</style>";

$errors = [];
$warnings = [];
$checks = [];

// PHP Version Check
$phpVersion = phpversion();
$checks[] = ['PHP Version', $phpVersion, version_compare($phpVersion, '8.1.0', '>=')];
if (version_compare($phpVersion, '8.1.0', '<')) {
    $errors[] = "PHP 8.1 или выше требуется. Текущая версия: $phpVersion";
}

// Memory Limit Check
$memoryLimit = ini_get('memory_limit');
$memoryBytes = return_bytes($memoryLimit);
$requiredBytes = 256 * 1024 * 1024; // 256M
$checks[] = ['Memory Limit', $memoryLimit, $memoryBytes >= $requiredBytes];
if ($memoryBytes < $requiredBytes) {
    $errors[] = "Требуется минимум 256M памяти. Текущее значение: $memoryLimit";
}

// Upload Size Check
$uploadMaxFilesize = ini_get('upload_max_filesize');
$postMaxSize = ini_get('post_max_size');
$uploadBytes = return_bytes($uploadMaxFilesize);
$requiredUploadBytes = 64 * 1024 * 1024; // 64M
$checks[] = ['Upload Max Filesize', $uploadMaxFilesize, $uploadBytes >= $requiredUploadBytes];
if ($uploadBytes < $requiredUploadBytes) {
    $warnings[] = "Рекомендуется upload_max_filesize = 64M. Текущее значение: $uploadMaxFilesize";
}

// Required PHP Extensions
$requiredExtensions = [
    'pdo_mysql' => 'PDO MySQL',
    'mbstring' => 'Multibyte String',
    'openssl' => 'OpenSSL',
    'gd' => 'GD (Image Processing)',
    'zip' => 'ZIP',
    'json' => 'JSON',
    'curl' => 'cURL',
    'fileinfo' => 'File Info',
];

foreach ($requiredExtensions as $ext => $name) {
    $loaded = extension_loaded($ext);
    $checks[] = ["Extension: $name", $loaded ? 'Установлено' : 'НЕ установлено', $loaded];
    if (!$loaded) {
        $errors[] = "Требуется расширение PHP: $name ($ext)";
    }
}

// Display Results
echo "<h2>Результаты проверки:</h2>";
echo "<table border='1' cellpadding='10' style='border-collapse:collapse;width:100%;'>";
echo "<tr><th>Проверка</th><th>Значение</th><th>Статус</th></tr>";

foreach ($checks as $check) {
    $status = $check[2] ? '<span class="ok">✓ OK</span>' : '<span class="error">✗ ОШИБКА</span>';
    echo "<tr><td>{$check[0]}</td><td>{$check[1]}</td><td>$status</td></tr>";
}

echo "</table>";

// Display Errors
if (!empty($errors)) {
    echo "<h2 class='error'>❌ Критические ошибки:</h2><ul>";
    foreach ($errors as $error) {
        echo "<li class='error'>$error</li>";
    }
    echo "</ul>";
    echo "<p><strong>Система не может быть установлена до устранения этих ошибок.</strong></p>";
} else {
    echo "<h2 class='ok'>✅ Все критические требования выполнены!</h2>";
}

// Display Warnings
if (!empty($warnings)) {
    echo "<h2 class='warning'>⚠️ Предупреждения:</h2><ul>";
    foreach ($warnings as $warning) {
        echo "<li class='warning'>$warning</li>";
    }
    echo "</ul>";
}

// Server Info
echo "<h2>Информация о сервере:</h2>";
echo "<ul>";
echo "<li><strong>Операционная система:</strong> " . PHP_OS . "</li>";
echo "<li><strong>Сервер:</strong> " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</li>";
echo "<li><strong>PHP SAPI:</strong> " . PHP_SAPI . "</li>";
echo "<li><strong>Max Execution Time:</strong> " . ini_get('max_execution_time') . " seconds</li>";
echo "</ul>";

/**
 * Convert shorthand byte notation to bytes
 */
function return_bytes($val) {
    $val = trim($val);
    $last = strtolower($val[strlen($val)-1]);
    $val = (int)$val;
    switch($last) {
        case 'g':
            $val *= 1024;
        case 'm':
            $val *= 1024;
        case 'k':
            $val *= 1024;
    }
    return $val;
}
