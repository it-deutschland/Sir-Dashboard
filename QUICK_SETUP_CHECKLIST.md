# ✅ Sir Dashboard - Quick Setup Checklist

## Windows Server IIS Installation in 8 Schritten

Diese Checkliste führt Sie Schritt für Schritt durch die Installation. Haken Sie jeden Punkt ab, wenn er erledigt ist.

---

## 🎯 Schritt 1: MariaDB installieren

### Download & Installation
- [ ] Besuchen Sie: https://mariadb.org/download/
- [ ] Laden Sie **MariaDB 11.4.10** herunter
- [ ] Wählen Sie: **Windows x64**
- [ ] Führen Sie `mariadb-11.4.10-winx64.msi` als Administrator aus

### Installations-Wizard
- [ ] **License Agreement**: Akzeptieren
- [ ] **Custom Setup**: Standard-Komponenten belassen
- [ ] **Root Password**: Starkes Passwort wählen und **notieren**!
- [ ] ☑️ **Enable UTF8 as default character set** (WICHTIG!)
- [ ] Installation abschließen

### Test
```powershell
# PowerShell als Administrator:
Get-Service MySQL
# Status sollte "Running" sein
```
- [ ] MariaDB Service läuft

---

## 🐘 Schritt 2: PHP installieren

### Download & Installation
- [ ] Besuchen Sie: https://windows.php.net/download/
- [ ] Laden Sie **PHP 8.5.4** herunter
- [ ] Wählen Sie: **VS16 x64 Thread Safe (TS)** ⚠️ Nicht NTS!
- [ ] Entpacken Sie das ZIP nach `C:\PHP`

### Verzeichnisse erstellen
```powershell
# PowerShell als Administrator:
cd C:\PHP
New-Item -ItemType Directory -Force -Path sessions
New-Item -ItemType Directory -Force -Path logs
```
- [ ] `C:\PHP\sessions` erstellt
- [ ] `C:\PHP\logs` erstellt

### php.ini erstellen
```powershell
cd C:\PHP
Copy-Item php.ini-production php.ini
```
- [ ] `php.ini` aus `php.ini-production` erstellt

### php.ini konfigurieren
Öffnen Sie `C:\PHP\php.ini` und ändern Sie:

- [ ] `extension_dir = "C:/PHP/ext"` (Zeile suchen und anpassen)
- [ ] Folgende Zeilen aktivieren (Semikolon entfernen):
  - [ ] `extension=curl`
  - [ ] `extension=fileinfo`
  - [ ] `extension=gd`
  - [ ] `extension=mbstring`
  - [ ] `extension=mysqli`
  - [ ] `extension=openssl`
  - [ ] `extension=pdo_mysql`
- [ ] `date.timezone = Europe/Berlin` setzen
- [ ] `session.save_path = "C:/PHP/sessions"` setzen
- [ ] `upload_max_filesize = 100M` setzen
- [ ] `post_max_size = 100M` setzen
- [ ] `max_execution_time = 300` setzen
- [ ] `memory_limit = 256M` setzen

### Berechtigungen setzen
```powershell
icacls "C:\PHP\sessions" /grant "IIS_IUSRS:(OI)(CI)M" /T
icacls "C:\PHP\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T
```
- [ ] Berechtigungen gesetzt

### Test
```powershell
cd C:\PHP
.\php.exe -v
# Sollte zeigen: PHP 8.5.4 ... (ZTS)
```
- [ ] PHP-Version korrekt (8.5.x und ZTS)

---

## 🌐 Schritt 3: IIS installieren & konfigurieren

### IIS-Rolle installieren
- [ ] **Server Manager** öffnen
- [ ] **Manage** → **Add Roles and Features**
- [ ] **Server Roles**: ☑️ **Web Server (IIS)**
- [ ] Im Pop-up: **Add Features** klicken
- [ ] **Role Services** → **Application Development** erweitern
- [ ] ☑️ **CGI** aktivieren
- [ ] ☑️ **ISAPI Extensions** aktivieren
- [ ] ☑️ **ISAPI Filters** aktivieren
- [ ] Installation abschließen

### FastCGI Handler konfigurieren
- [ ] **IIS Manager** öffnen (`inetmgr` in Run)
- [ ] Server-Name auswählen (oberste Ebene)
- [ ] **Handler Mappings** doppelklicken
- [ ] Rechts: **Add Module Mapping...**

Eingaben:
```
Request path: *.php
Module: FastCgiModule
Executable: C:\PHP\php-cgi.exe
Name: PHP_via_FastCGI
```
- [ ] Handler hinzugefügt
- [ ] "Create FastCGI application?" → **Yes**

### FastCGI-Einstellungen optimieren
- [ ] IIS Manager → **FastCGI Settings**
- [ ] `C:\PHP\php-cgi.exe` doppelklicken
- [ ] **Instance MaxRequests**: `10000`
- [ ] **Activity Timeout**: `300`
- [ ] **Request Timeout**: `300`
- [ ] **Environment Variables** → "..." Button
- [ ] Variable hinzufügen:
  - Name: `PHP_FCGI_MAX_REQUESTS`
  - Value: `10000`
