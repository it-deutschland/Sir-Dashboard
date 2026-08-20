# Sir Dashboard - PHP/MySQL Installation Guide

## Systemanforderungen

- **Windows Server 2022**
- **IIS 7+**
- **PHP 8.5.4 (Thread Safe)** mit FastCGI
- **MariaDB 11.4.10** (oder MySQL 5.5+)
- **PHP Erweiterungen:**
  - php_mysqli
  - php_pdo_mysql
  - php_mbstring
  - php_openssl
  - php_curl
  - php_json

---

## Installation Schritt für Schritt

### 1. MariaDB/MySQL Installation

1. **MariaDB 11.4.10 herunterladen und installieren:**
   - Download: https://mariadb.org/download/
   - Während der Installation:
     - Root-Passwort festlegen
     - "Enable UTF8" auswählen

2. **Datenbank einrichten:**
   ```bash
   # MySQL Command Line öffnen
   mysql -u root -p
   
   # Datenbank-Schema importieren
   source C:\path\to\sir-dashboard\php-backend\database.sql
   ```

   **Alternativ mit phpMyAdmin oder HeidiSQL:**
   - Neue Datenbank `sir_dashboard` erstellen
   - Character Set: `utf8mb4`
   - Collation: `utf8mb4_general_ci`
   - SQL-Datei `database.sql` importieren

---

### 2. PHP 8.5.4 Installation (Thread Safe)

1. **PHP herunterladen:**
   - Download: https://windows.php.net/download/
   - Version: **PHP 8.5.4 Thread Safe (TS) x64**
   - ZIP-Datei nach `C:\PHP` entpacken

2. **PHP konfigurieren:**
   ```bash
   # php.ini erstellen
   cd C:\PHP
   copy php.ini-production php.ini
   ```

3. **php.ini bearbeiten** (mit Notepad oder Editor):
   ```ini
   ; Wichtige Erweiterungen aktivieren (Semikolon entfernen)
   extension=mysqli
   extension=pdo_mysql
   extension=mbstring
   extension=openssl
   extension=curl
   extension=fileinfo
   extension=gd2
   
   ; Zeitzonen-Einstellung
   date.timezone = Europe/Berlin
   
   ; Upload-Limits
   upload_max_filesize = 100M
   post_max_size = 100M
   max_execution_time = 300
   memory_limit = 256M
   
   ; Session-Einstellungen
   session.save_path = "C:\PHP\sessions"
   
   ; Fehlerberichterstattung (Produktion)
   display_errors = Off
   log_errors = On
   error_log = "C:\PHP\logs\php_errors.log"
   ```

4. **Ordner erstellen:**
   ```bash
   mkdir C:\PHP\sessions
   mkdir C:\PHP\logs
   ```

---

### 3. IIS Konfiguration

#### 3.1 IIS-Rolle installieren (falls nicht vorhanden)

1. **Server Manager** öffnen
2. **Rollen und Features hinzufügen**
3. **Webserver (IIS)** auswählen
4. **CGI** unter "Anwendungsentwicklung" aktivieren

#### 3.2 PHP mit IIS verknüpfen

1. **IIS-Manager** öffnen
2. Linke Seite: **Server-Name** auswählen
3. **Handler-Zuordnungen** doppelklicken
4. Rechts: **Modulzuordnung hinzufügen**
   - **Anforderungspfad:** `*.php`
   - **Modul:** FastCgiModule
   - **Ausführbare Datei:** `C:\PHP\php-cgi.exe`
   - **Name:** PHP_via_FastCGI

5. **FastCGI-Einstellungen** konfigurieren:
   - IIS-Manager → Server → **FastCGI-Einstellungen**
   - `C:\PHP\php-cgi.exe` auswählen → **Bearbeiten**
   - **Maximale Anforderungen:** 10000
   - **Aktivitätstimeout:** 300
   - **Anforderungstimeout:** 300
   - **Umgebungsvariablen:**
     - `PHP_FCGI_MAX_REQUESTS` = 10000

#### 3.3 Website erstellen

1. **IIS-Manager** → **Sites** → Rechtsklick → **Website hinzufügen**
2. **Einstellungen:**
   - **Sitename:** Sir Dashboard
   - **Physischer Pfad:** `C:\inetpub\wwwroot\sir-dashboard`
   - **Port:** 80 (oder gewünschter Port)
   - **Hostname:** (optional) sir-dashboard.local

3. **Anwendungspool konfigurieren:**
   - **Anwendungspools** → **Sir Dashboard** auswählen
   - **Grundeinstellungen:**
     - **.NET CLR-Version:** Kein verwalteter Code
     - **Pipelinemodus:** Integriert
   - **Erweiterte Einstellungen:**
     - **Zeitlimit für Leerlauf:** 20 Minuten
     - **Recycling:** Nach 1740 Minuten

---

### 4. Sir Dashboard Installation

#### 4.1 Dateien kopieren

1. **Dashboard-Dateien kopieren:**
   ```
   C:\inetpub\wwwroot\sir-dashboard\
   ├── php-backend\
   │   ├── config.php
   │   ├── database.sql
   │   ├── api\
   │   ├── auth\
   │   └── ...
   ├── index.php
   └── ...
   ```

#### 4.2 Konfiguration anpassen

1. **config.php öffnen** (`C:\inetpub\wwwroot\sir-dashboard\php-backend\config.php`)

2. **Datenbankzugangsdaten anpassen:**
   ```php
   define('DB_HOST', 'localhost');          // Ihr MySQL/MariaDB Host
   define('DB_NAME', 'sir_dashboard');      // Datenbankname
   define('DB_USER', 'root');               // Datenbankbenutzer
   define('DB_PASS', 'IhrPasswortHier');    // Datenbankpasswort
   ```

