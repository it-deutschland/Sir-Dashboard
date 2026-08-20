# 🚀 Sir Dashboard - Windows Server IIS Deployment

## Schnellübersicht

Sir Dashboard ist eine hackermäßige All-in-One Security Operations Center (SOC) Dashboard-Anwendung, die speziell für **Windows Server 2022 mit IIS, PHP 8.5.4 und MariaDB 11.4.10** entwickelt wurde.

---

## 📦 Was ist enthalten?

### Frontend (React + TypeScript)
- Dashboard mit Echtzeit-Updates
- Login-System mit Session-Management
- Schwachstellen-Scanner-Integration
- Website-Analyse (ähnlich Censys.io)
- Stresser-Test zu Demonstrationszwecken
- Admin-Panel (nur für Owner)
- Angriffs-Historie und Statistiken

### Backend (PHP 8.5.4)
- RESTful API
- MariaDB/MySQL Datenbankintegration
- Session-Verwaltung
- User-Management
- API-Integration (Fluxstress, Netdowner)
- Activity Logging
- CSRF-Schutz

### Datenbank (MariaDB 11.4.10)
- Character Set: `utf8mb4`
- Collation: `utf8mb4_general_ci`
- 8 Tabellen für alle Funktionen
- Vollständig relationales Schema

---

## 🎯 Installation - 3 Optionen

### Option 1: Automatisches Setup (Empfohlen für Anfänger)

1. **PowerShell als Administrator öffnen**:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   cd C:\path\to\sir-dashboard
   .\setup-sir-dashboard.ps1
   ```

2. **Folgen Sie den Anweisungen auf dem Bildschirm**

3. **Das Script konfiguriert automatisch**:
   - PHP-Verzeichnisse und Berechtigungen
   - IIS Site und Application Pool
   - FastCGI Handler
   - Firewall-Regeln

### Option 2: Manuelle Installation (Für Fortgeschrittene)

Siehe detaillierte Anleitung: **[IIS_SETUP_GUIDE.md](./IIS_SETUP_GUIDE.md)**

Diese 70+ Seiten Anleitung deckt ab:
- MariaDB Installation und Konfiguration
- PHP Installation mit allen Erweiterungen
- IIS Konfiguration mit FastCGI
- Schritt-für-Schritt Anleitungen mit Screenshots
- Fehlerbehebung für häufige Probleme
- Sicherheits-Best-Practices

### Option 3: Schnellstart für Profis

```powershell
# 1. MariaDB installieren
# Download: https://mariadb.org/download/
# Während Installation: UTF8 aktivieren, Root-Passwort setzen

# 2. PHP 8.5.4 TS installieren
# Download: https://windows.php.net/download/
# Entpacken nach C:\PHP, php.ini konfigurieren

# 3. IIS mit CGI-Rolle installieren
Install-WindowsFeature -Name Web-Server, Web-CGI -IncludeManagementTools

# 4. Dashboard-Dateien kopieren
# Nach: C:\inetpub\wwwroot\sir-dashboard

# 5. Datenbank importieren
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -u root -p < C:\inetpub\wwwroot\sir-dashboard\php-backend\database.sql

# 6. config.php bearbeiten
# DB_PASS setzen!

# 7. IIS Site erstellen
# IIS Manager → Add Website → Sir Dashboard

# 8. Testen
# http://localhost/php-backend/test-connection.php
```

---

## 🧪 Installation testen

Nach der Installation öffnen Sie im Browser:

```
http://localhost/php-backend/test-connection.php
```

Diese Seite prüft automatisch:
- ✅ PHP-Version und Thread Safety
- ✅ Alle erforderlichen PHP-Erweiterungen
- ✅ Datenbankverbindung
- ✅ Tabellen-Schema
- ✅ Dateisystem-Berechtigungen
- ✅ Session-Funktionalität
- ✅ API-Konfiguration
- ✅ IIS-Setup

### Erwartetes Ergebnis:
![Test Success](https://via.placeholder.com/800x400/00ff88/000000?text=ALLE+TESTS+BESTANDEN)

**Alle Tests sollten grün (✓) sein!**

---

## 🔑 Erster Login

Nach erfolgreicher Installation:

1. Öffnen Sie: `http://localhost/` oder `http://IHR-SERVER-IP/`