- [ ] Variable hinzufügen:
  - Name: `PHPRC`
  - Value: `C:\PHP`
- [ ] Speichern

---

## 📂 Schritt 4: Dashboard-Dateien kopieren

### Verzeichnis erstellen
```powershell
New-Item -ItemType Directory -Force -Path "C:\inetpub\wwwroot\sir-dashboard"
```
- [ ] Verzeichnis erstellt

### Dateien kopieren
- [ ] Alle Dashboard-Dateien nach `C:\inetpub\wwwroot\sir-dashboard\` kopieren
- [ ] Überprüfen dass folgende Struktur vorhanden:
  - [ ] `php-backend\` Ordner
  - [ ] `php-backend\config.php`
  - [ ] `php-backend\database.sql`
  - [ ] `php-backend\api\` Ordner
  - [ ] `index.html` oder `index.php`

### Berechtigungen setzen
```powershell
icacls "C:\inetpub\wwwroot\sir-dashboard" /grant "IIS_IUSRS:(OI)(CI)RX" /T
icacls "C:\inetpub\wwwroot\sir-dashboard" /grant "IUSR:(OI)(CI)RX" /T
New-Item -ItemType Directory -Force -Path "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs"
icacls "C:\inetpub\wwwroot\sir-dashboard\php-backend\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T
```
- [ ] Basis-Berechtigungen gesetzt
- [ ] Logs-Ordner erstellt
- [ ] Logs-Berechtigungen gesetzt

---

## 🗄️ Schritt 5: Datenbank einrichten

### Datenbank importieren

**Option A: Mit HeidiSQL**
- [ ] `C:\Program Files\MariaDB 11.4\HeidiSQL.exe` öffnen
- [ ] Session Manager: Hostname `localhost`, User `root`, Ihr Passwort
- [ ] Verbinden
- [ ] Rechtsklick → **Create new** → **Database**
  - Name: `sir_dashboard`
  - Collation: `utf8mb4_general_ci`
- [ ] Datenbank `sir_dashboard` auswählen
- [ ] **File** → **Load SQL file...**
- [ ] Navigieren zu: `C:\inetpub\wwwroot\sir-dashboard\php-backend\database.sql`
- [ ] **Execute** (F9)

**Option B: Mit Kommandozeile**
```powershell
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -u root -p < C:\inetpub\wwwroot\sir-dashboard\php-backend\database.sql
# Passwort eingeben
```

### Überprüfen
```powershell
cd "C:\Program Files\MariaDB 11.4\bin"
.\mysql.exe -u root -p sir_dashboard
# In MySQL-Kommandozeile:
SHOW TABLES;
# Sollte 8 Tabellen anzeigen
EXIT;
```
- [ ] Datenbank importiert
- [ ] Alle Tabellen vorhanden

---

## ⚙️ Schritt 6: Konfiguration anpassen

### config.php bearbeiten
Öffnen Sie: `C:\inetpub\wwwroot\sir-dashboard\php-backend\config.php`

Ändern Sie:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sir_dashboard');
define('DB_USER', 'root');
define('DB_PASS', '');  // ⚠️ IHR MARIADB-PASSWORT HIER!
```

- [ ] `DB_HOST` korrekt (meist `localhost`)
- [ ] `DB_NAME` = `sir_dashboard`
- [ ] `DB_USER` korrekt (meist `root`)
- [ ] `DB_PASS` mit Ihrem MariaDB-Passwort gesetzt
- [ ] Datei gespeichert

### API-Token (optional)
Falls Sie eigene API-Token haben:
```php
define('FLUXSTRESS_API_TOKEN', 'IHR_TOKEN');
define('NETDOWNER_API_TOKEN', 'IHR_TOKEN');
```
- [ ] API-Token gesetzt (oder Standard belassen)

---

## 🖥️ Schritt 7: IIS Site erstellen

### Website erstellen
- [ ] **IIS Manager** öffnen
- [ ] Linke Seite: Rechtsklick auf **Sites**
- [ ] **Add Website...**

Eingaben:
```
Site name: Sir Dashboard
Application pool: Sir Dashboard
Physical path: C:\inetpub\wwwroot\sir-dashboard
Binding:
  - Type: http
  - IP address: All Unassigned
  - Port: 80
  - Host name: (leer lassen)
```
- [ ] Website erstellt

### Application Pool konfigurieren
- [ ] **Application Pools** auswählen
- [ ] Rechtsklick auf **Sir Dashboard** → **Advanced Settings...**
- [ ] **.NET CLR Version**: `No Managed Code`
- [ ] **Managed Pipeline Mode**: `Integrated`
- [ ] **Start Mode**: `AlwaysRunning`
- [ ] Speichern

### Default Document
- [ ] IIS Manager → **Sir Dashboard** Site auswählen
- [ ] **Default Document** doppelklicken
- [ ] Rechts: **Add...**
- [ ] Name: `index.php`
- [ ] OK
- [ ] `index.php` auswählen und **Move Up** bis ganz oben

