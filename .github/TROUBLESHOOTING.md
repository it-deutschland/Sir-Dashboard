# 🔧 Sir Dashboard - Troubleshooting Guide

## Schnelle Problemlösung für häufige Fehler

---

## 🚨 Problem-Kategorien

1. [Datenbankverbindung](#datenbankverbindung-fehler)
2. [PHP-Fehler](#php-fehler)
3. [IIS-Fehler](#iis-fehler)
4. [Berechtigungsfehler](#berechtigungsfehler)
5. [API-Probleme](#api-probleme)
6. [Performance-Probleme](#performance-probleme)

---

## Datenbankverbindung-Fehler

### ❌ "Datenbankverbindung fehlgeschlagen"

**Symptom**: Fehlermeldung beim Aufrufen des Dashboards oder der Test-Seite

**Häufigste Ursachen**:
1. MariaDB/MySQL läuft nicht
2. Falsche Zugangsdaten in `config.php`
3. Datenbank existiert nicht
4. Firewall blockiert Verbindung

#### Lösung 1: Service prüfen

```powershell
# PowerShell als Administrator
Get-Service MySQL

# Status sollte "Running" sein
# Falls "Stopped":
Start-Service MySQL

# Erneut prüfen:
Get-Service MySQL
```

#### Lösung 2: Zugangsdaten testen

```powershell
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -u root -p

# Geben Sie Ihr Passwort ein
# Wenn erfolgreich, sind die Zugangsdaten korrekt

# Datenbank prüfen:
SHOW DATABASES;
# "sir_dashboard" sollte in der Liste sein

EXIT;
```

#### Lösung 3: config.php überprüfen

Öffnen Sie: `C:\inetpub\wwwroot\sir-dashboard\php-backend\config.php`

```php
// Überprüfen Sie diese Zeilen:
define('DB_HOST', 'localhost');     // Stimmt der Host?
define('DB_NAME', 'sir_dashboard'); // Stimmt der Name?
define('DB_USER', 'root');          // Stimmt der Benutzer?
define('DB_PASS', 'IHR_PASSWORT');  // Stimmt das Passwort?
```

**Test**:
```powershell
# Mit den gleichen Zugangsdaten verbinden:
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -h localhost -u root -p sir_dashboard

# Wenn erfolgreich → config.php ist korrekt
# Wenn fehlgeschlagen → Zugangsdaten in config.php anpassen
```

#### Lösung 4: Datenbank neu erstellen

```sql
-- MySQL-Kommandozeile als root:
DROP DATABASE IF EXISTS sir_dashboard;
CREATE DATABASE sir_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
EXIT;
```

```powershell
# SQL-Datei importieren:
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -u root -p sir_dashboard < C:\inetpub\wwwroot\sir-dashboard\php-backend\database.sql
```

---

### ❌ "Table 'sir_dashboard.users' doesn't exist"

**Symptom**: Fehler beim Login oder auf der Test-Seite

**Ursache**: Datenbank-Schema wurde nicht importiert

#### Lösung: SQL-Datei importieren

```powershell
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -u root -p sir_dashboard < C:\inetpub\wwwroot\sir-dashboard\php-backend\database.sql

# Überprüfen:
.\mysql.exe -u root -p sir_dashboard
SHOW TABLES;
# Sollte 8 Tabellen anzeigen:
# - users
# - stresser_attacks
# - vulnerability_scans
# - scan_vulnerabilities
# - website_analyses
# - website_endpoints
# - website_software
# - activity_logs
```

---

## PHP-Fehler

### ❌ "500 Internal Server Error"

**Symptom**: Weiße Seite oder generischer IIS-Fehler

**Ursache**: PHP-Fehler, FastCGI-Problem oder Konfigurationsfehler

#### Lösung 1: Detaillierte Fehler aktivieren

1. **IIS Manager** öffnen
2. **Sir Dashboard** Site auswählen
3. **Error Pages** doppelklicken
4. Rechts: **Edit Feature Settings...**
5. Wählen Sie: **Detailed errors**
6. Click "OK"
7. Seite neu laden → Sie sehen jetzt den genauen Fehler

#### Lösung 2: PHP-Fehlerlog prüfen

```powershell
# PHP-Hauptlog:
notepad C:\PHP\logs\php_errors.log

# Dashboard-Log:
notepad C:\inetpub\wwwroot\sir-dashboard\php-backend\logs\php-error.log

# IIS-Log (neueste Datei):
cd C:\inetpub\logs\LogFiles\W3SVC1\
Get-ChildItem | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content -Tail 50
```

#### Lösung 3: FastCGI-Prozess neu starten

```powershell
# Alle PHP-CGI-Prozesse beenden:
taskkill /F /IM php-cgi.exe

# IIS neu starten:
iisreset /restart

# Seite erneut aufrufen
```

#### Lösung 4: web.config prüfen

Stellen Sie sicher, dass `C:\inetpub\wwwroot\sir-dashboard\php-backend\web.config` existiert:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <handlers>
            <add name="PHP_via_FastCGI" 
                 path="*.php" 
                 verb="*" 
                 modules="FastCgiModule" 
                 scriptProcessor="C:\PHP\php-cgi.exe" 
                 resourceType="Either" />
        </handlers>
    </system.webServer>
</configuration>
```

---

### ❌ "Call to undefined function mysqli_connect()"

**Symptom**: Fehler beim Datenbankzugriff

**Ursache**: PHP-Erweiterung `mysqli` nicht aktiviert

#### Lösung: Erweiterung in php.ini aktivieren

1. Öffnen Sie: `C:\PHP\php.ini`
2. Suchen Sie nach: `;extension=mysqli`
3. Entfernen Sie das Semikolon: `extension=mysqli`
4. Speichern Sie die Datei
5. IIS neu starten:
   ```powershell
   iisreset /restart
   ```

**Überprüfen**:
```powershell
php -m | Select-String mysqli
# Sollte "mysqli" ausgeben
```

#### Alle erforderlichen Erweiterungen:

In `C:\PHP\php.ini` aktivieren (Semikolon entfernen):
```ini
extension=curl
extension=fileinfo
extension=gd
extension=mbstring
extension=mysqli
extension=openssl
extension=pdo_mysql
```

---

### ❌ "Cannot modify header information - headers already sent"

**Symptom**: Fehler bei Login oder API-Aufrufen

**Ursache**: Output vor `header()` Aufruf

#### Lösung 1: BOM entfernen

```powershell
# Überprüfen Sie PHP-Dateien auf Byte Order Mark (BOM)
# Speichern Sie alle PHP-Dateien als "UTF-8 without BOM"
```

#### Lösung 2: php.ini Einstellung

In `C:\PHP\php.ini`:
```ini
output_buffering = 4096
```

Dann IIS neu starten:
```powershell
iisreset /restart
```

---

## IIS-Fehler

### ❌ "404 Not Found" für PHP-Dateien

**Symptom**: `.php` Dateien werden nicht gefunden oder als Download angeboten

**Ursache**: FastCGI Handler nicht korrekt konfiguriert

#### Lösung: Handler-Zuordnung neu erstellen

1. **IIS Manager** öffnen
2. Server-Name auswählen (oberste Ebene)
3. **Handler Mappings** doppelklicken
4. Suchen Sie nach `PHP_via_FastCGI`
5. Falls nicht vorhanden: Rechts → **Add Module Mapping...**
   ```
   Request path: *.php
   Module: FastCgiModule
   Executable: C:\PHP\php-cgi.exe
   Name: PHP_via_FastCGI
   ```
6. Click "OK" → "Yes" bei FastCGI-Dialog
7. IIS neu starten:
   ```powershell
   iisreset /restart
   ```

---

### ❌ "The page cannot be displayed because an internal server error has occurred"

**Symptom**: Generischer IIS-Fehler ohne Details

**Ursache**: FastCGI-Timeout oder PHP-Crash

#### Lösung 1: Timeouts erhöhen

1. **IIS Manager** → **FastCGI Settings**
2. Doppelklick auf `C:\PHP\php-cgi.exe`
3. Ändern Sie:
   ```
   Activity Timeout: 600
   Request Timeout: 600
   ```
4. Speichern

#### Lösung 2: php.ini Timeouts

In `C:\PHP\php.ini`:
```ini
max_execution_time = 300
max_input_time = 300
```

IIS neu starten:
```powershell
iisreset /restart
```

---

## Berechtigungsfehler

### ❌ "Access is denied" oder "Permission denied"

**Symptom**: Fehler beim Schreiben von Logs oder Sessions

**Ursache**: Fehlende Schreibrechte für IIS-Benutzer

#### Lösung: Berechtigungen neu setzen

```powershell
# PowerShell als Administrator

# Basis-Berechtigungen:
icacls "C:\inetpub\wwwroot\sir-dashboard" /grant "IIS_IUSRS:(OI)(CI)RX" /T
icacls "C:\inetpub\wwwroot\sir-dashboard" /grant "IUSR:(OI)(CI)RX" /T

# Schreibrechte für Logs:
icacls "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T
icacls "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs" /grant "IUSR:(OI)(CI)M" /T

# PHP Sessions:
icacls "C:\PHP\sessions" /grant "IIS_IUSRS:(OI)(CI)M" /T

# PHP Logs:
icacls "C:\PHP\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T
```

**Überprüfen**:
```
http://localhost/php-backend/test-connection.php
```
Der Test "Logs-Verzeichnis" sollte jetzt grün sein.

---

### ❌ "Failed to write session data"

**Symptom**: Login funktioniert nicht, Session wird nicht gespeichert

**Ursache**: Sessions-Verzeichnis nicht beschreibbar

#### Lösung:

```powershell
# Sessions-Verzeichnis erstellen (falls nicht vorhanden):
New-Item -ItemType Directory -Force -Path "C:\PHP\sessions"

# Berechtigungen setzen:
icacls "C:\PHP\sessions" /grant "IIS_IUSRS:(OI)(CI)M" /T
icacls "C:\PHP\sessions" /grant "IUSR:(OI)(CI)M" /T

# IIS neu starten:
iisreset /restart
```

**php.ini prüfen**:
```ini
; In C:\PHP\php.ini:
session.save_path = "C:/PHP/sessions"
```

---

## API-Probleme

### ❌ "Server hat keine JSON-Antwort gesendet"

**Symptom**: Frontend zeigt Fehler bei API-Aufrufen

**Ursache**: PHP-Fehler im Backend oder CORS-Problem

#### Lösung 1: PHP-Fehler finden

```powershell
# Fehlerlog prüfen:
Get-Content C:\inetpub\wwwroot\sir-dashboard\php-backend\logs\php-error.log -Tail 50
```

Beheben Sie die angezeigten PHP-Fehler.

#### Lösung 2: CORS aktivieren

In `C:\inetpub\wwwroot\sir-dashboard\php-backend\config.php` ganz am Anfang hinzufügen:

```php
<?php
// CORS-Header (ganz am Anfang, vor allem anderen!)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Rest der config.php...
```

#### Lösung 3: API-Endpoint testen

```powershell
# PowerShell:
Invoke-WebRequest -Uri "http://localhost/php-backend/api/users.php" -UseBasicParsing

# Sollte JSON-Antwort zurückgeben
```

---

### ❌ "API-Aufruf gibt leere Antwort zurück"

**Symptom**: Keine Daten vom Backend

**Ursache**: URL Rewrite fehlt oder falsch konfiguriert

#### Lösung: URL Rewrite installieren

1. Download: https://www.iis.net/downloads/microsoft/url-rewrite
2. `rewrite_amd64_en-US.msi` installieren
3. IIS neu starten:
   ```powershell
   iisreset /restart
   ```

**web.config prüfen** in `php-backend\`:
```xml
<rewrite>
    <rules>
        <rule name="API Routes" stopProcessing="true">
            <match url="^api/(.*)$" />
            <action type="Rewrite" url="api/{R:1}.php" />
        </rule>
    </rules>
</rewrite>
```

---

## Performance-Probleme

### ❌ Dashboard lädt sehr langsam

**Symptom**: Lange Ladezeiten

**Ursache**: PHP OpCache deaktiviert oder zu kleine Limits

#### Lösung 1: OpCache aktivieren

In `C:\PHP\php.ini`:
```ini
zend_extension=opcache
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
```

IIS neu starten:
```powershell
iisreset /restart
```

#### Lösung 2: Application Pool optimieren

1. **IIS Manager** → **Application Pools**
2. Rechtsklick **Sir Dashboard** → **Advanced Settings...**
3. Ändern:
   ```
   Start Mode: AlwaysRunning
   Idle Time-out (minutes): 20
   Regular Time Interval (minutes): 1740
   ```

#### Lösung 3: MariaDB optimieren

In `C:\Program Files\MariaDB 11.4\data\my.ini`:
```ini
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 100
query_cache_size = 32M
query_cache_type = 1
```

MariaDB neu starten:
```powershell
Restart-Service MySQL
```

---

## 🔍 Diagnose-Tools

### System-Status prüfen

```powershell
# Alle relevanten Services:
Get-Service MySQL, W3SVC, WAS | Select-Object Name, Status

# IIS Sites:
Get-IISSite

# PHP-Version:
C:\PHP\php.exe -v

# PHP-Erweiterungen:
C:\PHP\php.exe -m

# Datenbankverbindung:
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -u root -p -e "SELECT VERSION(); SHOW DATABASES;"
```

### Logs in Echtzeit überwachen

```powershell
# PHP-Fehlerlog:
Get-Content C:\PHP\logs\php_errors.log -Tail 50 -Wait

# Dashboard-Log:
Get-Content C:\inetpub\wwwroot\sir-dashboard\php-backend\logs\php-error.log -Tail 50 -Wait

# IIS-Log:
Get-Content C:\inetpub\logs\LogFiles\W3SVC1\*.log -Tail 50 -Wait
```

### Test-Seite nutzen

```
http://localhost/php-backend/test-connection.php
```

Diese Seite zeigt detailliert:
- PHP-Konfiguration
- Erweiterungs-Status
- Datenbankverbindung
- Berechtigungen
- API-Konfiguration

**Alle Tests sollten grün (✓) sein!**

---

## 🆘 Wenn nichts hilft

### Komplett-Reset durchführen

```powershell
# 1. IIS Site entfernen
Remove-Website -Name "Sir Dashboard"
Remove-WebAppPool -Name "Sir Dashboard"

# 2. Datenbank neu erstellen
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -u root -p
```

```sql
DROP DATABASE IF EXISTS sir_dashboard;
CREATE DATABASE sir_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
EXIT;
```

```powershell
# 3. SQL importieren
.\mysql.exe -u root -p sir_dashboard < C:\inetpub\wwwroot\sir-dashboard\php-backend\database.sql

# 4. Berechtigungen neu setzen
icacls "C:\inetpub\wwwroot\sir-dashboard" /reset /T
icacls "C:\inetpub\wwwroot\sir-dashboard" /grant "IIS_IUSRS:(OI)(CI)RX" /T
icacls "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T

# 5. Setup-Script erneut ausführen
.\setup-sir-dashboard.ps1

# 6. config.php prüfen und DB-Passwort setzen

# 7. IIS neu starten
iisreset /restart

# 8. Test-Seite aufrufen
Start-Process "http://localhost/php-backend/test-connection.php"
```

---

## 📞 Support-Kontakt

Falls das Problem weiterhin besteht:

1. **Test-Seite Screenshot erstellen**: `http://localhost/php-backend/test-connection.php`
2. **Logs sammeln**:
   ```powershell
   # PowerShell:
   Get-Content C:\PHP\logs\php_errors.log -Tail 100 > C:\sir-dashboard-debug.txt
   Get-Content C:\inetpub\wwwroot\sir-dashboard\php-backend\logs\php-error.log -Tail 100 >> C:\sir-dashboard-debug.txt
   ```
3. **System-Info sammeln**:
   ```powershell
   php -v >> C:\sir-dashboard-debug.txt
   php -m >> C:\sir-dashboard-debug.txt
   Get-Service MySQL >> C:\sir-dashboard-debug.txt
   ```

---

## ✅ Checkliste für häufigste Fehler

Arbeiten Sie diese Liste ab:

- [ ] MariaDB Service läuft: `Get-Service MySQL`
- [ ] config.php hat korrektes DB-Passwort
- [ ] Datenbank `sir_dashboard` existiert und hat Tabellen
- [ ] PHP 8.5.4 Thread Safe installiert: `php -v`
- [ ] Alle PHP-Erweiterungen aktiv: `php -m`
- [ ] FastCGI Handler in IIS vorhanden
- [ ] Berechtigungen für IIS_IUSRS gesetzt
- [ ] Logs-Verzeichnis beschreibbar
- [ ] Sessions-Verzeichnis beschreibbar
- [ ] IIS Site läuft und Port 80 ist frei
- [ ] Firewall-Regeln für Port 80 existieren
- [ ] Test-Seite zeigt "ALLE TESTS BESTANDEN"

---

**Sir Dashboard Troubleshooting Guide**  
Version 1.0 | Zuletzt aktualisiert: 2026