2. **Standard-Zugangsdaten**:
   ```
   Benutzername: admin
   Passwort: admin123
   ```

3. **⚠️ WICHTIG**: Ändern Sie sofort das Admin-Passwort!
   - Navigieren Sie zu **Admin Panel**
   - Klicken Sie auf **Benutzer verwalten**
   - Ändern Sie das Passwort

---

## 📁 Dateistruktur

```
C:\inetpub\wwwroot\sir-dashboard\
│
├── php-backend\                    ← PHP Backend
│   ├── api\                        ← REST API Endpoints
│   │   ├── scans.php              (Schwachstellen-Scans)
│   │   ├── stresser.php           (Stresser-Tests)
│   │   ├── users.php              (User-Management)
│   │   └── website-analysis.php   (Website-Analyse)
│   │
│   ├── auth\                       ← Authentifizierung
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── check-session.php
│   │
│   ├── config.php                  ← ⚠️ HAUPTKONFIGURATION
│   ├── database.sql                ← Datenbank-Schema
│   ├── test-connection.php         ← Installations-Test
│   ├── web.config                  ← IIS URL Rewrite
│   └── logs\                       ← Log-Dateien
│
├── src\                            ← React Frontend
│   ├── components\
│   ├── hooks\
│   └── ...
│
├── index.html                      ← Einstiegspunkt
├── IIS_SETUP_GUIDE.md             ← Vollständige Anleitung
├── INSTALLATION_DE.md             ← Kurzanleitung
├── setup-sir-dashboard.ps1        ← Automatisches Setup
└── README_DEPLOYMENT.md           ← Diese Datei
```

---

## ⚙️ Konfiguration

### config.php bearbeiten

Die wichtigste Datei: `C:\inetpub\wwwroot\sir-dashboard\php-backend\config.php`

```php
// ===========================
// DATENBANK KONFIGURATION
// ===========================
define('DB_HOST', 'localhost');       // Host (meist 'localhost')
define('DB_NAME', 'sir_dashboard');   // Datenbankname
define('DB_USER', 'root');            // Datenbank-Benutzer
define('DB_PASS', '');                // ⚠️ IHR PASSWORT HIER!

// ===========================
// API KONFIGURATION
// ===========================
// Fluxstress (Master Botnet)
define('FLUXSTRESS_API_TOKEN', 'IHR_TOKEN');

// Netdowner (Master Stresser)
define('NETDOWNER_API_TOKEN', 'IHR_TOKEN');
```

### php.ini anpassen (C:\PHP\php.ini)

Wichtige Einstellungen für Produktion:

```ini
; Fehleranzeige deaktivieren
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = "C:/PHP/logs/php_errors.log"

; Zeitzone
date.timezone = Europe/Berlin

; Upload-Limits
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300
memory_limit = 256M

; Erforderliche Erweiterungen
extension=curl
extension=mbstring
extension=mysqli
extension=openssl
extension=pdo_mysql
```

Nach Änderungen:
```powershell
iisreset /restart
```

---

## 🛠️ Wartung

### Datenbank-Backup

**Manuell**:
```powershell
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysqldump.exe -u root -p sir_dashboard > backup_$(Get-Date -Format yyyyMMdd).sql
```

