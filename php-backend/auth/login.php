<?php
/**
 * Authentifizierung - Login
 */

require_once __DIR__ . '/../config.php';

// Nur POST erlauben
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Methode nicht erlaubt', 405);
}

// JSON-Daten empfangen
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

// Validierung
if (empty($username) || empty($password)) {
    jsonError('Benutzername und Passwort sind erforderlich');
}

try {
    $pdo = getDbConnection();
    
    // Benutzer suchen
    $stmt = $pdo->prepare("
        SELECT id, username, password_hash, is_owner, is_active
        FROM users
        WHERE username = ? AND is_active = 1
    ");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Verzögerung gegen Brute-Force
        sleep(1);
        jsonError('Ungültiger Benutzername oder Passwort', 401);
    }
    
    // Passwort überprüfen
    if (!password_verify($password, $user['password_hash'])) {
        // Verzögerung gegen Brute-Force
        sleep(1);
        jsonError('Ungültiger Benutzername oder Passwort', 401);
    }
    
    // Session erstellen
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['is_owner'] = (bool)$user['is_owner'];
    $_SESSION['login_time'] = time();
    
    // Login-Zeit aktualisieren
    $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $updateStmt->execute([$user['id']]);
    
    // Aktivität loggen
    logActivity($user['id'], 'login', ['ip' => $_SERVER['REMOTE_ADDR']]);
    
    // Erfolgreiche Antwort
    jsonSuccess([
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'is_owner' => (bool)$user['is_owner']
        ],
        'session_token' => session_id()
    ], 'Login erfolgreich');
    
} catch (Exception $e) {
    error_log('Login-Fehler: ' . $e->getMessage());
    jsonError('Ein Fehler ist aufgetreten', 500);
}
