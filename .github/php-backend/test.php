<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sir Dashboard - Backend Test</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: #00ff88;
            padding: 40px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        h1 {
            font-size: 32px;
            margin-bottom: 10px;
            text-shadow: 0 0 10px #00ff88;
        }
        
        .subtitle {
            color: #888;
            margin-bottom: 40px;
            font-size: 14px;
        }
        
        .test-section {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #00ff88;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .test-section h2 {
            font-size: 20px;
            margin-bottom: 15px;
            color: #00ff88;
        }
        
        .test-result {
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .success {
            background: rgba(0, 255, 136, 0.1);
            border-left: 4px solid #00ff88;
        }
        
        .error {
            background: rgba(255, 0, 0, 0.1);
            border-left: 4px solid #ff0000;
            color: #ff6666;
        }
        
        .info {
            background: rgba(100, 100, 255, 0.1);
            border-left: 4px solid #6666ff;
            color: #9999ff;
        }
        
        .code {
            background: #000;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            margin-top: 10px;
            font-size: 12px;
        }
        
        .status-icon {
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-right: 10px;
            vertical-align: middle;
        }
        
        .status-icon.success::before {
            content: "✓";
            color: #00ff88;
            font-weight: bold;
        }
        
        .status-icon.error::before {
            content: "✗";
            color: #ff0000;
            font-weight: bold;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .stat-card {
            background: rgba(0, 255, 136, 0.05);
            border: 1px solid #00ff88;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 36px;
            font-weight: bold;
            color: #00ff88;
            margin: 10px 0;
        }
        
        .stat-label {
            color: #888;
            font-size: 14px;
        }
        
        button {
            background: #00ff88;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            cursor: pointer;
            margin-right: 10px;
            margin-top: 10px;
        }
        
        button:hover {
            background: #00cc6a;
        }
        
        input {
            background: #000;
            border: 1px solid #00ff88;
            color: #00ff88;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            margin-right: 10px;
        }
        
        input::placeholder {
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛡️ Sir Dashboard - Backend Test</h1>
        <div class="subtitle">PHP/MySQL Backend Integritätsprüfung</div>
        
        <!-- System-Info -->
        <div class="test-section">
            <h2>📊 System-Information</h2>
            <div class="grid">
                <div class="stat-card">
                    <div class="stat-label">PHP Version</div>
                    <div class="stat-value"><?php echo phpversion(); ?></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Server Software</div>
                    <div class="stat-value" style="font-size: 18px;"><?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Aktueller Benutzer</div>
                    <div class="stat-value" style="font-size: 18px;"><?php echo get_current_user(); ?></div>
                </div>
            </div>
        </div>
        
        <!-- Konfiguration -->
        <div class="test-section">
            <h2>⚙️ Konfigurationsdatei</h2>
            <?php
            $configPath = __DIR__ . '/config.php';
            if (file_exists($configPath)) {
                echo '<div class="test-result success"><span class="status-icon success"></span>config.php gefunden</div>';
                require_once $configPath;
            } else {
                echo '<div class="test-result error"><span class="status-icon error"></span>config.php nicht gefunden!</div>';
                echo '<div class="info">Pfad: ' . $configPath . '</div>';
            }
            ?>
        </div>
        
        <!-- Datenbank-Test -->
        <div class="test-section">
            <h2>🗄️ Datenbankverbindung</h2>
            <?php
            if (function_exists('getDbConnection')) {
                try {
                    $pdo = getDbConnection();
                    echo '<div class="test-result success"><span class="status-icon success"></span>Datenbankverbindung erfolgreich</div>';
                    
                    // Tabellen prüfen
                    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
                    echo '<div class="test-result info">Gefundene Tabellen: ' . count($tables) . '</div>';
                    echo '<div class="code">';
                    foreach ($tables as $table) {
                        echo '📋 ' . $table . '<br>';
                    }
                    echo '</div>';
                    
                    // Benutzer zählen
                    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
                    echo '<div class="test-result info">Registrierte Benutzer: ' . $userCount . '</div>';
                    
                } catch (Exception $e) {
                    echo '<div class="test-result error"><span class="status-icon error"></span>Datenbankfehler: ' . $e->getMessage() . '</div>';
                }
            } else {
                echo '<div class="test-result error"><span class="status-icon error"></span>getDbConnection() Funktion nicht verfügbar</div>';
            }
            ?>
        </div>
        
        <!-- PHP-Erweiterungen -->
        <div class="test-section">
            <h2>🔌 PHP-Erweiterungen</h2>
            <?php
            $requiredExtensions = ['mysqli', 'pdo_mysql', 'mbstring', 'openssl', 'curl', 'json'];
            $loadedExtensions = get_loaded_extensions();
            
            foreach ($requiredExtensions as $ext) {
                $loaded = in_array($ext, $loadedExtensions);
                if ($loaded) {
                    echo '<div class="test-result success"><span class="status-icon success"></span>' . $ext . ' geladen</div>';
                } else {
                    echo '<div class="test-result error"><span class="status-icon error"></span>' . $ext . ' NICHT geladen</div>';
                }
            }
            ?>
        </div>
        
        <!-- Dateisystem -->
        <div class="test-section">
            <h2>📁 Dateisystem-Struktur</h2>
            <?php
            $files = [
                'index.php' => 'Haupteinstiegspunkt',
                'auth/login.php' => 'Login-Endpunkt',
                'auth/logout.php' => 'Logout-Endpunkt',
                'auth/check.php' => 'Session-Check',
                'api/users.php' => 'Benutzerverwaltung',
                'api/stresser.php' => 'Stresser API',
                'api/scans.php' => 'Scan API',
                'api/website-analysis.php' => 'Website-Analyse API',
                'database.sql' => 'SQL-Schema'
            ];
            
            foreach ($files as $file => $description) {
                $path = __DIR__ . '/' . $file;
                if (file_exists($path)) {
                    $size = filesize($path);
                    echo '<div class="test-result success"><span class="status-icon success"></span>' . $file . ' (' . $description . ') - ' . number_format($size) . ' bytes</div>';
                } else {
                    echo '<div class="test-result error"><span class="status-icon error"></span>' . $file . ' FEHLT</div>';
                }
            }
            ?>
        </div>
        
        <!-- API-Test -->
        <div class="test-section">
            <h2>🔌 API-Endpunkte testen</h2>
            <div class="info">Verwenden Sie diese Buttons, um die APIs zu testen:</div>
            
            <div style="margin-top: 20px;">
                <h3 style="margin-bottom: 10px;">Login testen:</h3>
                <input type="text" id="username" placeholder="Benutzername" value="admin">
                <input type="password" id="password" placeholder="Passwort" value="admin123">
                <button onclick="testLogin()">Login testen</button>
            </div>
            
            <div style="margin-top: 20px;">
                <h3 style="margin-bottom: 10px;">Weitere Tests:</h3>
                <button onclick="testUsers()">Benutzer abrufen</button>
                <button onclick="testAttacks()">Aktive Angriffe</button>
                <button onclick="testScans()">Scans abrufen</button>
                <button onclick="testHealthCheck()">Health Check</button>
            </div>
            
            <div id="apiResults" class="code" style="margin-top: 20px; min-height: 100px; display: none;">
                <div id="apiOutput"></div>
            </div>
        </div>
        
        <!-- Pfad-Informationen -->
        <div class="test-section">
            <h2>🗺️ Pfad-Informationen</h2>
            <div class="code">
                <strong>Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT'] ?? 'N/A'; ?><br>
                <strong>Script Filename:</strong> <?php echo __FILE__; ?><br>
                <strong>Current Directory:</strong> <?php echo __DIR__; ?><br>
                <strong>Include Path:</strong> <?php echo get_include_path(); ?>
            </div>
        </div>
    </div>
    
    <script>
        function showResult(data) {
            const resultsDiv = document.getElementById('apiResults');
            const outputDiv = document.getElementById('apiOutput');
            resultsDiv.style.display = 'block';
            outputDiv.innerHTML = '<strong>Response:</strong><br>' + 
                JSON.stringify(data, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
        }
        
        async function testLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                showResult(data);
            } catch (error) {
                showResult({ error: error.message });
            }
        }
        
        async function testUsers() {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                showResult(data);
            } catch (error) {
                showResult({ error: error.message });
            }
        }
        
        async function testAttacks() {
            try {
                const response = await fetch('/api/stresser');
                const data = await response.json();
                showResult(data);
            } catch (error) {
                showResult({ error: error.message });
            }
        }
        
        async function testScans() {
            try {
                const response = await fetch('/api/scans');
                const data = await response.json();
                showResult(data);
            } catch (error) {
                showResult({ error: error.message });
            }
        }
        
        async function testHealthCheck() {
            try {
                const response = await fetch('/health');
                const data = await response.json();
                showResult(data);
            } catch (error) {
                showResult({ error: error.message });
            }
        }
    </script>
</body>
</html>