**Automatisch** (Task Scheduler):
Siehe [IIS_SETUP_GUIDE.md - Abschnitt 7.6](./IIS_SETUP_GUIDE.md#6-regelmäßige-backups-einrichten)

### Logs überprüfen

```powershell
# PHP-Fehlerlog
Get-Content C:\PHP\logs\php_errors.log -Tail 50

# IIS-Logs
Get-Content C:\inetpub\logs\LogFiles\W3SVC1\*.log -Tail 50

# Dashboard-Logs
Get-Content C:\inetpub\wwwroot\sir-dashboard\php-backend\logs\php-error.log -Tail 50
```

### IIS neu starten

```powershell
# Kompletter Neustart
iisreset /restart

# Nur eine Site neu starten
Restart-WebAppPool -Name "Sir Dashboard"
```

---

## 🔒 Sicherheit

### Nach Installation durchführen:

1. **Admin-Passwort ändern** (sofort!)
2. **PHP Fehleranzeige deaktivieren**:
   ```ini
   ; in php.ini:
   display_errors = Off
   ```
3. **HTTPS einrichten**:
   - IIS Manager → Site → Bindings → HTTPS hinzufügen
   - SSL-Zertifikat installieren
4. **Firewall konfigurieren**:
   ```powershell
   # Port 80/443 für Web öffnen
   New-NetFirewallRule -DisplayName "Sir Dashboard HTTP" -LocalPort 80 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Sir Dashboard HTTPS" -LocalPort 443 -Protocol TCP -Action Allow
   
   # Port 3306 nur für localhost
   New-NetFirewallRule -DisplayName "MariaDB" -LocalPort 3306 -Protocol TCP -Action Allow -RemoteAddress 127.0.0.1
   ```
5. **Datenbank-Benutzer mit eingeschränkten Rechten**:
   ```sql
   CREATE USER 'sir_user'@'localhost' IDENTIFIED BY 'STARKES_PASSWORT';
   GRANT SELECT, INSERT, UPDATE, DELETE ON sir_dashboard.* TO 'sir_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

---

## 🐛 Fehlerbehebung

### Problem: "Datenbankverbindung fehlgeschlagen"

**Ursache**: Falsche Zugangsdaten oder MariaDB läuft nicht

**Lösung**:
```powershell
# Service prüfen
Get-Service MySQL

# Falls gestoppt:
Start-Service MySQL

# Zugangsdaten testen:
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -u root -p sir_dashboard
```

### Problem: "500 Internal Server Error"

**Ursache**: PHP-Fehler oder FastCGI-Problem

**Lösung**:
```powershell
# 1. Detaillierte Fehler aktivieren
# IIS Manager → Error Pages → Edit Feature Settings → Detailed errors

# 2. PHP-Log prüfen
notepad C:\PHP\logs\php_errors.log

# 3. IIS neu starten
iisreset /restart
```

### Problem: "PHP-Erweiterung fehlt"

**Ursache**: Erweiterung nicht in php.ini aktiviert

**Lösung**:
```ini
; In C:\PHP\php.ini das Semikolon entfernen:
extension=mysqli
extension=pdo_mysql
extension=mbstring
extension=openssl
extension=curl
```

Dann:
```powershell
iisreset /restart
```

### Weitere Probleme?

Siehe vollständige Fehlerbehebung in:
- **[IIS_SETUP_GUIDE.md - Abschnitt 6](./IIS_SETUP_GUIDE.md#6-fehlerbehebung)**

Oder führen Sie den Test aus:
```
http://localhost/php-backend/test-connection.php
```

---

## 📊 Datenbank-Schema

### Tabellen-Übersicht

| Tabelle | Beschreibung | Datensätze (initial) |
|---------|--------------|---------------------|
| `users` | Benutzerverwaltung | 1 (admin) |
| `stresser_attacks` | Stresser-Test Historie | 0 |
| `vulnerability_scans` | Schwachstellen-Scans | 0 |
| `scan_vulnerabilities` | Detaillierte Scan-Ergebnisse | 0 |
| `website_analyses` | Website-Analysen | 0 |
| `website_endpoints` | Gefundene Endpoints | 0 |
| `website_software` | Erkannte Software | 0 |
| `activity_logs` | System-Aktivitäten | 0 |

### ER-Diagramm

```
users (1) ──< (n) stresser_attacks
  │
  ├──< (n) vulnerability_scans
  │             │
  │             └──< (n) scan_vulnerabilities
  │
  └──< (n) website_analyses
                │
                ├──< (n) website_endpoints
                └──< (n) website_software
```

---

## 🚀 Performance-Optimierung

### PHP OpCache aktivieren

In `C:\PHP\php.ini`:
```ini
zend_extension=opcache
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
```

### IIS Application Pool Tuning

```powershell
# IIS Manager → Application Pools → Sir Dashboard → Advanced Settings
# 
# Start Mode: AlwaysRunning
# Idle Time-out: 20 minutes
# Recycling: 1740 minutes (29 hours)
```

### MariaDB Optimierung

In `C:\Program Files\MariaDB 11.4\data\my.ini`:
```ini
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 100
query_cache_size = 32M
query_cache_type = 1
```

---

## 📚 Weitere Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| **IIS_SETUP_GUIDE.md** | Vollständige Installations-Anleitung (70+ Seiten) |
| **INSTALLATION_DE.md** | Kurzanleitung für Installation |
| **PHP_MYSQL_MIGRATION.md** | Migration von React zu PHP/MySQL |
| **API_INTEGRATION_COMPLETE.md** | API-Integration Details |
| **SCHNELLSTART_ANLEITUNG.md** | Quick-Start Guide |
| **PRD.md** | Product Requirements Document |

---

## 🎓 Häufig gestellte Fragen (FAQ)

### F: Kann ich MySQL statt MariaDB verwenden?
**A**: Ja, MySQL 5.5+ oder 8.0+ funktioniert auch. Wichtig ist `utf8mb4` Character Set.

### F: Funktioniert das auch auf Windows 10/11?
**A**: Ja, die Anleitung ist identisch. IIS muss über "Windows-Features" aktiviert werden.

### F: Wie ändere ich den Port von 80?
**A**: IIS Manager → Site → Bindings → Port ändern. Firewall-Regel anpassen.

### F: Brauche ich einen Domain-Namen?
**A**: Nein, `http://localhost` oder `http://SERVER-IP` funktioniert.

### F: Wie erstelle ich weitere Benutzer?
**A**: Login als Admin → Admin Panel → Benutzer erstellen (nur Owner).

### F: Kann ich das Dashboard extern erreichbar machen?
**A**: Ja, aber HTTPS und starke Passwörter sind Pflicht! Firewall-Regel für Port 443 erstellen.

### F: Wie setze ich alles zurück?
**A**: 
```sql
-- MariaDB-Kommandozeile:
DROP DATABASE sir_dashboard;
CREATE DATABASE sir_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
EXIT;

-- SQL neu importieren:
mysql -u root -p sir_dashboard < database.sql
```

---

## 🆘 Support

### Bei Problemen:

1. **Test-Seite aufrufen**: `http://localhost/php-backend/test-connection.php`
2. **Logs prüfen**: 
   - `C:\PHP\logs\php_errors.log`
   - `C:\inetpub\wwwroot\sir-dashboard\php-backend\logs\php-error.log`
3. **Fehlerbehebung lesen**: [IIS_SETUP_GUIDE.md](./IIS_SETUP_GUIDE.md#6-fehlerbehebung)

### Hilfreiche Befehle:

```powershell
# System-Status prüfen
Get-Service MySQL          # MariaDB läuft?
Get-IISSite               # IIS Sites
php -v                    # PHP-Version
php -m                    # PHP-Erweiterungen

# Logs in Echtzeit
Get-Content C:\PHP\logs\php_errors.log -Tail 50 -Wait

# IIS neu starten
iisreset /restart

# Berechtigungen neu setzen
icacls "C:\inetpub\wwwroot\sir-dashboard" /reset /T
icacls "C:\inetpub\wwwroot\sir-dashboard" /grant "IIS_IUSRS:(OI)(CI)RX" /T
```

---

## ✅ Checkliste

Nach Installation abhaken:

- [ ] MariaDB installiert und läuft
- [ ] Datenbank `sir_dashboard` erstellt
- [ ] `database.sql` importiert
- [ ] PHP 8.5.4 TS installiert
- [ ] `php.ini` konfiguriert
- [ ] Alle PHP-Erweiterungen aktiviert
- [ ] IIS mit FastCGI konfiguriert
- [ ] Sir Dashboard Site erstellt
- [ ] Dashboard-Dateien kopiert
- [ ] `config.php` mit DB-Passwort aktualisiert
- [ ] Berechtigungen gesetzt
- [ ] Test-Seite erfolgreich (alle grün)
- [ ] Dashboard-Login funktioniert
- [ ] Admin-Passwort geändert
- [ ] `display_errors = Off` in Produktion
- [ ] Firewall-Regeln erstellt
- [ ] HTTPS eingerichtet (optional)
- [ ] Backup-Strategie implementiert

---

## 📝 Lizenz

Siehe [LICENSE](./LICENSE)

---

## 🎉 Fertig!

Ihr Sir Dashboard ist jetzt bereit für den Einsatz!

**Dashboard**: `http://localhost/`  
**Test-Seite**: `http://localhost/php-backend/test-connection.php`  
**Login**: admin / admin123 ⚠️ **Passwort ändern!**

---

**Sir Dashboard - Security Operations Center**  
*Windows Server Edition*  
Version 1.0
