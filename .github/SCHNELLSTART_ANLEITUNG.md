# 🚀 Sir Dashboard - Schnellstart Anleitung

## Schritt 1: Datenbank einrichten

### MariaDB 11.4.10 Installation vorbereiten

1. **MariaDB installieren** (Windows Server 2022)
   - Laden Sie MariaDB 11.4.10 von https://mariadb.org/download/
   - Installieren Sie mit den folgenden Einstellungen:
     - Character Set: **utf8mb4**
     - Collation: **utf8mb4_general_ci**

2. **Datenbank erstellen**
   ```bash
   # Via MySQL Command Line oder phpMyAdmin
   mysql -u root -p < php-backend/database.sql
   ```

   Oder importieren Sie `php-backend/database.sql` über phpMyAdmin/HeidiSQL

## Schritt 2: PHP konfigurieren

### PHP 8.5.4 (Thread Safe) für IIS

1. **PHP herunterladen**
   - https://windows.php.net/download/
   - Wählen Sie: **PHP 8.5.4 Thread Safe (TS) x64**

2. **PHP installieren**
   - Entpacken nach: `C:\PHP\`
   - `php.ini-production` kopieren zu `php.ini`

3. **php.ini bearbeiten** (wichtige Zeilen aktivieren):
   ```ini
   extension=mysqli
   extension=pdo_mysql
   extension=curl
   extension=openssl
   extension=mbstring
   extension=fileinfo
   
   upload_max_filesize = 50M
   post_max_size = 50M
   max_execution_time = 300
   memory_limit = 256M
   
   date.timezone = Europe/Berlin
   ```

## Schritt 3: IIS konfigurieren

### IIS 7+ für Windows Server 2022

1. **FastCGI installieren** (falls noch nicht vorhanden)
   - Server Manager → Rollen und Features hinzufügen
   - Webserver (IIS) → Anwendungsentwicklung → CGI

2. **PHP Handler in IIS hinzufügen**
   - IIS Manager öffnen
   - Server-Knoten auswählen → Handler-Zuordnungen
   - Modul-Zuordnung hinzufügen:
     - Request Path: `*.php`
     - Module: `FastCgiModule`
     - Executable: `C:\PHP\php-cgi.exe`
     - Name: `PHP_FastCGI`

3. **Website erstellen**
   - Rechtsklick auf "Sites" → Website hinzufügen
   - Site-Name: `SirDashboard`
   - Physischer Pfad: `C:\inetpub\wwwroot\sir-dashboard`
   - Port: 80 (oder 443 für HTTPS)

## Schritt 4: Dashboard installieren

### Dateien kopieren

1. **Alle Dateien kopieren**
   ```
   Kopieren Sie den gesamten Inhalt dieses Projekts nach:
   C:\inetpub\wwwroot\sir-dashboard\
   ```

2. **Berechtigungen setzen**
   - Rechtsklick auf den Ordner → Eigenschaften → Sicherheit
   - Fügen Sie `IIS_IUSRS` mit Lese- und Ausführungsrechten hinzu
   - Für `php-backend/logs/`: Schreibrechte hinzufügen

## Schritt 5: Konfiguration anpassen

### php-backend/config.php bearbeiten

```php
// DATENBANK KONFIGURATION
define('DB_HOST', 'localhost');          // Ihr MariaDB Host
define('DB_NAME', 'sir_dashboard');      // Datenbankname
define('DB_USER', 'root');               // Ihr DB-Benutzer
define('DB_PASS', 'IhrPasswort');        // Ihr DB-Passwort

// API TOKENS (nur ändern wenn Sie eigene APIs verwenden)
define('FLUXSTRESS_API_TOKEN', 'rkV0FnOGSfdO8GRGgL5hvh');
define('NETDOWNER_API_TOKEN', 'f5e8b83d9e04698e4d834421ce9b32575ddfd6d529f4a899bc340994b80d07ec');
```

## Schritt 6: Frontend Build (optional)

Das Frontend ist bereits als statisches Build enthalten. Wenn Sie Änderungen vornehmen:

```bash
npm install
npm run build
```

Die Build-Dateien werden automatisch nach `dist/` kompiliert.

## Schritt 7: Testen

1. **Browser öffnen**: `http://localhost` oder `http://ihr-server-name`