### IIS neu starten
```powershell
iisreset /restart
```
- [ ] IIS neu gestartet

---

## 🧪 Schritt 8: Installation testen

### Verbindungstest aufrufen
```
http://localhost/php-backend/test-connection.php
```

### Überprüfen Sie:
- [ ] ✅ PHP-Version 8.5.x angezeigt
- [ ] ✅ Thread Safety = Thread Safe (TS)
- [ ] ✅ Alle PHP-Erweiterungen geladen
- [ ] ✅ Datenbankverbindung erfolgreich
- [ ] ✅ MySQL/MariaDB Version angezeigt
- [ ] ✅ Alle Tabellen vorhanden
- [ ] ✅ Logs-Verzeichnis beschreibbar
- [ ] ✅ Session-Status aktiv
- [ ] ✅ Gesamt-Status: **ALLE TESTS BESTANDEN**

### Dashboard aufrufen
```
http://localhost/
```

### Login testen
```
Benutzername: admin
Passwort: admin123
```
- [ ] Login erfolgreich
- [ ] Dashboard wird angezeigt

---

## 🔒 Schritt 9: Sicherheit (WICHTIG!)

### Sofort nach Installation:
- [ ] **Admin-Passwort ändern!**
  - Login → Admin Panel → Passwort ändern

### Für Produktions-Umgebung:
- [ ] Fehleranzeige deaktivieren in `php.ini`:
  ```ini
  display_errors = Off
  display_startup_errors = Off
  ```
- [ ] Fehleranzeige deaktivieren in `config.php`:
  ```php
  error_reporting(0);
  ini_set('display_errors', 0);
  ```
- [ ] IIS neu starten: `iisreset /restart`

### Firewall konfigurieren:
```powershell
# Port 80 öffnen
New-NetFirewallRule -DisplayName "Sir Dashboard HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Port 443 öffnen (für HTTPS)
New-NetFirewallRule -DisplayName "Sir Dashboard HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# MySQL nur localhost
New-NetFirewallRule -DisplayName "MariaDB" -Direction Inbound -LocalPort 3306 -Protocol TCP -Action Allow -RemoteAddress 127.0.0.1
```
- [ ] Firewall-Regeln erstellt

### HTTPS einrichten (empfohlen):
- [ ] IIS Manager → Site → Bindings → Add
- [ ] Type: `https`, Port: `443`
- [ ] SSL-Zertifikat auswählen
- [ ] Speichern

### Backup einrichten:
- [ ] Backup-Script erstellen (siehe IIS_SETUP_GUIDE.md)
- [ ] Task Scheduler für automatische Backups

---

## ✅ Finale Checkliste

Alle Komponenten installiert und funktionsfähig:

### Installation
- [ ] MariaDB 11.4.10 installiert und läuft
- [ ] Datenbank `sir_dashboard` mit allen Tabellen
- [ ] PHP 8.5.4 Thread Safe installiert
- [ ] Alle PHP-Erweiterungen aktiviert
- [ ] IIS mit FastCGI konfiguriert
- [ ] Dashboard-Dateien kopiert
- [ ] Berechtigungen korrekt gesetzt

### Konfiguration
- [ ] `config.php` mit DB-Passwort aktualisiert
- [ ] `php.ini` konfiguriert
- [ ] IIS Site "Sir Dashboard" erstellt
- [ ] Application Pool konfiguriert
- [ ] Default Document gesetzt

### Tests
- [ ] Verbindungstest erfolgreich (alle grün)
- [ ] Dashboard erreichbar unter `http://localhost/`
- [ ] Login funktioniert
- [ ] Admin-Panel erreichbar

### Sicherheit
- [ ] Admin-Passwort geändert
- [ ] Fehleranzeige deaktiviert (Produktion)
- [ ] Firewall-Regeln erstellt
- [ ] HTTPS eingerichtet (optional)
- [ ] Backup-Strategie implementiert

---

## 🎉 Fertig!

Herzlichen Glückwunsch! Ihr Sir Dashboard ist jetzt einsatzbereit.

### Wichtige Links:
- **Dashboard**: http://localhost/
- **Test-Seite**: http://localhost/php-backend/test-connection.php
- **Login**: admin / admin123 ⚠️ **Passwort sofort ändern!**

### Bei Problemen:
1. Prüfen Sie die Test-Seite
2. Lesen Sie die Logs: `C:\PHP\logs\php_errors.log`
3. Konsultieren Sie: [IIS_SETUP_GUIDE.md](./IIS_SETUP_GUIDE.md)

---

## 📚 Weitere Dokumentation

- **[README_DEPLOYMENT.md](./README_DEPLOYMENT.md)**: Übersicht und FAQ
- **[IIS_SETUP_GUIDE.md](./IIS_SETUP_GUIDE.md)**: Detaillierte Anleitung (70+ Seiten)
- **[INSTALLATION_DE.md](./INSTALLATION_DE.md)**: Kurzanleitung

---

**Sir Dashboard - Windows Server Edition**  
Version 1.0 | 2026
