# Sir Dashboard - PHP/MySQL Backend

## 📁 Struktur

```
php-backend/
├── config.php                  # ⚙️ Hauptkonfigurationsdatei (HIER ANPASSEN!)
├── database.sql                # 🗄️ SQL-Schema für MariaDB/MySQL
├── index.php                   # 🚪 Haupteinstiegspunkt & Router
├── web.config                  # 🔧 IIS-Konfiguration
│
├── auth/                       # 🔐 Authentifizierung
│   ├── login.php               # Login-Endpunkt
│   ├── logout.php              # Logout-Endpunkt
│   └── check.php               # Session-Check
│
└── api/                        # 🔌 API-Endpunkte
    ├── users.php               # Benutzerverwaltung
    ├── stresser.php            # Stresser Test (L4/L7)
    ├── scans.php               # Schwachstellenscans
    └── website-analysis.php    # Website-Analyse (Censys-Style)
```

---

## 🚀 Schnellstart

### 1. Datenbank einrichten

```bash
# MySQL/MariaDB Command Line
mysql -u root -p < database.sql
```

### 2. Konfiguration anpassen

Öffnen Sie `config.php` und passen Sie an:

```php
// Datenbank
define('DB_HOST', 'localhost');
define('DB_NAME', 'sir_dashboard');
define('DB_USER', 'root');
define('DB_PASS', 'IhrPasswort');

// APIs
define('FLUXSTRESS_API_TOKEN', 'IhrToken');
define('NETDOWNER_API_TOKEN', 'IhrToken');
```

### 3. Dateien auf Server kopieren

```
C:\inetpub\wwwroot\sir-dashboard\
├── php-backend\      ← Diesen Ordner hierhin kopieren
└── ...
```

### 4. IIS konfigurieren

Siehe `INSTALLATION_DE.md` für Details.

---

## 📡 API-Endpunkte

### Authentifizierung

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login erfolgreich",
  "data": {
    "user": {
      "id": "user_admin",
      "username": "admin",
      "is_owner": true
    },
    "session_token": "..."
  }
}
```

#### Logout
```http
POST /auth/logout
```

#### Session prüfen
```http
GET /auth/check
```

---

### Benutzerverwaltung

#### Alle Benutzer abrufen
```http
GET /api/users
```

#### Benutzer erstellen (nur Owner)
```http
POST /api/users
Content-Type: application/json

{
  "username": "neuer_user",
  "password": "passwort123",
  "is_owner": false
}
```

#### Benutzer aktualisieren (nur Owner)
```http
PUT /api/users/{userId}
Content-Type: application/json

{
  "password": "neues_passwort",
  "is_active": true
}
```

#### Benutzer löschen (nur Owner)
```http
DELETE /api/users/{userId}
```

---

### Stresser Test

#### Aktive Angriffe abrufen
```http
GET /api/stresser
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attacks": [
      {
        "id": 1,
        "user_id": "user_admin",
        "username": "admin",
        "attack_type": "L4",
        "botnet": "Master Botnet",
        "target_ip": "1.1.1.1",
        "target_port": 443,
        "method": "NTP",
        "duration": 20,
        "concurrents": 10,
        "status": "running",
        "start_time": "2024-01-15 12:00:00",
        "end_time": "2024-01-15 12:00:20",
        "seconds_remaining": 15
      }
    ],
    "total_concurrents": 10,
    "active_count": 1
  }
}
```

#### Angriff starten
```http
POST /api/stresser
Content-Type: application/json

{
  "attack_type": "L4",
  "botnet": "Master Botnet",
  "target_ip": "1.1.1.1",
  "target_port": 443,
  "method": "NTP",
  "duration": 20,
  "concurrents": 10
}
```

**Botnets:**
- `Master Botnet` (Fluxstress) - Max 24 Concurrents
- `Master Stresser` (Netdowner)

**L4 Methoden (Master Botnet):**
- NTP, TCP-AMP, CLDAP, WSD, DNS, UDP, UDP-BYPASS, UDP-OVH
- TCP-SYNACK, VSE, TCP-ACK, DOMINATE, TCP, TCP-BYPASS, TCP-OVH, TCP-SYN
- BOTNET-HOME, GAME, ICMP, FIVEM, FORTNITE, GRE

**L7 Methoden (Master Botnet):**
- TLS-SPAM, TLS-VIP, COOKIE
- CLOUDFLARE, BROWSER (Premium Layer7)

---

### Schwachstellenscans

#### Scans abrufen
```http
GET /api/scans
```

#### Scan starten
```http
POST /api/scans
Content-Type: application/json

