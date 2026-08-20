# 🚀 Sir Dashboard - Komplette IIS Setup-Anleitung

## Windows Server 2022 + IIS + PHP 8.5.4 + MariaDB 11.4.10

Diese Anleitung führt Sie Schritt für Schritt durch die vollständige Installation und Konfiguration.

---

## 📋 Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [MariaDB Installation](#1-mariadb-installation)
3. [PHP Installation](#2-php-installation)
4. [IIS Konfiguration](#3-iis-konfiguration)
5. [Dashboard Installation](#4-dashboard-installation)
6. [Erste Schritte](#5-erste-schritte)
7. [Fehlerbehebung](#6-fehlerbehebung)
8. [Sicherheit](#7-sicherheit)

---

## Voraussetzungen

- ✅ Windows Server 2022 (oder Windows 10/11)
- ✅ Administrator-Rechte
- ✅ Internetzugang für Downloads
- ✅ Mindestens 4 GB RAM
- ✅ 10 GB freier Festplattenspeicher

---

## 1. MariaDB Installation

### Schritt 1.1: Download

1. Öffnen Sie: https://mariadb.org/download/
2. Wählen Sie:
   - **Version**: 11.4.10 (oder neuste 11.x)
   - **OS**: Windows
   - **Architecture**: x86_64 (64-bit)
3. Download: `mariadb-11.4.10-winx64.msi`

### Schritt 1.2: Installation

1. Führen Sie die MSI-Datei als Administrator aus
2. **Welcome Screen**: Click "Next"
3. **License Agreement**: Akzeptieren Sie und klicken Sie "Next"
4. **Custom Setup**: 
   - Belassen Sie alle Standard-Komponenten
   - Click "Next"
5. **Default Instance Properties**:
   ```
   ⚠️ WICHTIG - Notieren Sie diese Eingaben!
   
   Root Password: [Wählen Sie ein sicheres Passwort]
   Confirm Password: [Wiederholen Sie das Passwort]
   
   ☑ Enable access from remote machines (optional)
   ☑ Use UTF8 as default server's character set (WICHTIG!)
   ```
6. Click "Next" → "Install"
7. Warten Sie, bis die Installation abgeschlossen ist
8. Click "Finish"

### Schritt 1.3: MariaDB Testen

1. Öffnen Sie **PowerShell als Administrator**:
   ```powershell
   # MariaDB-Service prüfen
   Get-Service -Name MySQL
   
   # Sollte ausgeben: Status = Running
   ```

2. Testen Sie den Zugriff:
   ```powershell
   # MySQL Client öffnen
   cd "C:\Program Files\MariaDB 11.4\bin"
   .\mysql.exe -u root -p
   
   # Geben Sie Ihr Root-Passwort ein
   ```

3. In der MySQL-Kommandozeile:
   ```sql
   -- Version anzeigen
   SELECT VERSION();
   
   -- Sollte z.B. ausgeben: 11.4.10-MariaDB
   
   -- Beenden
   EXIT;
   ```

### Schritt 1.4: Datenbank erstellen

**Option A: Mit HeidiSQL (empfohlen für Anfänger)**

1. HeidiSQL ist bereits mit MariaDB installiert
2. Öffnen Sie: `C:\Program Files\MariaDB 11.4\HeidiSQL.exe`
3. **Session Manager**:
   - Network type: MySQL (TCP/IP)
   - Hostname: localhost
   - User: root
   - Password: [Ihr MariaDB Root-Passwort]
   - Port: 3306
4. Click "Open"
5. Rechtsklick auf "Unnamed" → **Create new** → **Database**
   - Name: `sir_dashboard`
   - Collation: `utf8mb4_general_ci`
   - Click "OK"
6. Wählen Sie die Datenbank `sir_dashboard` aus
7. Click **File** → **Load SQL file...**
8. Navigieren Sie zu: `C:\inetpub\wwwroot\sir-dashboard\php-backend\database.sql`
9. Click **Execute** (F9)
10. Überprüfen Sie links im Tree: Sollten jetzt Tabellen sehen

**Option B: Mit Kommandozeile**

```powershell
# PowerShell als Administrator
cd "C:\Program Files\MariaDB 11.4\bin"

# SQL-Datei importieren
.\mysql.exe -u root -p < C:\inetpub\wwwroot\sir-dashboard\php-backend\database.sql

# Geben Sie Ihr Root-Passwort ein
# Warten Sie auf "Import abgeschlossen"

# Überprüfen
.\mysql.exe -u root -p sir_dashboard

# In MySQL-Kommandozeile:
SHOW TABLES;
# Sollte 8-10 Tabellen anzeigen

EXIT;
```

---

## 2. PHP Installation

### Schritt 2.1: Download

1. Öffnen Sie: https://windows.php.net/download/
2. Suchen Sie nach **PHP 8.5.4** (oder neuste 8.5.x)
3. Download: **VS16 x64 Thread Safe**
   - Dateiname: `php-8.5.4-Win32-vs16-x64.zip`
   - ⚠️ **Wichtig**: **Thread Safe (TS)**, nicht NTS!

### Schritt 2.2: Installation

1. Erstellen Sie den Ordner: `C:\PHP`
2. Entpacken Sie die ZIP-Datei nach `C:\PHP`
3. Überprüfen Sie die Struktur:
   ```
   C:\PHP\
   ├── php.exe
   ├── php-cgi.exe
   ├── php.ini-production
   ├── ext\
   └── ...
   ```

### Schritt 2.3: PHP Konfigurieren

1. Öffnen Sie **PowerShell als Administrator**:
   ```powershell
   cd C:\PHP
   
   # php.ini-production als php.ini kopieren
   Copy-Item php.ini-production php.ini
   
   # Ordner für Sessions und Logs erstellen
   New-Item -ItemType Directory -Force -Path C:\PHP\sessions
   New-Item -ItemType Directory -Force -Path C:\PHP\logs
   
   # Berechtigungen setzen
   icacls "C:\PHP\sessions" /grant "IIS_IUSRS:(OI)(CI)M" /T
   icacls "C:\PHP\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T
   ```

2. Öffnen Sie `C:\PHP\php.ini` mit **Notepad** oder einem Editor

3. **Suchen und ändern** Sie folgende Zeilen:

   ```ini
   ; ===============================
   ; ERWEITERUNGEN AKTIVIEREN
   ; ===============================
   ; Entfernen Sie das Semikolon (;) vor diesen Zeilen:
   
   extension_dir = "C:/PHP/ext"
   
   extension=curl
   extension=fileinfo
   extension=gd
   extension=mbstring
   extension=mysqli
   extension=openssl
   extension=pdo_mysql
   
   ; ===============================
   ; ZEITZONE
   ; ===============================
   date.timezone = Europe/Berlin
   
   ; ===============================
   ; UPLOAD LIMITS
   ; ===============================
   upload_max_filesize = 100M
   post_max_size = 100M
   max_execution_time = 300
   max_input_time = 300
   memory_limit = 256M
   
   ; ===============================
   ; SESSION
   ; ===============================
   session.save_path = "C:/PHP/sessions"
   session.gc_maxlifetime = 7200
   
   ; ===============================
   ; FEHLERBERICHTERSTATTUNG
   ; ===============================
   ; Für Entwicklung:
   display_errors = On
   display_startup_errors = On
   error_reporting = E_ALL
   
   ; Für Produktion (nach Setup ändern!):
   ; display_errors = Off
   ; display_startup_errors = Off
   ; error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
   
   log_errors = On
   error_log = "C:/PHP/logs/php_errors.log"
   
   ; ===============================
   ; OPCACHE (Performance)
   ; ===============================
   zend_extension=opcache
   opcache.enable=1
   opcache.memory_consumption=128
   opcache.max_accelerated_files=10000
   opcache.revalidate_freq=60
   
   ; ===============================
   ; SICHERHEIT
   ; ===============================
   expose_php = Off
   allow_url_fopen = On
   allow_url_include = Off
   ```

4. **Speichern** Sie die Datei

### Schritt 2.4: Systemvariable setzen (Optional, aber empfohlen)

```powershell
# PowerShell als Administrator
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\PHP", "Machine")

# PowerShell neustarten, dann testen:
php -v
# Sollte ausgeben: PHP 8.5.4 (cli) ... (built: ...) (ZTS)
```

### Schritt 2.5: PHP-Erweiterungen prüfen

```powershell
php -m
# Sollte u.a. anzeigen:
# mysqli
# pdo_mysql
# mbstring
# openssl
# curl
# json
```

---

## 3. IIS Konfiguration

### Schritt 3.1: IIS-Rolle installieren

1. Öffnen Sie **Server Manager**
2. Click **Manage** → **Add Roles and Features**
3. **Before You Begin**: Click "Next"
4. **Installation Type**: Select "Role-based or feature-based installation" → "Next"
5. **Server Selection**: Wählen Sie Ihren Server → "Next"
6. **Server Roles**: 
   - ☑ **Web Server (IIS)**
   - Click "Add Features" im Pop-up
   - Click "Next"
7. **Features**: Click "Next"
8. **Web Server Role (IIS)**: Click "Next"
9. **Role Services**: Erweitern Sie **Application Development** und wählen Sie:
   - ☑ **CGI**
   - ☑ **ISAPI Extensions**
   - ☑ **ISAPI Filters**
10. Click "Next" → "Install"
11. Warten Sie, bis die Installation abgeschlossen ist
12. Click "Close"

### Schritt 3.2: FastCGI für PHP konfigurieren

1. Öffnen Sie **IIS Manager**:
   - Start → Run → `inetmgr` → Enter

2. **Handler-Zuordnung hinzufügen**:
   - Linke Seite: Wählen Sie Ihren **Server-Namen** (oberste Ebene)
   - Mitte: Doppelklick auf **Handler Mappings**
   - Rechte Seite: Click **Add Module Mapping...**
   - Eingaben:
     ```
     Request path: *.php
     Module: FastCgiModule
     Executable: C:\PHP\php-cgi.exe
     Name: PHP_via_FastCGI
     ```
   - Click "OK"
   - Dialog "Do you want to create a FastCGI application...?": Click "Yes"

3. **FastCGI-Einstellungen optimieren**:
   - IIS Manager → Server-Name → Doppelklick **FastCGI Settings**
   - Doppelklick auf `C:\PHP\php-cgi.exe`
   - **General**:
     - Instance MaxRequests: `10000`
     - Activity Timeout: `300`
     - Request Timeout: `300`
   - **Environment Variables**: Click "..." Button
   - Click "Add" und fügen Sie hinzu:
     ```
     Name: PHP_FCGI_MAX_REQUESTS
     Value: 10000
     ```
     ```
     Name: PHPRC
     Value: C:\PHP
     ```
   - Click "OK" → "OK"

### Schritt 3.3: Website erstellen

1. **IIS Manager**: Linke Seite: Rechtsklick auf **Sites** → **Add Website...**

2. **Site-Konfiguration**:
   ```
   Site name: Sir Dashboard
   
   Application pool: Sir Dashboard (wird automatisch erstellt)
   
   Physical path: C:\inetpub\wwwroot\sir-dashboard
   (Click "..." um Ordner auszuwählen/zu erstellen)
   
   Binding:
   - Type: http
   - IP address: All Unassigned
   - Port: 80
   - Host name: (leer lassen oder z.B. dashboard.local)
   ```

3. Click "OK"

### Schritt 3.4: Application Pool konfigurieren

1. **IIS Manager**: Linke Seite: Click **Application Pools**
2. Rechtsklick auf **Sir Dashboard** → **Advanced Settings...**
3. Ändern Sie:
   ```
   .NET CLR Version: No Managed Code
   Managed Pipeline Mode: Integrated
   Start Mode: AlwaysRunning
   Idle Time-out (minutes): 20
   ```
4. Click "OK"

### Schritt 3.5: Default Document konfigurieren

1. **IIS Manager**: Linke Seite: Wählen Sie **Sir Dashboard** Site
2. Doppelklick auf **Default Document**
3. Rechte Seite: Click "Add..."
4. Name: `index.php`
5. Click "OK"
6. Wählen Sie `index.php` und klicken Sie "Move Up" bis es ganz oben ist

### Schritt 3.6: web.config erstellen

Die `web.config` sollte bereits im Ordner `php-backend` existieren, aber hier zur Sicherheit:

1. Erstellen Sie die Datei: `C:\inetpub\wwwroot\sir-dashboard\php-backend\web.config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <!-- URL Rewrite für PHP Backend -->
        <rewrite>
            <rules>
                <rule name="API Routes" stopProcessing="true">
                    <match url="^api/(.*)$" />
                    <conditions>
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="api/{R:1}.php" />
                </rule>
            </rules>
        </rewrite>
        
        <!-- Handler für PHP -->
        <handlers>
            <add name="PHP_via_FastCGI" 
                 path="*.php" 
                 verb="GET,HEAD,POST,PUT,DELETE,OPTIONS" 
                 modules="FastCgiModule" 
                 scriptProcessor="C:\PHP\php-cgi.exe" 
                 resourceType="Either" 
                 requireAccess="Script" />
        </handlers>
        
        <!-- Default Document -->
        <defaultDocument>
            <files>
                <add value="index.php" />
            </files>
        </defaultDocument>
        
        <!-- Fehlerseiten (für Produktion) -->
        <httpErrors errorMode="Detailed" />
        
        <!-- Security -->
        <security>
            <requestFiltering>
                <requestLimits maxAllowedContentLength="104857600" /> <!-- 100 MB -->
            </requestFiltering>
        </security>
    </system.webServer>
</configuration>
```

---

## 4. Dashboard Installation

### Schritt 4.1: Dateien kopieren

1. Kopieren Sie alle Dashboard-Dateien nach:
   ```
   C:\inetpub\wwwroot\sir-dashboard\
   ```

2. Die Struktur sollte so aussehen:
   ```
   C:\inetpub\wwwroot\sir-dashboard\
   ├── php-backend\
   │   ├── api\
   │   │   ├── scans.php
   │   │   ├── stresser.php
   │   │   ├── users.php
   │   │   └── website-analysis.php
   │   ├── auth\
   │   ├── config.php
   │   ├── database.sql
   │   ├── test-connection.php  ← NEU!
   │   └── web.config
   ├── index.php (oder index.html)
   ├── INSTALLATION_DE.md
   └── ...
   ```

### Schritt 4.2: Berechtigungen setzen

**PowerShell als Administrator**:

```powershell
# Basis-Berechtigungen für IIS
icacls "C:\inetpub\wwwroot\sir-dashboard" /grant "IIS_IUSRS:(OI)(CI)RX" /T
icacls "C:\inetpub\wwwroot\sir-dashboard" /grant "IUSR:(OI)(CI)RX" /T

# Schreibrechte für Logs
New-Item -ItemType Directory -Force -Path "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs"
icacls "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T

# Überprüfen
icacls "C:\inetpub\wwwroot\sir-dashboard"
```

### Schritt 4.3: Konfiguration anpassen

1. Öffnen Sie: `C:\inetpub\wwwroot\sir-dashboard\php-backend\config.php`

2. **Ändern Sie die Datenbankzugangsdaten**:

```php
// ===========================
// DATENBANK KONFIGURATION
// ===========================
define('DB_HOST', 'localhost');       // Normalerweise 'localhost'
define('DB_NAME', 'sir_dashboard');   // Datenbankname
define('DB_USER', 'root');            // Ihr MySQL-Benutzer
define('DB_PASS', 'IHR_PASSWORT_HIER'); // ⚠️ IHR MariaDB ROOT-PASSWORT!
```

3. **API-Token anpassen** (optional, falls Sie eigene haben):

```php
// ===========================
// API KONFIGURATION
// ===========================
define('FLUXSTRESS_API_TOKEN', 'IHR_FLUXSTRESS_TOKEN');
define('NETDOWNER_API_TOKEN', 'IHR_NETDOWNER_TOKEN');
```

4. **Speichern** Sie die Datei

---

## 5. Erste Schritte

### Schritt 5.1: Verbindungstest

1. Öffnen Sie einen Browser
2. Navigieren Sie zu:
   ```
   http://localhost/php-backend/test-connection.php
   ```
   ODER
   ```
   http://IHR-SERVER-IP/php-backend/test-connection.php
   ```

3. **Sie sollten eine grüne Test-Seite sehen** mit:
   - ✓ PHP-Version 8.5.x
   - ✓ Alle Erweiterungen geladen
   - ✓ Datenbankverbindung erfolgreich
   - ✓ Alle Tabellen vorhanden
   - ✓ Schreibrechte OK

4. **Falls Fehler auftreten**: Siehe [Fehlerbehebung](#6-fehlerbehebung)

### Schritt 5.2: Dashboard aufrufen

1. Navigieren Sie zur Hauptseite:
   ```
   http://localhost/
   ```
   ODER
   ```
   http://IHR-SERVER-IP/
   ```

2. **Login-Daten** (Standard):
   ```
   Benutzername: admin
   Passwort: admin123
   ```

3. **⚠️ WICHTIG**: Ändern Sie sofort das Admin-Passwort!

### Schritt 5.3: Admin-Passwort ändern

1. Loggen Sie sich ein
2. Navigieren Sie zu **Admin Panel** (nur als Owner sichtbar)
3. Ändern Sie Ihr Passwort in den Einstellungen

---

## 6. Fehlerbehebung

### Problem: "Datenbankverbindung fehlgeschlagen"

**Lösung 1: Zugangsdaten prüfen**
```powershell
# Testen Sie die Verbindung manuell
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -u root -p sir_dashboard

# Wenn erfolgreich: Zugangsdaten sind korrekt
# Wenn fehlgeschlagen: Passwort falsch oder Datenbank existiert nicht
```

**Lösung 2: Datenbank existiert?**
```sql
-- In MySQL-Kommandozeile:
SHOW DATABASES;

-- sir_dashboard sollte in der Liste sein
-- Falls nicht:
CREATE DATABASE sir_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

**Lösung 3: MariaDB läuft?**
```powershell
# Service-Status prüfen
Get-Service -Name MySQL

# Falls nicht Running:
Start-Service MySQL
```

---

### Problem: "500 Internal Server Error"

**Lösung 1: Detaillierte Fehler aktivieren**
1. IIS Manager → Sir Dashboard Site
2. Doppelklick **Error Pages**
3. Rechte Seite: **Edit Feature Settings...**
4. Wählen Sie **Detailed errors**
5. Click "OK"
6. Seite neu laden → Sie sehen jetzt den genauen Fehler

**Lösung 2: PHP-Fehlerlog prüfen**
```powershell
# Öffnen Sie das PHP-Fehlerlog
notepad C:\PHP\logs\php_errors.log

# Oder Backend-Log:
notepad C:\inetpub\wwwroot\sir-dashboard\php-backend\logs\php-error.log
```

**Lösung 3: IIS-Fehlerlog prüfen**
```powershell
# IIS-Logs befinden sich in:
cd C:\inetpub\logs\LogFiles\W3SVC1\

# Neueste Log-Datei öffnen:
Get-ChildItem | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content
```

**Lösung 4: FastCGI-Prozess neu starten**
```powershell
# IIS vollständig neu starten
iisreset /restart

# PHP-CGI-Prozesse beenden
taskkill /F /IM php-cgi.exe

# IIS neu starten
iisreset /start
```

---

### Problem: "PHP-Erweiterung 'mysqli' fehlt"

**Lösung:**
1. Öffnen Sie: `C:\PHP\php.ini`
2. Suchen Sie nach `;extension=mysqli`
3. Entfernen Sie das Semikolon: `extension=mysqli`
4. Speichern Sie die Datei
5. IIS neu starten:
   ```powershell
   iisreset /restart
   ```

---

### Problem: "Logs-Verzeichnis nicht beschreibbar"

**Lösung:**
```powershell
# PowerShell als Administrator
New-Item -ItemType Directory -Force -Path "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs"

# Berechtigungen setzen
icacls "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T
icacls "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs" /grant "IUSR:(OI)(CI)M" /T

# Überprüfen
icacls "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs"
```

---

### Problem: "Session wird nicht gespeichert"

**Lösung:**
```powershell
# Session-Ordner erstellen
New-Item -ItemType Directory -Force -Path "C:\PHP\sessions"

# Berechtigungen setzen
icacls "C:\PHP\sessions" /grant "IIS_IUSRS:(OI)(CI)M" /T

# php.ini überprüfen:
notepad C:\PHP\php.ini

# Sicherstellen dass diese Zeile vorhanden ist:
# session.save_path = "C:/PHP/sessions"

# IIS neu starten
iisreset /restart
```

---

### Problem: "API-Aufrufe funktionieren nicht"

**Lösung 1: URL Rewrite installieren**
1. Download: https://www.iis.net/downloads/microsoft/url-rewrite
2. Installieren Sie das MSI
3. IIS neu starten

**Lösung 2: web.config prüfen**
- Überprüfen Sie, dass `web.config` im `php-backend` Ordner existiert
- Inhalt sollte die Rewrite-Regeln enthalten (siehe oben)

**Lösung 3: CORS-Probleme**
Falls API-Aufrufe von Frontend blockiert werden, fügen Sie in `config.php` hinzu:
```php
// CORS-Header setzen (ganz am Anfang der Datei)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
```

---

## 7. Sicherheit

### Nach der Installation SOFORT tun:

#### 1. Admin-Passwort ändern
```
Login → Admin Panel → Passwort ändern
```

#### 2. Fehleranzeige deaktivieren (Produktion)

**php.ini** (`C:\PHP\php.ini`):
```ini
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = "C:/PHP/logs/php_errors.log"
```

**config.php** (`C:\inetpub\wwwroot\sir-dashboard\php-backend\config.php`):
```php
error_reporting(0);
ini_set('display_errors', 0);
```

#### 3. HTTPS einrichten

1. **IIS Manager** → **Sir Dashboard** Site
2. Rechte Seite: **Bindings...**
3. Click "Add..."
   - Type: https
   - Port: 443
   - SSL certificate: Wählen Sie Ihr SSL-Zertifikat
4. Click "OK"

Für Entwicklung (Self-Signed Certificate):
```powershell
# PowerShell als Administrator
New-SelfSignedCertificate -DnsName "localhost", "dashboard.local" -CertStoreLocation cert:\LocalMachine\My

# Zertifikat in IIS Binding auswählen
```

#### 4. Firewall konfigurieren

```powershell
# PowerShell als Administrator

# Port 80 (HTTP) öffnen
New-NetFirewallRule -DisplayName "Sir Dashboard HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Port 443 (HTTPS) öffnen
New-NetFirewallRule -DisplayName "Sir Dashboard HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# Port 3306 (MySQL) NUR für localhost
New-NetFirewallRule -DisplayName "MariaDB Local Only" -Direction Inbound -LocalPort 3306 -Protocol TCP -Action Block -RemoteAddress Any
New-NetFirewallRule -DisplayName "MariaDB Localhost" -Direction Inbound -LocalPort 3306 -Protocol TCP -Action Allow -RemoteAddress 127.0.0.1,::1
```

#### 5. Datenbank-Benutzer mit eingeschränkten Rechten erstellen

```sql
-- MariaDB-Kommandozeile als root:
CREATE USER 'sir_dashboard_user'@'localhost' IDENTIFIED BY 'STARKES_PASSWORT_HIER';
GRANT SELECT, INSERT, UPDATE, DELETE ON sir_dashboard.* TO 'sir_dashboard_user'@'localhost';
FLUSH PRIVILEGES;
```

Dann in `config.php` ändern:
```php
define('DB_USER', 'sir_dashboard_user');
define('DB_PASS', 'STARKES_PASSWORT_HIER');
```

#### 6. Regelmäßige Backups einrichten

**Backup-Script erstellen** (`C:\Scripts\backup-sir-dashboard.ps1`):
```powershell
# Backup-Verzeichnis
$backupDir = "C:\Backups\SirDashboard"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Verzeichnis erstellen falls nicht vorhanden
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Datenbank-Backup
$mysqlPath = "C:\Program Files\MariaDB 11.4\bin\mysqldump.exe"
$dbBackupFile = "$backupDir\sir_dashboard_$timestamp.sql"
$dbPassword = "IHR_MYSQL_ROOT_PASSWORT"

& $mysqlPath -u root -p$dbPassword sir_dashboard > $dbBackupFile

# Alte Backups löschen (älter als 30 Tage)
Get-ChildItem -Path $backupDir -Filter "*.sql" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
    Remove-Item

Write-Host "Backup erstellt: $dbBackupFile"
```

**Task Scheduler einrichten**:
```powershell
# PowerShell als Administrator
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\Scripts\backup-sir-dashboard.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"
$principal = New-ScheduledTaskPrincipal -UserID "NT AUTHORITY\SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "Sir Dashboard Backup" -Action $action -Trigger $trigger -Principal $principal -Description "Tägliches Backup der Sir Dashboard Datenbank"
```

---

## 8. Nützliche Befehle

### IIS verwalten

```powershell
# IIS neu starten
iisreset /restart

# Alle Sites anzeigen
Get-IISSite

# Site stoppen/starten
Stop-IISSite -Name "Sir Dashboard"
Start-IISSite -Name "Sir Dashboard"

# Application Pool recyceln
Restart-WebAppPool -Name "Sir Dashboard"
```

### MariaDB verwalten

```powershell
# Service neu starten
Restart-Service MySQL

# Service-Status
Get-Service MySQL

# Datenbank-Backup
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysqldump.exe -u root -p sir_dashboard > C:\Backups\sir_dashboard_backup.sql

# Backup wiederherstellen
.\mysql.exe -u root -p sir_dashboard < C:\Backups\sir_dashboard_backup.sql
```

### Logs anzeigen

```powershell
# PHP-Fehlerlog
Get-Content C:\PHP\logs\php_errors.log -Tail 50 -Wait

# IIS-Logs
Get-Content C:\inetpub\logs\LogFiles\W3SVC1\*.log -Tail 50 -Wait

# Dashboard-Logs
Get-Content C:\inetpub\wwwroot\sir-dashboard\php-backend\logs\php-error.log -Tail 50 -Wait
```

---

## 9. Checkliste

Haken Sie nach Abschluss jeden Punkt ab:

### Installation
- [ ] MariaDB 11.4.10 installiert
- [ ] MariaDB Service läuft
- [ ] Datenbank `sir_dashboard` erstellt
- [ ] `database.sql` importiert
- [ ] PHP 8.5.4 Thread Safe installiert
- [ ] `php.ini` konfiguriert
- [ ] PHP-Erweiterungen aktiviert
- [ ] Sessions- und Logs-Ordner erstellt
- [ ] IIS-Rolle installiert
- [ ] FastCGI konfiguriert
- [ ] Handler-Zuordnung für PHP erstellt
- [ ] Sir Dashboard Site in IIS erstellt
- [ ] Application Pool konfiguriert

### Konfiguration
- [ ] Dashboard-Dateien nach `C:\inetpub\wwwroot\sir-dashboard` kopiert
- [ ] Berechtigungen mit icacls gesetzt
- [ ] `config.php` mit Datenbankzugangsdaten aktualisiert
- [ ] `web.config` vorhanden
- [ ] Default Document auf `index.php` gesetzt

### Tests
- [ ] `http://localhost/php-backend/test-connection.php` erfolgreich
- [ ] Alle Tests auf Test-Seite bestanden (grün)
- [ ] Dashboard-Login funktioniert
- [ ] Admin-Zugang funktioniert

### Sicherheit
- [ ] Admin-Passwort geändert
- [ ] `display_errors = Off` in php.ini (Produktion)
- [ ] Firewall-Regeln konfiguriert
- [ ] HTTPS eingerichtet (optional aber empfohlen)
- [ ] Backup-Script erstellt
- [ ] Task Scheduler für Backups eingerichtet

---

## 10. Support

### Häufige Fragen

**Q: Kann ich auch MySQL statt MariaDB verwenden?**
A: Ja, MySQL 5.5+ oder 8.0+ funktioniert auch. Character Set muss utf8mb4 sein.

**Q: Funktioniert das auch auf Windows 10/11?**
A: Ja, die Anleitung funktioniert identisch. IIS muss über "Windows-Features" aktiviert werden.

**Q: Wie ändere ich den Port von 80 auf etwas anderes?**
A: IIS Manager → Site → Bindings → Port ändern. Firewall-Regel anpassen.

**Q: Brauche ich einen Domain-Namen?**
A: Nein, Sie können `http://localhost` oder `http://SERVER-IP` verwenden.

**Q: Wie setze ich alles zurück?**
A: 
```powershell
# Datenbank löschen und neu erstellen
mysql -u root -p
DROP DATABASE sir_dashboard;
CREATE DATABASE sir_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
EXIT;

# SQL neu importieren
mysql -u root -p sir_dashboard < C:\inetpub\wwwroot\sir-dashboard\php-backend\database.sql
```

---

## Fertig! 🎉

Ihr Sir Dashboard ist jetzt einsatzbereit!

**Wichtige Links:**
- Dashboard: `http://localhost/`
- Verbindungstest: `http://localhost/php-backend/test-connection.php`
- HeidiSQL: `C:\Program Files\MariaDB 11.4\HeidiSQL.exe`
- PHP Info: Erstellen Sie `phpinfo.php` mit `<?php phpinfo(); ?>`

**Bei Problemen:**
1. Prüfen Sie die Test-Seite: `http://localhost/php-backend/test-connection.php`
2. Lesen Sie die Logs: `C:\PHP\logs\php_errors.log`
3. Konsultieren Sie die [Fehlerbehebung](#6-fehlerbehebung)

---

**Viel Erfolg mit Sir Dashboard! 💻🔒**
