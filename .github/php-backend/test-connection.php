<?php
 * 
 * Diese Datei testet alle kritischen Komponenten der Insta
 * 
 * Diese Datei testet alle kritischen Komponenten der Installation:
 * - PHP-Version und Erweiterungen
 * - Datenbankverbindung
 * - Schreibrechte
// HTML-Header
 * - API-Erreichbarkeit
<he

// Fehleranzeige aktivieren für Tests
error_reporting(E_ALL);
ini_set('display_errors', 1);

            fo
  
            min
        
      
            background: rg
            border-radius: 8px;
            box-shadow: 0 0 30px rgba(0, 255, 136,
        
           
            font-size:
            letter-spac
        
        }
        
            ma
            font-family: 'Consolas', 'Monaco', monospace;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: #00ff88;
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.6);
            border: 2px solid #00ff88;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
        }
        
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 0 0 10px #00ff88;
            letter-spacing: 2px;
        }
        
        .test-section {
            background: rgba(20, 20, 40, 0.8);
            border: 1px solid #334;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .test-section h2 {
            color: #66ffaa;
            margin-bottom: 15px;
            font-size: 1.5em;
            border-bottom: 2px solid #334;
            padding-bottom: 10px;
        }
        
        .test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin: 5px 0;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
        }
        
        .test-item .label {
            margin-b
            color: #aaddcc;
         
        
        .summary.failed h2 
            flex: 1;
            text-align: right;
            font-weight: bold;
        
        }
        
        .status {
            padding: 5px 15px;
            border-radius: 4px;
            font-weight: bold;
            margin-left: 10px;
$errors =
        
// TEST 1: PHP-VERSION UN
            background: #00ff88;

        }
echo '<d
        .status.error {
echo '</div>';
            color: #fff;
    $allT
        
        .status.warning {
            background: #ffaa00;
            color: #000;
        }
        
        .status.info {
// Server API
            color: #fff;
echo '<sp
        
echo '</div>';
            background: #000;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 15px;
            margin: 10px 0;
            overflow-x: auto;
            font-family: 'Consolas', monospace;
            font-size: 0.9em;
        }
    $loa
        .alert {
    echo '<span class="sta
            border-radius: 4px;
        $errors[] = "PHP-Er
        }

        .alert.error {
            background: rgba(255, 68, 68, 0.2);
            border: 1px solid #ff4444;
            color: #ff8888;
        }
    echo
        .alert.success {
            background: rgba(0, 255, 136, 0.2);
            border: 1px solid #00ff88;
            color: #00ffaa;
        }
    echo
        .alert.warning {
            background: rgba(255, 170, 0, 0.2);
            border: 1px solid #ffaa00;
            color: #ffcc44;
        }
    echo
        .summary {
    
            padding: 30px;
    echo '</div>';
            background: rgba(0, 255, 136, 0.1);
            border: 2px solid #00ff88;
            border-radius: 8px;
        }
        
        // MySQL-Vers
            font-size: 2em;
            margin-bottom: 15px;
        }
        
        .summary.failed {
            background: rgba(255, 68, 68, 0.1);
            border-color: #ff4444;
        }
        
        .summary.failed h2 {
            color: #ff8888;
         
        
            
            list-style: none;
            padding-left: 20px;
        }
        
        ul li:before {
            content: "▸ ";
            color: #00ff88;
            font-weight: bold;
            margin-right: 5px;
        e
    </style>
       
<body>
        echo '<div class="a
        <h1>🔧 SIR DASHBOARD SYSTEM TEST</h1>
        
<?php

$allTestsPassed = true;
$errors = [];
$warnings = [];

// ==============================================
// TEST 1: PHP-VERSION UND KONFIGURATION
// ==============================================
echo '<div class="test-section">';
echo '<h2>1. PHP-Umgebung</h2>';

// PHP-Version
$phpVersion = phpversion();
$phpVersionOk = version_compare($phpVersion, '8.0.0', '>=');
echo '<div class="test-item">';
echo '<span class="label">PHP-Version</span>';
echo '<span class="value">' . $phpVersion . '</span>';
echo '<span class="status ' . ($phpVersionOk ? 'success' : 'error') . '">' . ($phpVersionOk ? '✓' : '✗') . '</span>';
    

    echo '<div class=
    $errors[] = 'PHP 8.0 oder höher erforderlich';
    $allTestsPassed = false;
}

