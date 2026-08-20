<?php
/**
 * Sir Dashboard - Zentrale Konfigurationsdatei
 * 
 * ANLEITUNG: Passen Sie diese Werte an Ihre Umgebung an
 */

// Fehlerberichterstattung
// Für Entwicklung: E_ALL und display_errors = 1
// Für Produktion: 0 und display_errors = 0
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php-error.log');

// Zeitzone
date_default_timezone_set('Europe/Berlin');

// ===========================
// DATENBANK KONFIGURATION
// ===========================
// ⚠️ WICHTIG: Passen Sie diese Werte an Ihre Umgebung an!
define('DB_HOST', 'localhost');          // Ihre MySQL/MariaDB Host (z.B. localhost oder 127.0.0.1)
define('DB_NAME', 'sir_dashboard');      // Datenbankname
define('DB_USER', 'root');               // Datenbankbenutzer
define('DB_PASS', '');                   // Datenbankpasswort (HIER IHR PASSWORT EINTRAGEN!)
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_general_ci');

// ===========================
// API KONFIGURATION
// ===========================
// Fluxstress API (Master Botnet)
define('FLUXSTRESS_API_URL', 'https://api.fluxstress.to/');
define('FLUXSTRESS_API_TOKEN', 'rkV0FnOGSfdO8GRGgL5hvh');
define('FLUXSTRESS_MAX_CONCURRENTS', 24);

// Netdowner API (Master Stresser)
define('NETDOWNER_API_URL', 'https://api.netdowner.to/');
define('NETDOWNER_API_TOKEN', 'f5e8b83d9e04698e4d834421ce9b32575ddfd6d529f4a899bc340994b80d07ec');

// ===========================
// SESSION KONFIGURATION
// ===========================
define('SESSION_LIFETIME', 7200); // 2 Stunden in Sekunden
define('SESSION_NAME', 'SIR_DASHBOARD_SESSION');

// ===========================
// SICHERHEIT
// ===========================
define('PASSWORD_HASH_ALGO', PASSWORD_ARGON2ID);
define('ENABLE_CSRF_PROTECTION', true);

// ===========================
// PFADE
// ===========================
define('BASE_PATH', __DIR__);
define('LOGS_PATH', BASE_PATH . '/logs');

// ===========================
// DATENBANK VERBINDUNG
// ===========================
function getDbConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                DB_HOST,
                DB_NAME,
                DB_CHARSET
            );
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET . " COLLATE " . DB_COLLATE
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log('Datenbankverbindung fehlgeschlagen: ' . $e->getMessage());
            
            // Im Entwicklungsmodus detaillierte Fehlermeldung
            if (ini_get('display_errors')) {
                $errorMsg = [
                    'error' => 'Datenbankverbindung fehlgeschlagen',
                    'details' => $e->getMessage(),
                    'hint' => 'Bitte prüfen Sie die Konfiguration in php-backend/config.php'
                ];
                header('Content-Type: application/json');
                http_response_code(500);
                echo json_encode($errorMsg);
                exit;
            }
            
            die('Datenbankverbindung fehlgeschlagen. Bitte prüfen Sie die Konfiguration.');
        }
    }
    
    return $pdo;
}

// ===========================
// SESSION MANAGEMENT
// ===========================
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.gc_maxlifetime', SESSION_LIFETIME);
        session_name(SESSION_NAME);
        session_start();
        
        // Session-Sicherheit
        if (!isset($_SESSION['initiated'])) {
            session_regenerate_id(true);
            $_SESSION['initiated'] = true;
        }
        
        // Session-Timeout prüfen
        if (isset($_SESSION['last_activity']) && 
            (time() - $_SESSION['last_activity'] > SESSION_LIFETIME)) {
            session_unset();
            session_destroy();
            return false;
        }
        
        $_SESSION['last_activity'] = time();
    }
    
    return true;
}

// ===========================
// HILFSFUNKTIONEN
// ===========================
function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

function isOwner() {
    return isset($_SESSION['is_owner']) && $_SESSION['is_owner'] === true;
}

function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'is_owner' => $_SESSION['is_owner'] ?? false
    ];
}

function requireLogin() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['error' => 'Nicht autorisiert']);
        exit;
    }
}

function requireOwner() {
    requireLogin();
    if (!isOwner()) {
        http_response_code(403);
        echo json_encode(['error' => 'Zugriff verweigert']);
        exit;
    }
}

// ===========================
// JSON RESPONSE HELPER
// ===========================
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError($message, $statusCode = 400) {
    jsonResponse(['error' => $message], $statusCode);
}

function jsonSuccess($data = [], $message = null) {
    $response = ['success' => true];
    if ($message) {
        $response['message'] = $message;
    }
    if (!empty($data)) {
        $response['data'] = $data;
    }
    jsonResponse($response);
}

// ===========================
// CSRF PROTECTION
// ===========================
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRFToken($token) {
    if (!ENABLE_CSRF_PROTECTION) {
        return true;
    }
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// ===========================
// LOGGING
// ===========================
function logActivity($userId, $action, $details = null) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            INSERT INTO activity_logs (user_id, action, details, ip_address, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $detailsJson = $details ? json_encode($details, JSON_UNESCAPED_UNICODE) : null;
        
        $stmt->execute([$userId, $action, $detailsJson, $ipAddress]);
    } catch (Exception $e) {
        error_log('Logging fehlgeschlagen: ' . $e->getMessage());
    }
}

// Session starten
startSession();
