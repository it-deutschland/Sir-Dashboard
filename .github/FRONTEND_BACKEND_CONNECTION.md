# Frontend mit PHP-Backend verbinden

## Übersicht

Das Sir Dashboard besteht aus zwei Teilen:
1. **React Frontend** - Läuft im Browser (Vite Dev Server)
2. **PHP Backend** - API-Server (IIS/Apache mit PHP 8.5.4)

## Voraussetzungen

- PHP 8.5.4 (Thread Safe) installiert
- MariaDB 11.4.10 installiert
- IIS 7+ oder Apache Webserver
- Node.js (für das Frontend)

## Schnellstart

### 1. Datenbank einrichten

```sql
-- Datenbank erstellen
CREATE DATABASE sir_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- SQL-Datei importieren
mysql -u root -p sir_dashboard < php-backend/database.sql
```

### 2. PHP-Backend konfigurieren

Bearbeiten Sie `php-backend/config.php`:

```php
// Datenbank
define('DB_HOST', 'localhost');
define('DB_NAME', 'sir_dashboard');
define('DB_USER', 'root');
define('DB_PASS', 'IhrPasswort');

// API-Tokens (optional ändern für Production)
define('FLUXSTRESS_API_TOKEN', 'rkV0FnOGSfdO8GRGgL5hvh');
define('NETDOWNER_API_TOKEN', 'f5e8b83d9e04698e4d834421ce9b32575ddfd6d529f4a899bc340994b80d07ec');
```

### 3. PHP-Backend bereitstellen

**Option A: IIS (Windows Server 2022)**

1. PHP-Backend-Ordner nach `C:\inetpub\wwwroot\sir-api` kopieren
2. IIS-Manager öffnen
3. Neue Website erstellen:
   - Name: `Sir Dashboard API`
   - Pfad: `C:\inetpub\wwwroot\sir-api`
   - Port: `8080` (oder ein anderer Port)
4. PHP Fast-CGI Handler einrichten
5. `web.config` ist bereits vorhanden und konfiguriert

**Option B: Apache**

1. PHP-Backend-Ordner nach `/var/www/html/sir-api` kopieren
2. Apache-Konfiguration anpassen (`.htaccess` wird automatisch verwendet)
3. Apache neu starten: `sudo systemctl restart apache2`

**Option C: Entwicklungsserver (nur für Tests)**

```bash
cd php-backend
php -S localhost:8080
```

### 4. Frontend-API-URL konfigurieren

Bearbeiten Sie `src/lib/api.ts` und setzen Sie die richtige Backend-URL:

```typescript
// Für lokale Entwicklung mit PHP Dev-Server
const API_BASE_URL = 'http://localhost:8080/api';

// Für IIS/Apache auf selber Domain (empfohlen)
const API_BASE_URL = '/php-backend/api';

// Für IIS/Apache auf anderem Server
const API_BASE_URL = 'http://ihr-server.de/sir-api/api';
```

### 5. Frontend starten

```bash
npm install
npm run dev
```

Das Frontend läuft auf `http://localhost:5173`

## Standard-Anmeldedaten

Nach dem Import der `database.sql` existieren folgende Benutzer:

- **admin** / admin123 (Inhaber)
- **user1** / user123 (Operator)

## API-Endpunkte

Das Frontend kommuniziert mit folgenden API-Endpunkten:

- `POST /api/auth/login.php` - Benutzer-Login
- `POST /api/auth/logout.php` - Benutzer-Logout
- `GET /api/auth/me.php` - Aktuelle Sitzung abrufen
- `GET /api/users.php` - Benutzer auflisten
- `POST /api/users.php` - Benutzer erstellen/löschen
- `GET /api/scans.php` - Scans auflisten
- `POST /api/scans.php` - Scan starten/löschen
- `GET /api/stresser.php` - Stresser-Daten abrufen
- `POST /api/stresser.php` - Stresser-Test ausführen
- `GET /api/website-analysis.php` - Website-Analysen abrufen
- `POST /api/website-analysis.php` - Website-Analyse starten

## Produktions-Deployment

### IIS-Konfiguration