// Thread Safety
$threadSafe = (ZEND_THREAD_SAFE ? 'Thread Safe (TS)' : 'Non-Thread Safe (NTS)');
$tsOk = ZEND_THREAD_SAFE;
} else {
echo '<span class="label">Thread Safety</span>';
echo '<span class="value">' . $threadSafe . '</span>';
echo '<span class="status ' . ($tsOk ? 'success' : 'warning') . '">' . ($tsOk ? '✓' : '⚠') . '</span>';
echo '</div>';

if (!$tsOk) {
    $warnings[] = 'Für IIS wird Thread Safe (TS) empfohlen';
e

    echo '<sp
$serverApi = php_sapi_name();
echo '<div class="test-item">';
echo '<span class="label">Server API</span>';
echo '<span class="value">' . $serverApi . '</span>';
echo '<span class="status info">ℹ</span>';
} else {

echo '</div>';

// ==============================================
// TEST 2: ERFORDERLICHE PHP-ERWEITERUNGEN
// ==============================================
echo '<div class="test-section">';
echo '<h2>2. PHP-Erweiterungen</h2>';

    echo '<div class="t
    'mysqli' => 'MySQL/MariaDB Verbindung',
    'pdo' => 'PDO Datenbank-Abstraktionsschicht',
    'pdo_mysql' => 'PDO MySQL Driver',
    'mbstring' => 'Multibyte String-Funktionen',
    'openssl' => 'SSL/TLS Verschlüsselung',

    'json' => 'JSON Encoding/Decoding',
    'session' => 'Session-Verwaltung'
];

foreach ($requiredExtensions as $ext => $description) {
    $loaded = extension_loaded($ext);
    echo '<div class="test-item">';
    echo '<span class="label">' . $ext . '</span>';
    echo '<span class="value" style="font-size: 0.9em; color: #888;">' . $description . '</span>';
    echo '<span class="status ' . ($loaded ? 'success' : 'error') . '">' . ($loaded ? '✓' : '✗') . '</span>';
    echo '</div>';
    
    if (!$loaded) {
        $errors[] = "PHP-Erweiterung '{$ext}' fehlt";
        $allTestsPassed = false;

}

echo '</div>';

// ==============================================
echo '<div class="test-item">'
// ==============================================

echo '<h2>3. Datenbankverbindung</h2>';

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    echo '<div class="alert error">';
    echo '<strong>FEHLER:</strong> config.php nicht gefunden!<br>';
    echo 'Pfad: ' . $configFile;
    echo '</div>';
// =========================
    echo '<div class="summary">';
} else {
    if (!empty($warnings)) {
    
    // Verbindungsparameter anzeigen
    echo '<div class="test-item">';
    echo '<span class="label">Host</span>';
    echo '<span class="value">' . DB_HOST . '</span>';
    echo '</div>';
    
    echo '<div class="test-item">';
    echo '<span class="label">Datenbankname</span>';
    echo '<span class="value">' . DB_NAME . '</span>';
    echo '</div>';
    
    echo '<div class="test-item">';
    echo '<span class="label">Benutzer</span>';
    echo '<span class="value">' . DB_USER . '</span>';
    echo '</div>';
    
    echo '<div class="test-item">';
    echo '<span class="label">Character Set</span>';
    echo '<span class="value">' . DB_CHARSET . '</span>';
    echo '</div>';
    
    echo '<div class="test-item">';
    echo '<span class="label">Collation</span>';
    echo '<span class="value">' . DB_COLLATE . '</span>';
    echo '</div>';
    
        </div>
    try {


        echo '<div class="test-item">';
        echo '<span class="label">Verbindungsstatus</span>';
        echo '<span class="value">Erfolgreich verbunden</span>';
        echo '<span class="status success">✓</span>';
        echo '</div>';

        // MySQL-Version
        $mysqlVersion = $pdo->query('SELECT VERSION()')->fetchColumn();

        echo '<span class="label">MySQL/MariaDB Version</span>';
        echo '<span class="value">' . $mysqlVersion . '</span>';
        echo '<span class="status success">✓</span>';
        echo '</div>';

        // Tabellen prüfen
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        $requiredTables = ['users', 'stresser_attacks', 'vulnerability_scans', 'website_analyses', 'activity_logs'];

        echo '<div class="test-item">';
        echo '<span class="label">Gefundene Tabellen</span>';
        echo '<span class="value">' . count($tables) . ' Tabellen</span>';
        echo '</div>';

        $missingTables = array_diff($requiredTables, $tables);
        if (empty($missingTables)) {
            echo '<div class="alert success">';
            echo '<strong>✓ Alle erforderlichen Tabellen vorhanden:</strong><br>';

            foreach ($requiredTables as $table) {
                echo '<li>' . $table . '</li>';
            }
            echo '</ul>';
            echo '</div>';
        } else {
            echo '<div class="alert error">';
            echo '<strong>✗ Fehlende Tabellen:</strong><br>';
            echo '<ul>';
            foreach ($missingTables as $table) {
                echo '<li>' . $table . '</li>';
            }
            echo '</ul>';
            echo '<br><strong>Lösung:</strong> Importieren Sie die database.sql Datei';
            echo '</div>';
            $errors[] = 'Datenbank-Schema nicht vollständig';
            $allTestsPassed = false;
        }

        // Test-Benutzer prüfen
        $stmt = $pdo->query("SELECT COUNT(*) FROM users");
        $userCount = $stmt->fetchColumn();

        echo '<div class="test-item">';
        echo '<span class="label">Benutzer in Datenbank</span>';
        echo '<span class="value">' . $userCount . ' Benutzer</span>';
        echo '<span class="status ' . ($userCount > 0 ? 'success' : 'warning') . '">' . ($userCount > 0 ? '✓' : '⚠') . '</span>';
        echo '</div>';

        if ($userCount === 0) {








































































































































































































































































