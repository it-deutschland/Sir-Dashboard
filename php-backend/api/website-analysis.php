<?php
/**
 * API - Website-Analyse (wie Censys)
 */

require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getAnalyses();
        break;
        
    case 'POST':
        analyzeDomain();
        break;
        
    default:
        jsonError('Methode nicht erlaubt', 405);
}

/**
 * Analysen abrufen
 */
function getAnalyses() {
    requireLogin();
    
    try {
        $pdo = getDbConnection();
        
        $stmt = $pdo->prepare("
            SELECT 
                wa.id,
                wa.user_id,
                u.username,
                wa.domain,
                wa.ip_addresses,
                wa.real_ips,
                wa.endpoints,
                wa.software,
                wa.ports,
                wa.analysis_date,
                wa.created_at
            FROM website_analyses wa
            JOIN users u ON wa.user_id = u.id
            ORDER BY wa.created_at DESC
            LIMIT 100
        ");
        $stmt->execute();
        $analyses = $stmt->fetchAll();
        
        // JSON-Felder dekodieren
        foreach ($analyses as &$analysis) {
            $analysis['ip_addresses'] = json_decode($analysis['ip_addresses'], true);
            $analysis['real_ips'] = json_decode($analysis['real_ips'], true);
            $analysis['endpoints'] = json_decode($analysis['endpoints'], true);
            $analysis['software'] = json_decode($analysis['software'], true);
            $analysis['ports'] = json_decode($analysis['ports'], true);
        }
        
        jsonSuccess(['analyses' => $analyses]);
        
    } catch (Exception $e) {
        error_log('Fehler beim Abrufen der Analysen: ' . $e->getMessage());
        jsonError('Fehler beim Abrufen der Analysen', 500);
    }
}

/**
 * Domain analysieren
 */
function analyzeDomain() {
    requireLogin();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $domain = trim($input['domain'] ?? '');
    
    // Validierung
    if (empty($domain)) {
        jsonError('Domain ist erforderlich');
    }
    
    // Domain bereinigen
    $domain = preg_replace('#^https?://#', '', $domain);
    $domain = preg_replace('#/.*$#', '', $domain);
    
    if (!preg_match('/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $domain)) {
        jsonError('Ungültige Domain');
    }
    
    try {
        $pdo = getDbConnection();
        
        // Analyse durchführen
        $analysisData = performDomainAnalysis($domain);
        
        // In Datenbank speichern
        $stmt = $pdo->prepare("
            INSERT INTO website_analyses (
                user_id, domain, ip_addresses, real_ips, endpoints,
                software, ports, certificates, dns_records, analysis_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $_SESSION['user_id'],
            $domain,
            json_encode($analysisData['ip_addresses'], JSON_UNESCAPED_UNICODE),
            json_encode($analysisData['real_ips'], JSON_UNESCAPED_UNICODE),
            json_encode($analysisData['endpoints'], JSON_UNESCAPED_UNICODE),
            json_encode($analysisData['software'], JSON_UNESCAPED_UNICODE),
            json_encode($analysisData['ports'], JSON_UNESCAPED_UNICODE),
            json_encode($analysisData['certificates'], JSON_UNESCAPED_UNICODE),
            json_encode($analysisData['dns_records'], JSON_UNESCAPED_UNICODE)
        ]);
        
        $analysisId = $pdo->lastInsertId();
        
        // Aktivität loggen
        logActivity($_SESSION['user_id'], 'domain_analyzed', [
            'domain' => $domain,
            'analysis_id' => $analysisId
        ]);
        
        jsonSuccess([
            'analysis_id' => $analysisId,
            'domain' => $domain,
            'data' => $analysisData
        ]);
        
    } catch (Exception $e) {
        error_log('Fehler bei der Domain-Analyse: ' . $e->getMessage());
        jsonError('Fehler bei der Domain-Analyse: ' . $e->getMessage(), 500);
    }
}

/**
 * Domain-Analyse durchführen
 */
function performDomainAnalysis($domain) {
    $result = [
        'ip_addresses' => [],
        'real_ips' => [],
        'endpoints' => [],
        'software' => [],
        'ports' => [],
        'certificates' => [],
        'dns_records' => []
    ];
    
    // DNS-Auflösung
    $dnsRecords = @dns_get_record($domain, DNS_A + DNS_AAAA + DNS_MX + DNS_TXT + DNS_NS);
    
    if ($dnsRecords) {
        $result['dns_records'] = $dnsRecords;
        
        foreach ($dnsRecords as $record) {
            if (isset($record['ip'])) {
                $result['ip_addresses'][] = [
                    'ip' => $record['ip'],
                    'type' => 'A',
                    'host' => $record['host'] ?? $domain
                ];
            }
            if (isset($record['ipv6'])) {
                $result['ip_addresses'][] = [
                    'ip' => $record['ipv6'],
                    'type' => 'AAAA',
                    'host' => $record['host'] ?? $domain
                ];
            }
        }
    }
    
    // Fallback: gethostbyname
    if (empty($result['ip_addresses'])) {
        $ip = @gethostbyname($domain);
        if ($ip !== $domain) {
            $result['ip_addresses'][] = [
                'ip' => $ip,
                'type' => 'A',
                'host' => $domain
            ];
        }
    }
    
    // Echte IP hinter Cloudflare ermitteln (vereinfacht)
    $result['real_ips'] = findRealIPs($domain, $result['ip_addresses']);
    
    // Ports scannen (häufigste Ports)
    $commonPorts = [80, 443, 8080, 8443, 2087, 2083, 21, 22, 25, 110, 143, 3306];
    $result['ports'] = scanPorts($domain, $commonPorts);
    
    // Endpoints ermitteln
    $result['endpoints'] = discoverEndpoints($domain);
    
    // Software erkennen
    $result['software'] = detectSoftware($domain);
    
    // SSL-Zertifikat prüfen
    $result['certificates'] = getSSLCertificate($domain);
    
    return $result;
}

/**
 * Echte IPs hinter CDN/Cloudflare finden
 */
function findRealIPs($domain, $currentIPs) {
    $realIPs = [];
    
    // Methode 1: SecurityTrails/Censys Historical DNS (simuliert)
    // In Produktion: API-Aufruf zu SecurityTrails oder ähnlichen Diensten
    
    // Methode 2: Subdomain-Scan (z.B. direct.domain.com, origin.domain.com)
    $subdomains = ['direct', 'origin', 'admin', 'cpanel', 'mail', 'ftp'];
    
    foreach ($subdomains as $sub) {
        $subdomain = $sub . '.' . $domain;
        $ip = @gethostbyname($subdomain);
        
        if ($ip !== $subdomain && !isCloudflareIP($ip)) {
            $realIPs[] = [
                'ip' => $ip,
                'source' => 'subdomain',
                'subdomain' => $subdomain
            ];
        }
    }
    
    // Methode 3: MX Records prüfen
    $mxRecords = @dns_get_record($domain, DNS_MX);
    if ($mxRecords) {
        foreach ($mxRecords as $mx) {
            if (isset($mx['target'])) {
                $ip = @gethostbyname($mx['target']);
                if ($ip !== $mx['target'] && !isCloudflareIP($ip)) {
                    $realIPs[] = [
                        'ip' => $ip,
                        'source' => 'mx_record',
                        'hostname' => $mx['target']
                    ];
                }
            }
        }
    }
    
    return array_unique($realIPs, SORT_REGULAR);
}

/**
 * Prüfen ob IP zu Cloudflare gehört
 */
function isCloudflareIP($ip) {
    $cloudflareRanges = [
        '173.245.48.0/20',
        '103.21.244.0/22',
        '103.22.200.0/22',
        '103.31.4.0/22',
        '141.101.64.0/18',
        '108.162.192.0/18',
        '190.93.240.0/20',
        '188.114.96.0/20',
        '197.234.240.0/22',
        '198.41.128.0/17',
        '162.158.0.0/15',
        '104.16.0.0/13',
        '104.24.0.0/14',
        '172.64.0.0/13',
        '131.0.72.0/22'
    ];
    
    foreach ($cloudflareRanges as $range) {
        if (ipInRange($ip, $range)) {
            return true;
        }
    }
    
    return false;
}

/**
 * IP in CIDR-Range prüfen
 */
function ipInRange($ip, $range) {
    list($subnet, $mask) = explode('/', $range);
    $ip_long = ip2long($ip);
    $subnet_long = ip2long($subnet);
    $mask_long = ~((1 << (32 - $mask)) - 1);
    
    return ($ip_long & $mask_long) === ($subnet_long & $mask_long);
}

/**
 * Ports scannen
 */
function scanPorts($domain, $ports) {
    $openPorts = [];
    $ip = gethostbyname($domain);
    
    foreach ($ports as $port) {
        $connection = @fsockopen($ip, $port, $errno, $errstr, 2);
        if ($connection) {
            $openPorts[] = [
                'port' => $port,
                'status' => 'open',
                'service' => getServiceName($port)
            ];
            fclose($connection);
        }
    }
    
    return $openPorts;
}

/**
 * Service-Name für Port
 */
function getServiceName($port) {
    $services = [
        21 => 'FTP',
        22 => 'SSH',
        25 => 'SMTP',
        80 => 'HTTP',
        110 => 'POP3',
        143 => 'IMAP',
        443 => 'HTTPS',
        2083 => 'cPanel SSL',
        2087 => 'WHM SSL',
        3306 => 'MySQL',
        8080 => 'HTTP-Alt',
        8443 => 'HTTPS-Alt'
    ];
    
    return $services[$port] ?? 'Unknown';
}

/**
 * Endpoints entdecken
 */
function discoverEndpoints($domain) {
    $endpoints = [];
    
    // robots.txt prüfen
    $robotsUrl = 'https://' . $domain . '/robots.txt';
    $robotsContent = @file_get_contents($robotsUrl, false, stream_context_create([
        'http' => [
            'timeout' => 5,
            'user_agent' => 'Mozilla/5.0'
        ]
    ]));
    
    if ($robotsContent) {
        $endpoints[] = [
            'path' => '/robots.txt',
            'protocol' => 'HTTPS',
            'status' => 200
        ];
    }
    
    // Häufige Pfade prüfen
    $commonPaths = ['/admin', '/login', '/wp-admin', '/phpmyadmin', '/cpanel'];
    foreach ($commonPaths as $path) {
        $url = 'https://' . $domain . $path;
        $headers = @get_headers($url, 1);
        
        if ($headers && strpos($headers[0], '200') !== false) {
            $endpoints[] = [
                'path' => $path,
                'protocol' => 'HTTPS',
                'status' => 200
            ];
        }
    }
    
    return $endpoints;
}

/**
 * Software erkennen
 */
function detectSoftware($domain) {
    $software = [];
    
    // HTTP-Headers abrufen
    $url = 'https://' . $domain;
    $headers = @get_headers($url, 1);
    
    if ($headers) {
        // Server-Header
        if (isset($headers['Server'])) {
            $serverHeader = is_array($headers['Server']) ? $headers['Server'][0] : $headers['Server'];
            $software[] = [
                'name' => 'Server',
                'value' => $serverHeader,
                'source' => 'HTTP Header'
            ];
        }
        
        // X-Powered-By
        if (isset($headers['X-Powered-By'])) {
            $poweredBy = is_array($headers['X-Powered-By']) ? $headers['X-Powered-By'][0] : $headers['X-Powered-By'];
            $software[] = [
                'name' => 'X-Powered-By',
                'value' => $poweredBy,
                'source' => 'HTTP Header'
            ];
        }
    }
    
    // Häufige Software-Erkennungen
    $content = @file_get_contents($url, false, stream_context_create([
        'http' => [
            'timeout' => 5,
            'user_agent' => 'Mozilla/5.0'
        ]
    ]));
    
    if ($content) {
        // WordPress
        if (strpos($content, 'wp-content') !== false || strpos($content, 'wp-includes') !== false) {
            $software[] = [
                'name' => 'WordPress',
                'value' => 'Detected',
                'source' => 'Content Analysis'
            ];
        }
        
        // cPanel
        if (strpos($content, 'cpanel') !== false) {
            $software[] = [
                'name' => 'cPanel',
                'value' => 'Detected',
                'source' => 'Content Analysis'
            ];
        }
    }
    
    return $software;
}

/**
 * SSL-Zertifikat abrufen
 */
function getSSLCertificate($domain) {
    $certificates = [];
    
    $stream = @stream_context_create([
        'ssl' => [
            'capture_peer_cert' => true,
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ]);
    
    $client = @stream_socket_client(
        "ssl://{$domain}:443",
        $errno,
        $errstr,
        30,
        STREAM_CLIENT_CONNECT,
        $stream
    );
    
    if ($client) {
        $params = stream_context_get_params($client);
        
        if (isset($params['options']['ssl']['peer_certificate'])) {
            $cert = openssl_x509_parse($params['options']['ssl']['peer_certificate']);
            
            $certificates[] = [
                'subject' => $cert['subject'] ?? [],
                'issuer' => $cert['issuer'] ?? [],
                'valid_from' => date('Y-m-d H:i:s', $cert['validFrom_time_t'] ?? 0),
                'valid_to' => date('Y-m-d H:i:s', $cert['validTo_time_t'] ?? 0),
                'serial_number' => $cert['serialNumber'] ?? '',
                'signature_algorithm' => $cert['signatureTypeSN'] ?? ''
            ];
        }
        
        fclose($client);
    }
    
    return $certificates;
}
