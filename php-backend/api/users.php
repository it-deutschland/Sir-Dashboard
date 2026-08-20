<?php
/**
 * API - Benutzerverwaltung
 */

require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$userId = $pathParts[3] ?? null;

switch ($method) {
    case 'GET':
        if ($userId) {
            getUser($userId);
        } else {
            listUsers();
        }
        break;
        
    case 'POST':
        createUser();
        break;
        
    case 'PUT':
        updateUser($userId);
        break;
        
    case 'DELETE':
        deleteUser($userId);
        break;
        
    default:
        jsonError('Methode nicht erlaubt', 405);
}

/**
 * Alle Benutzer auflisten
 */
function listUsers() {
    requireLogin();
    
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->query("
            SELECT id, username, is_owner, created_at, last_login, is_active
            FROM users
            ORDER BY created_at DESC
        ");
        $users = $stmt->fetchAll();
        
        jsonSuccess(['users' => $users]);
    } catch (Exception $e) {
        error_log('Fehler beim Abrufen der Benutzer: ' . $e->getMessage());
        jsonError('Fehler beim Abrufen der Benutzer', 500);
    }
}

/**
 * Einzelnen Benutzer abrufen
 */
function getUser($userId) {
    requireLogin();
    
    if (empty($userId)) {
        jsonError('Benutzer-ID erforderlich');
    }
    
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT id, username, is_owner, created_at, last_login, is_active
            FROM users
            WHERE id = ?
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonError('Benutzer nicht gefunden', 404);
        }
        
        jsonSuccess(['user' => $user]);
    } catch (Exception $e) {
        error_log('Fehler beim Abrufen des Benutzers: ' . $e->getMessage());
        jsonError('Fehler beim Abrufen des Benutzers', 500);
    }
}

/**
 * Neuen Benutzer erstellen (nur für Owner)
 */
function createUser() {
    requireOwner();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';
    $isOwner = (bool)($input['is_owner'] ?? false);
    
    // Validierung
    if (empty($username) || empty($password)) {
        jsonError('Benutzername und Passwort sind erforderlich');
    }
    
    if (strlen($username) < 3 || strlen($username) > 50) {
        jsonError('Benutzername muss zwischen 3 und 50 Zeichen lang sein');
    }
    
    if (strlen($password) < 6) {
        jsonError('Passwort muss mindestens 6 Zeichen lang sein');
    }
    
    try {
        $pdo = getDbConnection();
        
        // Prüfen ob Benutzername bereits existiert
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $checkStmt->execute([$username]);
        if ($checkStmt->fetch()) {
            jsonError('Benutzername bereits vergeben');
        }
        
        // Passwort hashen
        $passwordHash = password_hash($password, PASSWORD_HASH_ALGO);
        
        // Benutzer erstellen
        $userId = 'user_' . strtolower($username) . '_' . time();
        $stmt = $pdo->prepare("
            INSERT INTO users (id, username, password_hash, is_owner, created_at, is_active)
            VALUES (?, ?, ?, ?, NOW(), 1)
        ");
        $stmt->execute([$userId, $username, $passwordHash, $isOwner ? 1 : 0]);
        
        // Aktivität loggen
        logActivity($_SESSION['user_id'], 'user_created', [
            'created_user_id' => $userId,
            'username' => $username
        ]);
        
        jsonSuccess([
            'user' => [
                'id' => $userId,
                'username' => $username,
                'is_owner' => $isOwner
            ]
        ], 'Benutzer erfolgreich erstellt');
        
    } catch (Exception $e) {
        error_log('Fehler beim Erstellen des Benutzers: ' . $e->getMessage());
        jsonError('Fehler beim Erstellen des Benutzers', 500);
    }
}

/**
 * Benutzer aktualisieren
 */
function updateUser($userId) {
    requireOwner();
    
    if (empty($userId)) {
        jsonError('Benutzer-ID erforderlich');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $password = $input['password'] ?? null;
    $isActive = isset($input['is_active']) ? (bool)$input['is_active'] : null;
    
    try {
        $pdo = getDbConnection();
        
        // Benutzer existiert?
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $checkStmt->execute([$userId]);
        if (!$checkStmt->fetch()) {
            jsonError('Benutzer nicht gefunden', 404);
        }
        
        $updates = [];
        $params = [];
        
        // Passwort ändern
        if (!empty($password)) {
            if (strlen($password) < 6) {
                jsonError('Passwort muss mindestens 6 Zeichen lang sein');
            }
            $updates[] = "password_hash = ?";
            $params[] = password_hash($password, PASSWORD_HASH_ALGO);
        }
        
        // Status ändern
        if ($isActive !== null) {
            $updates[] = "is_active = ?";
            $params[] = $isActive ? 1 : 0;
        }
        
        if (empty($updates)) {
            jsonError('Keine Änderungen angegeben');
        }
        
        $updates[] = "updated_at = NOW()";
        $params[] = $userId;
        
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        // Aktivität loggen
        logActivity($_SESSION['user_id'], 'user_updated', [
            'updated_user_id' => $userId
        ]);
        
        jsonSuccess([], 'Benutzer erfolgreich aktualisiert');
        
    } catch (Exception $e) {
        error_log('Fehler beim Aktualisieren des Benutzers: ' . $e->getMessage());
        jsonError('Fehler beim Aktualisieren des Benutzers', 500);
    }
}

/**
 * Benutzer löschen
 */
function deleteUser($userId) {
    requireOwner();
    
    if (empty($userId)) {
        jsonError('Benutzer-ID erforderlich');
    }
    
    // Verhindere dass Owner sich selbst löscht
    if ($userId === $_SESSION['user_id']) {
        jsonError('Sie können sich nicht selbst löschen');
    }
    
    try {
        $pdo = getDbConnection();
        
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND is_owner = 0");
        $stmt->execute([$userId]);
        
        if ($stmt->rowCount() === 0) {
            jsonError('Benutzer nicht gefunden oder kann nicht gelöscht werden', 404);
        }
        
        // Aktivität loggen
        logActivity($_SESSION['user_id'], 'user_deleted', [
            'deleted_user_id' => $userId
        ]);
        
        jsonSuccess([], 'Benutzer erfolgreich gelöscht');
        
    } catch (Exception $e) {
        error_log('Fehler beim Löschen des Benutzers: ' . $e->getMessage());
        jsonError('Fehler beim Löschen des Benutzers', 500);
    }
}