2. **Standard-Login**:
   - Benutzername: `admin`
   - Passwort: `admin123`

3. **Verbindung testen**:
   - Öffnen Sie: `http://localhost/php-backend/test.php`
   - Sie sollten "Database connection successful" sehen

## 🔐 Sicherheitshinweise

**WICHTIG nach der Installation:**

1. **Admin-Passwort ändern**
   - Einloggen als `admin`
   - Zu Admin-Panel gehen
   - Neues sicheres Passwort setzen

2. **API-Tokens schützen**
   - Die Tokens in `config.php` sind nur Demo-Werte
   - Ersetzen Sie diese mit Ihren echten API-Keys
   - Stellen Sie sicher, dass `config.php` nicht öffentlich zugänglich ist

3. **Fehlerberichterstattung deaktivieren** (Production)
   ```php
   // In config.php für Production:
   error_reporting(0);
   ini_set('display_errors', 0);
   ```

4. **HTTPS aktivieren**
   - Verwenden Sie SSL-Zertifikate für produktive Umgebungen
   - Let's Encrypt oder kommerzielles SSL-Zertifikat

## 🐛 Troubleshooting

### "Server hat keine JSON-Antwort gesendet"

**Lösung 1**: Datenbankverbindung prüfen
```bash
# Test-URL aufrufen:
http://localhost/php-backend/test.php
```

**Lösung 2**: PHP-Fehlerlog prüfen
```
C:\PHP\logs\php-error.log
```

**Lösung 3**: IIS-Log prüfen
```
C:\inetpub\logs\LogFiles\
```

### "Datenbankverbindung fehlgeschlagen"

1. Prüfen Sie `config.php` Einstellungen
2. Stellen Sie sicher, dass MariaDB läuft:
   ```bash
   services.msc → MySQL/MariaDB Service
   ```
3. Testen Sie die Verbindung mit HeidiSQL oder MySQL Workbench

### "405 Method Not Allowed"

- Stellen Sie sicher, dass der IIS FastCGI Handler korrekt konfiguriert ist
- Prüfen Sie `web.config` im Hauptverzeichnis

### "500 Internal Server Error"

- Aktivieren Sie temporär PHP-Fehleranzeige in `config.php`
- Prüfen Sie IIS-Logs und PHP-Fehlerlog

## 📁 Dateistruktur

```
sir-dashboard/
├── index.html                 # Frontend Entry Point
├── php-backend/              # PHP Backend
│   ├── config.php           # ⚙️ HIER KONFIGURIEREN
│   ├── database.sql         # SQL Import-Datei
│   ├── api/                 # API Endpoints
│   │   ├── users.php
│   │   ├── scans.php
│   │   ├── stresser.php
│   │   └── website-analysis.php
│   ├── auth/                # Authentifizierung
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── check.php
│   └── logs/                # Log-Dateien
├── src/                     # React Source (nur für Entwicklung)
└── dist/                    # Kompiliertes Frontend
```

## 🎯 Nach erfolgreicher Installation

✅ Dashboard läuft unter: `http://localhost`
✅ API erreichbar unter: `http://localhost/php-backend/api/`
✅ Admin-Panel: Login als `admin` → Admin-Button

### Nächste Schritte:

1. Weitere Benutzer erstellen (nur Owner kann das)
2. Stresser-APIs konfigurieren und testen
3. Schwachstellenscans durchführen
4. Website-Analysen erstellen

## 📞 Support

Bei Problemen:
1. Prüfen Sie die Logs
2. Testen Sie die Datenbankverbindung
3. Überprüfen Sie IIS und PHP Konfiguration
4. Stellen Sie sicher, dass alle Berechtigungen korrekt sind

---

**Version**: 2.1.0  
**Letzte Aktualisierung**: 2024  
**Getestet auf**: Windows Server 2022, IIS 7+, PHP 8.5.4, MariaDB 11.4.10
