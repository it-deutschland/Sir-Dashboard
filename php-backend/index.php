<?php
/**
 * Sir Dashboard - Haupteinstiegspunkt
 * Dieses File leitet alle Anfragen an das entsprechende Backend-Modul weiter
 */

// Konfiguration laden
require_once __DIR__ . '/php-backend/config.php';

// CORS Headers für API-Anfragen (wenn Frontend und Backend getrennt sind)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight-Anfragen behandeln
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Content-Type auf JSON setzen für API-Responses
header('Content-Type: application/json; charset=utf-8');

// Request-URI analysieren
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$path = str_replace($scriptName, '', $requestUri);
$path = trim(parse_url($path, PHP_URL_PATH), '/');
$pathParts = explode('/', $path);

// Routing
$endpoint = $pathParts[0] ?? 'index';

// Sicherheitsprüfung: Session-Start
startSession();

// Router
switch ($endpoint) {
    case '':
    case 'index':
        // Hauptseite - könnte das React-Frontend laden
        header('Content-Type: text/html; charset=utf-8');
        if (file_exists(__DIR__ . '/index.html')) {
            readfile(__DIR__ . '/index.html');
        } else {
            echo '<!DOCTYPE html><html><head><title>Sir Dashboard</title></head><body>';
            echo '<h1>Sir Dashboard</h1>';
            echo '<p>Willkommen beim Sir Dashboard. Bitte installieren Sie das Frontend.</p>';
            echo '</body></html>';
        }
        break;
        
    case 'api':
        // API-Endpunkte
        $apiEndpoint = $pathParts[1] ?? '';
        $apiFile = __DIR__ . '/php-backend/api/' . $apiEndpoint . '.php';
        
        if (file_exists($apiFile)) {
            require_once $apiFile;
        } else {
            jsonError('API-Endpunkt nicht gefunden', 404);
        }
        break;
        
    case 'auth':
        // Authentifizierung
        $authAction = $pathParts[1] ?? '';
        $authFile = __DIR__ . '/php-backend/auth/' . $authAction . '.php';
        
        if (file_exists($authFile)) {
            require_once $authFile;
        } else {
            jsonError('Auth-Endpunkt nicht gefunden', 404);
        }
        break;
        
    case 'health':
        // Health-Check für Monitoring
        jsonSuccess([
            'status' => 'ok',
            'timestamp' => date('Y-m-d H:i:s'),
            'database' => checkDatabaseConnection()
        ]);
        break;
        
    default:
        jsonError('Endpunkt nicht gefunden', 404);
        break;
}

/**
 * Datenbankverbindung prüfen
 */
function checkDatabaseConnection() {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->query('SELECT 1');
        return 'connected';
    } catch (Exception $e) {
        return 'disconnected';
    }
}
