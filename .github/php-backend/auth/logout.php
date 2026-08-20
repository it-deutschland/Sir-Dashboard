<?php
/**
 * Authentifizierung - Logout
 */

require_once __DIR__ . '/../config.php';

if (!isLoggedIn()) {
    jsonError('Nicht angemeldet', 401);
}

$userId = $_SESSION['user_id'];

// Aktivität loggen
logActivity($userId, 'logout');

// Session zerstören
session_unset();
session_destroy();

// Session-Cookie löschen
if (isset($_COOKIE[SESSION_NAME])) {
    setcookie(SESSION_NAME, '', time() - 3600, '/');
}

jsonSuccess([], 'Logout erfolgreich');
