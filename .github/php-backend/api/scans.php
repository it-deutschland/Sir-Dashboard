<?php
/**
 * API - Schwachstellenscans
 */

require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getScans();
        break;
        
    case 'POST':
        startScan();
        break;
        
    default:
        jsonError('Methode nicht erlaubt', 405);
}

/**
 * Scans abrufen
 */
function getScans() {
    requireLogin();
    
    try {
        $pdo = getDbConnection();
        
        $stmt = $pdo->prepare("
            SELECT 
                vs.id,
                vs.scan_id,
                vs.user_id,
                u.username,
                vs.scanner_type,
                vs.target_url,
                vs.scan_status,
                vs.vulnerabilities_found,
                vs.started_at,
                vs.completed_at,
                vs.created_at
            FROM vulnerability_scans vs
            JOIN users u ON vs.user_id = u.id
            ORDER BY vs.created_at DESC
            LIMIT 100
        ");
        $stmt->execute();
        $scans = $stmt->fetchAll();
        
        jsonSuccess(['scans' => $scans]);
        
    } catch (Exception $e) {
        error_log('Fehler beim Abrufen der Scans: ' . $e->getMessage());
        jsonError('Fehler beim Abrufen der Scans', 500);
    }
}

/**
 * Scan starten
 */
function startScan() {
    requireLogin();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $scannerType = $input['scanner_type'] ?? '';
    $targetUrl = trim($input['target_url'] ?? '');
    
    // Validierung
    $validScanners = [
        'Acunetix',
        'Astra Security Scanner',
        'OWASP ZAP',
        'Qualys WAS',
        'Burp Suite'
    ];
    
    if (!in_array($scannerType, $validScanners)) {
        jsonError('Ungültiger Scanner-Typ');
    }
    
    if (empty($targetUrl)) {
        jsonError('Ziel-URL ist erforderlich');
    }
    
    if (!filter_var($targetUrl, FILTER_VALIDATE_URL)) {
        jsonError('Ungültige URL');
    }
    
    try {
        $pdo = getDbConnection();
        
        // Scan-ID generieren
        $scanId = 'scan_' . time() . '_' . bin2hex(random_bytes(4));
        
        // Scan in Datenbank speichern
        $stmt = $pdo->prepare("
            INSERT INTO vulnerability_scans (
                scan_id, user_id, scanner_type, target_url,
                scan_status, started_at
            )
            VALUES (?, ?, ?, ?, 'running', NOW())
        ");
        
        $stmt->execute([
            $scanId,
            $_SESSION['user_id'],
            $scannerType,
            $targetUrl
        ]);
        
        $id = $pdo->lastInsertId();
        
        // Simulierten Scan durchführen (in Produktion: echter Scanner-Aufruf)
        $vulnerabilities = simulateScan($scannerType, $targetUrl);
        
        // Scan als abgeschlossen markieren
        $updateStmt = $pdo->prepare("
            UPDATE vulnerability_scans
            SET scan_status = 'completed',
                vulnerabilities_found = ?,
                completed_at = NOW(),
                scan_results = ?
            WHERE id = ?
        ");
        
        $updateStmt->execute([
            count($vulnerabilities),
            json_encode($vulnerabilities, JSON_UNESCAPED_UNICODE),
            $id
        ]);
        
        // Schwachstellen einzeln speichern
        if (!empty($vulnerabilities)) {
            $vulnStmt = $pdo->prepare("
                INSERT INTO scan_vulnerabilities (
                    scan_id, vulnerability_type, severity, title,
                    description, affected_url, cvss_score, cwe_id, recommendation
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            foreach ($vulnerabilities as $vuln) {
                $vulnStmt->execute([
                    $scanId,
                    $vuln['type'],
                    $vuln['severity'],
                    $vuln['title'],
                    $vuln['description'],
                    $vuln['affected_url'],
                    $vuln['cvss_score'],
                    $vuln['cwe_id'],
                    $vuln['recommendation']
                ]);
            }
        }
        
        // Aktivität loggen
        logActivity($_SESSION['user_id'], 'scan_started', [
            'scan_id' => $scanId,
            'scanner' => $scannerType,
            'target' => $targetUrl
        ]);
        
        jsonSuccess([
            'scan_id' => $scanId,
            'vulnerabilities_found' => count($vulnerabilities),
            'message' => count($vulnerabilities) . ' Ergebnisse wurden gefunden'
        ]);
        
    } catch (Exception $e) {
        error_log('Fehler beim Starten des Scans: ' . $e->getMessage());
        jsonError('Fehler beim Starten des Scans', 500);
    }
}

/**
 * Scan simulieren (Demonstrationszwecke)
 */
function simulateScan($scannerType, $targetUrl) {
    // In Produktion: echter Scanner-Aufruf
    // Hier: Beispieldaten generieren
    
    $vulnerabilities = [];
    $vulnTypes = [
        ['type' => 'SQL Injection', 'severity' => 'critical', 'cvss' => 9.8, 'cwe' => 'CWE-89'],
        ['type' => 'Cross-Site Scripting (XSS)', 'severity' => 'high', 'cvss' => 7.5, 'cwe' => 'CWE-79'],
        ['type' => 'Cross-Site Request Forgery (CSRF)', 'severity' => 'medium', 'cvss' => 5.4, 'cwe' => 'CWE-352'],
        ['type' => 'Insecure Direct Object Reference', 'severity' => 'high', 'cvss' => 7.2, 'cwe' => 'CWE-639'],
        ['type' => 'Security Misconfiguration', 'severity' => 'medium', 'cvss' => 5.0, 'cwe' => 'CWE-16'],
        ['type' => 'Sensitive Data Exposure', 'severity' => 'high', 'cvss' => 7.5, 'cwe' => 'CWE-200'],
        ['type' => 'Missing Authentication', 'severity' => 'critical', 'cvss' => 9.1, 'cwe' => 'CWE-306'],
        ['type' => 'Broken Access Control', 'severity' => 'high', 'cvss' => 8.2, 'cwe' => 'CWE-284'],
        ['type' => 'Using Components with Known Vulnerabilities', 'severity' => 'medium', 'cvss' => 6.5, 'cwe' => 'CWE-1035'],
        ['type' => 'Insufficient Logging & Monitoring', 'severity' => 'low', 'cvss' => 3.1, 'cwe' => 'CWE-778']
    ];
    
    // Zufällige Anzahl von Schwachstellen (0-10)
    $count = rand(3, 10);
    
    for ($i = 0; $i < $count; $i++) {
        $vuln = $vulnTypes[array_rand($vulnTypes)];
        
        $vulnerabilities[] = [
            'type' => $vuln['type'],
            'severity' => $vuln['severity'],
            'title' => $vuln['type'] . ' in ' . $targetUrl,
            'description' => 'Gefundene Schwachstelle vom Typ ' . $vuln['type'] . ' mit Scanner ' . $scannerType,
            'affected_url' => $targetUrl . '/page' . $i . '.php',
            'cvss_score' => $vuln['cvss'],
            'cwe_id' => $vuln['cwe'],
            'recommendation' => 'Implementieren Sie entsprechende Sicherheitsmaßnahmen gegen ' . $vuln['type']
        ];
    }
    
    // Kurze Verzögerung um realistische Scan-Zeit zu simulieren
    sleep(2);
    
    return $vulnerabilities;
}