3. **API-Token anpassen** (falls erforderlich):
   ```php
   define('FLUXSTRESS_API_TOKEN', 'IhrFluxstressToken');
   define('NETDOWNER_API_TOKEN', 'IhrNetdownerToken');
   ```

#### 4.3 Berechtigungen setzen

1. **Ordnerberechtigungen:**
   - Rechtsklick auf `C:\inetpub\wwwroot\sir-dashboard`
   - **Eigenschaften** → **Sicherheit** → **Bearbeiten**
   - **IUSR** und **IIS_IUSRS** hinzufügen
   - Berechtigungen: **Lesen & Ausführen**, **Ordnerinhalt auflisten**, **Lesen**

2. **Schreibrechte für Logs:**
   ```bash
   # Für C:\inetpub\wwwroot\sir-dashboard\logs
   # IUSR und IIS_IUSRS: Ändern-Berechtigung erteilen
   ```

---

### 5. Testen der Installation

1. **Browser öffnen** und zu `http://localhost` oder `http://your-server-ip` navigieren

2. **Standard-Login:**
   - **Benutzername:** `admin`
   - **Passwort:** `admin123`
   
   ⚠️ **WICHTIG:** Passwort sofort nach erstem Login ändern!

3. **Datenbankverbindung testen:**
   - Erstellen Sie eine Testdatei: `C:\inetpub\wwwroot\sir-dashboard\test-db.php`
   ```php
   <?php
   require_once 'php-backend/config.php';
   
   try {
       $pdo = getDbConnection();
       echo "✓ Datenbankverbindung erfolgreich!";
   } catch (Exception $e) {
       echo "✗ Fehler: " . $e->getMessage();
   }
   ?>
   ```
   - Browser: `http://localhost/test-db.php`
   - Bei Erfolg sollte "Datenbankverbindung erfolgreich!" erscheinen

---

## Fehlerbehebung

### PHP-Fehler werden nicht angezeigt

1. **php.ini prüfen:**
   ```ini
   display_errors = On  ; Nur für Entwicklung!
   error_reporting = E_ALL
   ```

2. **IIS neu starten:**
   ```bash
   iisreset
   ```

### Datenbankverbindungsfehler

1. **MariaDB läuft?**
   ```bash
   # Services prüfen
   services.msc
   # "MariaDB" oder "MySQL" sollte "Wird ausgeführt" sein
   ```

2. **Zugangsdaten korrekt?**
   - In `config.php` überprüfen
   - Mit MySQL Command Line testen:
     ```bash
     mysql -u root -p sir_dashboard
     ```

### 500 Internal Server Error

1. **FastCGI-Fehlerprotokoll prüfen:**
   - IIS-Manager → Site → **Fehlerseiten**
   - **Detaillierte Fehler** aktivieren

2. **PHP-Fehlerlog prüfen:**
   ```
   C:\PHP\logs\php_errors.log
   ```

3. **IIS-Fehlerlog:**
   ```
   C:\inetpub\logs\LogFiles\W3SVC1\
   ```

### Dateiberechtigungsfehler

```bash
# PowerShell als Administrator
icacls "C:\inetpub\wwwroot\sir-dashboard" /grant "IIS_IUSRS:(OI)(CI)RX" /T
icacls "C:\inetpub\wwwroot\sir-dashboard\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T
```

---

## Sicherheitsempfehlungen

### Nach der Installation:

1. **Admin-Passwort ändern** (sofort!)
2. **PHP-Fehleranzeige deaktivieren** (Produktion):
   ```ini
   display_errors = Off
   ```
3. **SSL/TLS einrichten** für HTTPS
4. **Firewall konfigurieren**:
   - Port 80/443 für Web
   - Port 3306 nur für localhost (MariaDB)
5. **Regelmäßige Backups** der Datenbank:
   ```bash
   mysqldump -u root -p sir_dashboard > backup_$(date +%Y%m%d).sql
   ```

---

## Nützliche Befehle

### IIS neu starten
```bash
iisreset
```

### MariaDB neu starten
```bash
net stop MySQL
net start MySQL
```

### PHP-Version prüfen
```bash
C:\PHP\php.exe -v
```

### Datenbank-Backup erstellen
```bash
mysqldump -u root -p sir_dashboard > sir_dashboard_backup.sql
```

### Datenbank-Backup wiederherstellen
```bash
mysql -u root -p sir_dashboard < sir_dashboard_backup.sql
```

---

## Support & Weitere Informationen

- **PHP Dokumentation:** https://www.php.net/docs.php
- **MariaDB Dokumentation:** https://mariadb.com/kb/en/documentation/
- **IIS Dokumentation:** https://docs.microsoft.com/en-us/iis/

---

## Checkliste

- [ ] MariaDB 11.4.10 installiert
- [ ] Datenbank `sir_dashboard` erstellt
- [ ] SQL-Schema (`database.sql`) importiert
- [ ] PHP 8.5.4 TS installiert (`C:\PHP`)
- [ ] `php.ini` konfiguriert
- [ ] PHP-Erweiterungen aktiviert
- [ ] IIS-Rolle installiert
- [ ] FastCGI konfiguriert
- [ ] Website in IIS erstellt
- [ ] Dashboard-Dateien kopiert
- [ ] `config.php` angepasst
- [ ] Berechtigungen gesetzt
- [ ] Login-Test erfolgreich
- [ ] Admin-Passwort geändert

---

**Viel Erfolg mit Ihrem Sir Dashboard! 🚀**