{
  "scanner_type": "OWASP ZAP",
  "target_url": "https://example.com"
}
```

**Scanner-Typen:**
- Acunetix
- Astra Security Scanner
- OWASP ZAP
- Qualys WAS
- Burp Suite

**Response:**
```json
{
  "success": true,
  "data": {
    "scan_id": "scan_1234567890_abcd1234",
    "vulnerabilities_found": 5,
    "message": "5 Ergebnisse wurden gefunden"
  }
}
```

---

### Website-Analyse

#### Analysen abrufen
```http
GET /api/website-analysis
```

#### Domain analysieren
```http
POST /api/website-analysis
Content-Type: application/json

{
  "domain": "example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis_id": 123,
    "domain": "example.com",
    "data": {
      "ip_addresses": [
        {
          "ip": "93.184.216.34",
          "type": "A",
          "host": "example.com"
        }
      ],
      "real_ips": [
        {
          "ip": "192.0.2.1",
          "source": "subdomain",
          "subdomain": "direct.example.com"
        }
      ],
      "endpoints": [
        {
          "path": "/robots.txt",
          "protocol": "HTTPS",
          "status": 200
        }
      ],
      "software": [
        {
          "name": "Server",
          "value": "nginx/1.18.0",
          "source": "HTTP Header"
        }
      ],
      "ports": [
        {
          "port": 80,
          "status": "open",
          "service": "HTTP"
        },
        {
          "port": 443,
          "status": "open",
          "service": "HTTPS"
        }
      ]
    }
  }
}
```

---

## 🗄️ Datenbank-Schema

### Tabellen

1. **users** - Benutzer
2. **stresser_attacks** - Stresser-Angriffe
3. **vulnerability_scans** - Schwachstellenscans
4. **scan_vulnerabilities** - Detaillierte Schwachstellen
5. **website_analyses** - Website-Analysen
6. **burp_suite_operations** - Burp Suite Operationen
7. **activity_logs** - Aktivitätsprotokolle
8. **api_configs** - API-Konfigurationen
9. **sessions** - Session-Management

### Views

- **active_attacks** - Aktive Angriffe mit verbleibender Zeit
- **scan_statistics** - Scan-Statistiken pro Benutzer

### Stored Procedures

- **sp_create_user** - Benutzer erstellen
- **sp_start_attack** - Angriff starten
- **sp_update_expired_attacks** - Abgelaufene Angriffe aktualisieren

### Events

- **evt_update_expired_attacks** - Automatische Aktualisierung alle 10 Sekunden
- **evt_cleanup_old_logs** - Alte Logs bereinigen (täglich)

---

## 🔐 Sicherheit

### Session-Management
- Sessions werden automatisch nach 2 Stunden abgemeldet
- Session-IDs werden bei Login regeneriert
- CSRF-Protection verfügbar

### Passwort-Hashing
- Argon2id (sicherster Algorithmus)
- Automatisches Rehashing bei veralteten Hashes

### SQL-Injection Schutz
- Prepared Statements in allen Queries
- PDO mit Parameter-Binding

### Logging
- Alle wichtigen Aktionen werden geloggt
- IP-Adressen werden gespeichert
- Activity-Logs in `activity_logs` Tabelle

---

## 🐛 Debugging

### Fehlerprotokoll aktivieren

In `config.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

### PHP-Fehlerlog prüfen
```
C:\PHP\logs\php_errors.log
```

### Datenbank-Test
```php
<?php
require_once 'config.php';
try {
    $pdo = getDbConnection();
    echo "✓ Verbindung erfolgreich!";
} catch (Exception $e) {
    echo "✗ Fehler: " . $e->getMessage();
}
?>
```

---

## 📝 Standard-Login

- **Benutzername:** `admin`
- **Passwort:** `admin123`

⚠️ **WICHTIG:** Passwort sofort nach Installation ändern!

---

## 🔄 API-Flow

### Stresser Test Flow

1. Frontend sendet Angriff → `POST /api/stresser`
2. Backend validiert Eingaben
3. Datenbank-Eintrag erstellt (Status: `running`)
4. API-Aufruf an Fluxstress/Netdowner
5. API-Response in DB gespeichert
6. Frontend erhält Bestätigung
7. Event aktualisiert Status automatisch nach Ablauf

### Website-Analyse Flow

1. Frontend sendet Domain → `POST /api/website-analysis`
2. Backend führt DNS-Lookup durch
3. Port-Scan auf häufige Ports
4. SSL-Zertifikat abrufen
5. Software-Erkennung
6. Cloudflare-Bypass-Versuche
7. Ergebnisse in DB speichern
8. Frontend erhält vollständige Analyse

---

## 📞 Support

Bei Problemen:
1. Prüfen Sie `INSTALLATION_DE.md`
2. Prüfen Sie Logs (`php_errors.log`, IIS-Logs)
3. Testen Sie Datenbankverbindung
4. Prüfen Sie IIS-Berechtigungen

---

**Version:** 1.0  
**Erstellt für:** Windows Server 2022, IIS 7+, PHP 8.5.4, MariaDB 11.4.10
