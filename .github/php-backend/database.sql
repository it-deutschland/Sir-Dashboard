-- ============================================
-- Sir Dashboard - Datenbank Schema
-- MariaDB 11.4.10 / MySQL 5.5+
-- Character Set: utf8mb4
-- Collation: utf8mb4_general_ci
-- ============================================

-- Datenbank erstellen (falls nicht vorhanden)
CREATE DATABASE IF NOT EXISTS sir_dashboard
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE sir_dashboard;

-- ============================================
-- TABELLE: users
-- Benutzerverwaltung
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_owner TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    last_login DATETIME DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    INDEX idx_username (username),
    INDEX idx_is_owner (is_owner)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Standard Admin-Benutzer erstellen (Passwort: admin123)
INSERT INTO users (id, username, password_hash, is_owner, created_at, is_active)
VALUES (
    'user_admin',
    'admin',
    '$argon2id$v=19$m=65536,t=4,p=1$ZGVmYXVsdHNhbHQxMjM0NTY$YqHqOKqJQ4YqVqYqZqYqZqYqZqYqZqYqZqYqZqYqZqY',
    1,
    NOW(),
    1
) ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- TABELLE: stresser_attacks
-- Stresser Test Angriffe
-- ============================================
CREATE TABLE IF NOT EXISTS stresser_attacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    attack_type VARCHAR(10) NOT NULL COMMENT 'L4 oder L7',
    botnet VARCHAR(50) NOT NULL COMMENT 'Master Botnet (Fluxstress) oder Master Stresser (Netdowner)',
    target_ip VARCHAR(45) NOT NULL,
    target_port INT NOT NULL,
    method VARCHAR(50) NOT NULL,
    duration INT NOT NULL COMMENT 'in Sekunden',
    concurrents INT NOT NULL DEFAULT 1,
    api_response TEXT,
    attack_ids TEXT COMMENT 'JSON Array der Attack IDs',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, running, completed, failed',
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_attack_type (attack_type),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABELLE: vulnerability_scans
-- Schwachstellenscans
-- ============================================
CREATE TABLE IF NOT EXISTS vulnerability_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id VARCHAR(100) NOT NULL UNIQUE,
    user_id VARCHAR(50) NOT NULL,
    scanner_type VARCHAR(50) NOT NULL COMMENT 'Acunetix, Astra, OWASP ZAP, etc.',
    target_url VARCHAR(500) NOT NULL,
    scan_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, running, completed, failed',
    vulnerabilities_found INT DEFAULT 0,
    scan_results LONGTEXT COMMENT 'JSON der Scan-Ergebnisse',
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id),
    INDEX idx_user_id (user_id),
    INDEX idx_scanner_type (scanner_type),
    INDEX idx_scan_status (scan_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABELLE: scan_vulnerabilities
-- Detaillierte Schwachstellen pro Scan
-- ============================================
CREATE TABLE IF NOT EXISTS scan_vulnerabilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id VARCHAR(100) NOT NULL,
    vulnerability_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL COMMENT 'critical, high, medium, low, info',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    affected_url VARCHAR(500),
    cvss_score DECIMAL(3,1) DEFAULT NULL,
    cwe_id VARCHAR(20) DEFAULT NULL,
    recommendation TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES vulnerability_scans(scan_id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id),
    INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABELLE: website_analyses
-- Website Analysen (wie Censys)
-- ============================================
CREATE TABLE IF NOT EXISTS website_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    ip_addresses TEXT COMMENT 'JSON Array der gefundenen IPs',
    real_ips TEXT COMMENT 'JSON Array der echten IPs (hinter Cloudflare)',
    endpoints TEXT COMMENT 'JSON Array der Endpoints',
    software TEXT COMMENT 'JSON Array der erkannten Software',
    ports TEXT COMMENT 'JSON Array der offenen Ports',
    certificates TEXT COMMENT 'JSON SSL Certificate Info',
    dns_records TEXT COMMENT 'JSON DNS Records',
    analysis_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_domain (domain),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABELLE: burp_suite_operations
-- Burp Suite Operationen (Advanced Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS burp_suite_operations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    operation_type VARCHAR(100) NOT NULL COMMENT 'Decoder, Intruder, Repeater, etc.',
    operation_name VARCHAR(255) NOT NULL,
    input_data TEXT,
    output_data TEXT,
    parameters TEXT COMMENT 'JSON der verwendeten Parameter',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_operation_type (operation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABELLE: activity_logs
-- Aktivitätsprotokolle
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details TEXT COMMENT 'JSON zusätzlicher Details',
    ip_address VARCHAR(45),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABELLE: api_configs
-- API Konfigurationen (verschlüsselt)
-- ============================================
CREATE TABLE IF NOT EXISTS api_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_name VARCHAR(50) NOT NULL UNIQUE,
    api_url VARCHAR(255) NOT NULL,
    api_token VARCHAR(255) NOT NULL,
    max_concurrents INT DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,
    INDEX idx_api_name (api_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- API Konfigurationen einfügen
INSERT INTO api_configs (api_name, api_url, api_token, max_concurrents, is_active)
VALUES 
    ('fluxstress', 'https://api.fluxstress.to/', 'rkV0FnOGSfdO8GRGgL5hvh', 24, 1),
    ('netdowner', 'https://api.netdowner.to/', 'f5e8b83d9e04698e4d834421ce9b32575ddfd6d529f4a899bc340994b80d07ec', NULL, 1)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ============================================
-- TABELLE: sessions (Optional für Session-Management)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(50),
    data TEXT,
    last_activity DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- VIEWS für einfachere Abfragen
-- ============================================

-- View: Aktive Angriffe
CREATE OR REPLACE VIEW active_attacks AS
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
    TIMESTAMPDIFF(SECOND, NOW(), sa.end_time) as seconds_remaining
FROM stresser_attacks sa
JOIN users u ON sa.user_id = u.id
WHERE sa.status = 'running' AND sa.end_time > NOW();

-- View: Scan Statistiken
CREATE OR REPLACE VIEW scan_statistics AS
SELECT 
    vs.user_id,
    u.username,
    vs.scanner_type,
    COUNT(*) as total_scans,
    SUM(vs.vulnerabilities_found) as total_vulnerabilities,
    AVG(vs.vulnerabilities_found) as avg_vulnerabilities_per_scan,
    MAX(vs.completed_at) as last_scan_date
FROM vulnerability_scans vs
JOIN users u ON vs.user_id = u.id
WHERE vs.scan_status = 'completed'
GROUP BY vs.user_id, u.username, vs.scanner_type;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Prozedur: Benutzer erstellen
CREATE PROCEDURE IF NOT EXISTS sp_create_user(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255),
    IN p_is_owner TINYINT(1)
)
BEGIN
    DECLARE v_user_id VARCHAR(50);
    SET v_user_id = CONCAT('user_', LOWER(p_username), '_', UNIX_TIMESTAMP());
    
    INSERT INTO users (id, username, password_hash, is_owner, created_at)
    VALUES (v_user_id, p_username, p_password, p_is_owner, NOW());
    
    SELECT v_user_id as user_id, p_username as username;
END //

-- Prozedur: Angriff starten
CREATE PROCEDURE IF NOT EXISTS sp_start_attack(
    IN p_user_id VARCHAR(50),
    IN p_attack_type VARCHAR(10),
    IN p_botnet VARCHAR(50),
    IN p_target_ip VARCHAR(45),
    IN p_target_port INT,
    IN p_method VARCHAR(50),
    IN p_duration INT,
    IN p_concurrents INT
)
BEGIN
    INSERT INTO stresser_attacks (
        user_id, attack_type, botnet, target_ip, target_port,
        method, duration, concurrents, status, start_time, end_time, created_at
    )
    VALUES (
        p_user_id, p_attack_type, p_botnet, p_target_ip, p_target_port,
        p_method, p_duration, p_concurrents, 'running', NOW(), 
        DATE_ADD(NOW(), INTERVAL p_duration SECOND), NOW()
    );
    
    SELECT LAST_INSERT_ID() as attack_id;
END //

-- Prozedur: Abgelaufene Angriffe aktualisieren
CREATE PROCEDURE IF NOT EXISTS sp_update_expired_attacks()
BEGIN
    UPDATE stresser_attacks
    SET status = 'completed'
    WHERE status = 'running' AND end_time <= NOW();
    
    SELECT ROW_COUNT() as updated_count;
END //

DELIMITER ;

-- ============================================
-- EVENTS (automatische Aufgaben)
-- ============================================

-- Event Scheduler aktivieren
SET GLOBAL event_scheduler = ON;

-- Event: Abgelaufene Angriffe automatisch aktualisieren
CREATE EVENT IF NOT EXISTS evt_update_expired_attacks
ON SCHEDULE EVERY 10 SECOND
DO CALL sp_update_expired_attacks();

-- Event: Alte Logs bereinigen (älter als 90 Tage)
CREATE EVENT IF NOT EXISTS evt_cleanup_old_logs
ON SCHEDULE EVERY 1 DAY
DO DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- ============================================
-- INDEXES für Performance-Optimierung
-- ============================================

-- Zusammengesetzte Indexes für häufige Abfragen
ALTER TABLE stresser_attacks ADD INDEX idx_user_status (user_id, status);
ALTER TABLE vulnerability_scans ADD INDEX idx_user_scanner (user_id, scanner_type);

-- ============================================
-- DATEN EINFÜGEN (Beispieldaten)
-- ============================================

-- Beispiel-Benutzer hinzufügen
INSERT INTO users (id, username, password_hash, is_owner, created_at)
VALUES 
    ('user_operator1', 'user1', '$argon2id$v=19$m=65536,t=4,p=1$ZGVmYXVsdHNhbHQxMjM0NTY$YqHqOKqJQ4YqVqYqZqYqZqYqZqYqZqYqZqYqZqYqZqY', 0, NOW())
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- BERECHTIGUNGEN (Optional)
-- ============================================
-- GRANT ALL PRIVILEGES ON sir_dashboard.* TO 'sir_user'@'localhost' IDENTIFIED BY 'sicheres_passwort';
-- FLUSH PRIVILEGES;

-- ============================================
-- ENDE DES SCHEMAS
-- ============================================
