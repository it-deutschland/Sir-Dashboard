<?php
/**
 * Authentifizierung - Session-Check
 */

require_once __DIR__ . '/../config.php';

if (!isLoggedIn()) {
    jsonError('Nicht angemeldet', 401);
}

$user = getCurrentUser();

jsonSuccess([
    'user' => $user,
    'session_valid' => true,
    'expires_in' => SESSION_LIFETIME - (time() - $_SESSION['last_activity'])
]);