1. **PHP Fast-CGI einrichten:**
   - Server Manager → Rollen und Features hinzufügen
   - Web Server (IIS) → Application Development → CGI
   - PHP 8.5.4 (Thread Safe) installieren
   - IIS Handler Mapping für PHP erstellen

2. **CORS konfigurieren (falls Frontend auf anderer Domain):**
   
   In `php-backend/index.php` oder `config.php` hinzufügen:
   
   ```php
   header('Access-Control-Allow-Origin: https://ihr-frontend.de');
   header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
   header('Access-Control-Allow-Headers: Content-Type, Authorization');
   header('Access-Control-Allow-Credentials: true');
   ```

3. **HTTPS aktivieren:**
   - SSL-Zertifikat installieren
   - IIS-Binding auf Port 443 setzen
   - HTTP zu HTTPS umleiten

### Frontend-Build

```bash
npm run build
```

Die Build-Dateien befinden sich in `dist/`. Diese können Sie auf IIS oder einem anderen Webserver bereitstellen.

### Beide auf einem Server

**Empfohlene Verzeichnisstruktur:**

```
C:\inetpub\wwwroot\
├── sir-dashboard\          (Frontend - dist Ordner)
│   ├── index.html
│   ├── assets\
│   └── ...
└── sir-api\                (PHP Backend)
    ├── api\
    ├── config.php
    └── ...
```

**IIS-Setup:**

1. Website für Frontend erstellen (Port 80/443)
2. Website für API erstellen (Port 8080 oder als Anwendung unter Frontend)
3. In Frontend `API_BASE_URL` auf `/sir-api/api` setzen

## Fehlerbehebung

### Problem: "Datenbankverbindung fehlgeschlagen"

**Lösung:**
- Prüfen Sie DB-Credentials in `config.php`
- Stellen Sie sicher, dass MariaDB läuft
- Prüfen Sie Firewall-Regeln

### Problem: "CORS-Fehler im Browser"

**Lösung:**
- CORS-Header in PHP-Backend hinzufügen (siehe oben)
- Alternativ: Frontend und Backend auf gleicher Domain bereitstellen

### Problem: "404 Not Found bei API-Aufrufen"

**Lösung:**
- Prüfen Sie `API_BASE_URL` in `src/lib/api.ts`
- Stellen Sie sicher, dass URL Rewriting funktioniert (`web.config` oder `.htaccess`)
- Testen Sie API direkt: `http://localhost:8080/api/test.php`

### Problem: "Session wird nicht gespeichert"

**Lösung:**
- Prüfen Sie PHP Session-Konfiguration
- Stellen Sie sicher, dass Session-Ordner beschreibbar ist
- Bei HTTPS: Secure Cookie Settings anpassen

## Sicherheit

⚠️ **Wichtig für Produktion:**

1. **Passwörter ändern:**
   - Standard-Benutzerpasswörter ändern
   - Starke Passwörter verwenden

2. **API-Tokens schützen:**
   - Tokens in `config.php` niemals in Git committen
   - Umgebungsvariablen verwenden

3. **Fehlerberichterstattung ausschalten:**
   ```php
   // In config.php für Produktion
   error_reporting(0);
   ini_set('display_errors', 0);
   ```

4. **HTTPS erzwingen:**
   - Alle Verbindungen über HTTPS
   - HSTS Header setzen

5. **Datenbank-Berechtigungen:**
   - Separaten DB-Benutzer mit minimalen Rechten erstellen
   - Nicht als root-Benutzer verbinden

## Support

Bei Problemen prüfen Sie:
1. PHP-Fehlerlog: `php-backend/logs/` oder IIS-Logs
2. Browser-Konsole (F12)
3. Netzwerk-Tab im Browser für API-Fehler

## Weitere Dokumentation

- [INSTALLATION_DE.md](./INSTALLATION_DE.md) - Vollständige Installationsanleitung
- [PHP_MYSQL_MIGRATION.md](./PHP_MYSQL_MIGRATION.md) - Migration zu PHP/MySQL
- [php-backend/README.md](./php-backend/README.md) - Backend-Dokumentation
