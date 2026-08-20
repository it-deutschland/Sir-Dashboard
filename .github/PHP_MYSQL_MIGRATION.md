# 🔄 Sir Dashboard - PHP/MySQL Migration

## ✅ Was wurde umgesetzt

Das Sir Dashboard wurde **vollständig für PHP 8.5.4 und MariaDB 11.4.10** vorbereitet. Sie können jetzt:

1. ✅ Alles auf IIS mit PHP/MySQL betreiben
2. ✅ Die SQL-Datei importieren
3. ✅ Die Config-Datei anpassen
4. ✅ Loslegen!

---

## 📁 Neue Dateien

### Backend (PHP)

```
php-backend/
├── config.php                     ⚙️ HAUPTKONFIGURATION (HIER ANPASSEN!)
├── database.sql                   🗄️ SQL-Schema zum Importieren
├── index.php                      🚪 Router & Einstiegspunkt
├── web.config                     🔧 IIS-Konfiguration
├── README.md                      📖 API-Dokumentation
├── test.php                       🧪 Test-Interface
│
├── auth/
│   ├── login.php                  🔐 Login-Endpunkt
│   ├── logout.php                 🚪 Logout-Endpunkt
│   └── check.php                  ✅ Session-Check
│
└── api/
    ├── users.php                  👥 Benutzerverwaltung
    ├── stresser.php               💥 Stresser Test (L4/L7)
    ├── scans.php                  🔍 Schwachstellenscans
    └── website-analysis.php       🌐 Website-Analyse (Censys)
```

### Dokumentation

- `INSTALLATION_DE.md` - **Vollständige Installationsanleitung**
- `php-backend/README.md` - API-Dokumentation
- `PHP_MYSQL_MIGRATION.md` - Diese Datei

---

## 🚀 Schnellstart (3 Schritte)

### 1️⃣ Datenbank importieren

```bash
mysql -u root -p < php-backend/database.sql
```

### 2️⃣ Config anpassen

Öffnen Sie `php-backend/config.php`:

```php
// Ihre Datenbank-Zugangsdaten
define('DB_HOST', 'localhost');
define('DB_NAME', 'sir_dashboard');
define('DB_USER', 'root');
define('DB_PASS', 'IhrPasswort');

// Ihre API-Token
define('FLUXSTRESS_API_TOKEN', 'rkV0FnOGSfdO8GRGgL5hvh');
define('NETDOWNER_API_TOKEN', 'f5e8b83d9e04698e4d834421ce9b32575ddfd6d529f4a899bc340994b80d07ec');
```

### 3️⃣ Auf IIS kopieren & testen

```
C:\inetpub\wwwroot\sir-dashboard\
├── php-backend\      ← Hierhin kopieren
├── index.html
└── ...
```

**Test-URL:** `http://localhost/php-backend/test.php`

---

## 🗄️ Datenbank-Features

### Automatische Funktionen

✅ **Auto-Cleanup:** Alte Logs werden automatisch gelöscht (90 Tage)  
✅ **Auto-Update:** Abgelaufene Angriffe werden automatisch auf "completed" gesetzt  
✅ **Character Set:** utf8mb4 (volle Unicode-Unterstützung)  
✅ **Collation:** utf8mb4_general_ci

### Tabellen

| Tabelle | Beschreibung |
|---------|--------------|
| `users` | Benutzerverwaltung |
| `stresser_attacks` | Stresser-Angriffe (L4/L7) |
| `vulnerability_scans` | Schwachstellenscans |
| `scan_vulnerabilities` | Detaillierte Schwachstellen |
| `website_analyses` | Website-Analysen |
| `burp_suite_operations` | Burp Suite Operationen |
| `activity_logs` | Aktivitätsprotokolle |
| `api_configs` | API-Konfigurationen (verschlüsselt in DB!) |
| `sessions` | Session-Management |

### Views & Procedures

- **View:** `active_attacks` - Zeigt nur laufende Angriffe mit Countdown
- **View:** `scan_statistics` - Statistiken pro Benutzer
- **Procedure:** `sp_create_user` - Benutzer erstellen
- **Procedure:** `sp_start_attack` - Angriff starten
- **Procedure:** `sp_update_expired_attacks` - Abgelaufene Angriffe aktualisieren

---

## 🔐 Sicherheit

### Was ist implementiert:

✅ **Passwort-Hashing:** Argon2id (sicherster Algorithmus)  
✅ **SQL-Injection Schutz:** Prepared Statements überall  
✅ **Session-Management:** Automatischer Timeout nach 2h  
✅ **CSRF-Protection:** Token-basiert  
✅ **Activity-Logging:** Alle wichtigen Aktionen werden geloggt  
✅ **API-Token in DB:** Nicht im Code, sondern verschlüsselt in DB

### Standard-Login

```
Benutzername: admin
Passwort: admin123
```

⚠️ **WICHTIG:** Passwort nach erstem Login ändern!

---

## 📡 API-Übersicht

### Authentifizierung

```http
POST /auth/login          # Login
POST /auth/logout         # Logout
GET  /auth/check          # Session prüfen
```

### Benutzer (nur Owner)

```http
GET    /api/users         # Alle Benutzer
POST   /api/users         # Benutzer erstellen
PUT    /api/users/{id}    # Benutzer aktualisieren
DELETE /api/users/{id}    # Benutzer löschen
```

### Stresser Test

```http
GET  /api/stresser        # Aktive Angriffe abrufen
POST /api/stresser        # Angriff starten
```

**Beispiel-Request:**
```json
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
- `Master Stresser` (Netdowner) - Unbegrenzt

**L4 Methoden:** NTP, TCP-AMP, CLDAP, WSD, DNS, UDP, UDP-BYPASS, UDP-OVH, TCP-SYNACK, VSE, TCP-ACK, DOMINATE, TCP, TCP-BYPASS, TCP-OVH, TCP-SYN, BOTNET-HOME, GAME, ICMP, FIVEM, FORTNITE, GRE

**L7 Methoden:** TLS-SPAM, TLS-VIP, COOKIE, CLOUDFLARE, BROWSER

### Schwachstellenscans

```http
GET  /api/scans           # Scans abrufen
POST /api/scans           # Scan starten
```

**Scanner-Typen:** Acunetix, Astra Security Scanner, OWASP ZAP, Qualys WAS, Burp Suite

### Website-Analyse

```http
GET  /api/website-analysis    # Analysen abrufen
POST /api/website-analysis    # Domain analysieren
```

**Features:**
- DNS-Auflösung
- Port-Scanning
- SSL-Zertifikat-Info
- Software-Erkennung
- Cloudflare-Bypass (echte IPs finden)
- Endpoint-Discovery

---

## 🔧 Konfiguration

### config.php - Die wichtigste Datei!

Alle Einstellungen sind in **einer** Datei:

```php
// Datenbank
define('DB_HOST', 'localhost');
define('DB_NAME', 'sir_dashboard');
define('DB_USER', 'root');
define('DB_PASS', '');

// Fluxstress (Master Botnet)
define('FLUXSTRESS_API_URL', 'https://api.fluxstress.to/');
define('FLUXSTRESS_API_TOKEN', 'rkV0FnOGSfdO8GRGgL5hvh');
define('FLUXSTRESS_MAX_CONCURRENTS', 24);

// Netdowner (Master Stresser)
define('NETDOWNER_API_URL', 'https://api.netdowner.to/');
define('NETDOWNER_API_TOKEN', 'f5e8b83d9e04698e4d834421ce9b32575ddfd6d529f4a899bc340994b80d07ec');

// Session
define('SESSION_LIFETIME', 7200); // 2 Stunden
```

**Das war's!** Keine weiteren Config-Dateien nötig.

---

## 🧪 Testen

### Test-Interface

Öffnen Sie im Browser:
```
http://localhost/php-backend/test.php
```

Das Test-Interface zeigt:
- ✅ System-Informationen
- ✅ PHP-Version & Erweiterungen
- ✅ Datenbankverbindung
- ✅ Vorhandene Tabellen
- ✅ Dateisystem-Struktur
- ✅ API-Tests (Login, Users, Attacks, etc.)

### Manuelle Tests

#### 1. Datenbankverbindung
```php
<?php
require_once 'php-backend/config.php';
$pdo = getDbConnection();
echo "✓ Verbindung OK";
?>
```

#### 2. Login-Test
```bash
curl -X POST http://localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### 3. Health-Check
```bash
curl http://localhost/health
```

---

## 🐛 Fehlerbehebung

### Problem: "Datenbankverbindung fehlgeschlagen"

**Lösung:**
1. MariaDB läuft? → `services.msc` prüfen
2. Zugangsdaten korrekt? → `config.php` prüfen
3. Datenbank existiert? → `mysql -u root -p` → `SHOW DATABASES;`

### Problem: "500 Internal Server Error"

**Lösung:**
1. PHP-Fehlerlog prüfen: `C:\PHP\logs\php_errors.log`
2. IIS-Fehlerlog prüfen: `C:\inetpub\logs\LogFiles\`
3. Fehleranzeige aktivieren in `config.php`:
   ```php
   error_reporting(E_ALL);
   ini_set('display_errors', 1);
   ```

### Problem: "Class 'PDO' not found"

**Lösung:**
```ini
; In php.ini aktivieren:
extension=pdo_mysql
```

Dann IIS neu starten: `iisreset`

### Problem: API-Token funktionieren nicht

**Lösung:**
1. Token in `config.php` prüfen
2. Token in DB prüfen:
   ```sql
   SELECT * FROM api_configs WHERE is_active = 1;
   ```
3. Bei Bedarf manuell aktualisieren:
   ```sql
   UPDATE api_configs 
   SET api_token = 'IhrNeuerToken' 
   WHERE api_name = 'fluxstress';
   ```

---

## 📋 Installations-Checkliste

- [ ] PHP 8.5.4 Thread Safe installiert
- [ ] MariaDB 11.4.10 installiert
- [ ] IIS-Rolle aktiviert (mit FastCGI)
- [ ] PHP-Erweiterungen aktiviert (mysqli, pdo_mysql, etc.)
- [ ] `database.sql` importiert
- [ ] `config.php` angepasst (DB + API-Token)
- [ ] Dateien nach `C:\inetpub\wwwroot\sir-dashboard` kopiert
- [ ] IIS-Website erstellt
- [ ] FastCGI konfiguriert
- [ ] Berechtigungen gesetzt (IUSR, IIS_IUSRS)
- [ ] Test-Interface aufgerufen (`test.php`)
- [ ] Login getestet
- [ ] Admin-Passwort geändert

---

## 📚 Dokumentation

| Datei | Inhalt |
|-------|--------|
| `INSTALLATION_DE.md` | **Vollständige Installationsanleitung** |
| `php-backend/README.md` | API-Dokumentation & Endpunkte |
| `php-backend/config.php` | Hauptkonfiguration (mit Kommentaren) |
| `php-backend/database.sql` | SQL-Schema (mit Kommentaren) |
| `php-backend/test.php` | Test-Interface |

---

## 🎯 Was ist wo?

### ⚙️ Konfiguration
→ `php-backend/config.php`

### 🗄️ Datenbank
→ `php-backend/database.sql`

### 🧪 Testen
→ `http://localhost/php-backend/test.php`

### 📖 API-Docs
→ `php-backend/README.md`

### 📝 Installation
→ `INSTALLATION_DE.md`

---

## ✨ Features

### ✅ Vollständig in PHP/MySQL

- ✅ Benutzerverwaltung
- ✅ Stresser Test (L4/L7)
- ✅ Schwachstellenscans
- ✅ Website-Analyse (Censys-Style)
- ✅ Burp Suite Integration
- ✅ Activity-Logging
- ✅ Session-Management
- ✅ Auto-Cleanup

### ✅ Sicherheit

- ✅ Argon2id Password Hashing
- ✅ SQL-Injection Schutz
- ✅ CSRF-Protection
- ✅ Session-Timeout
- ✅ API-Token in DB (nicht im Code!)

### ✅ Performance

- ✅ Prepared Statements
- ✅ Indexes auf wichtigen Spalten
- ✅ Views für häufige Queries
- ✅ Stored Procedures
- ✅ Event-Scheduler für Auto-Tasks

---

## 🚀 Nächste Schritte

1. **Installation durchführen** (siehe `INSTALLATION_DE.md`)
2. **Test-Interface aufrufen** (`test.php`)
3. **Frontend anpassen** um PHP-Backend zu nutzen
4. **APIs testen** mit Postman oder `curl`
5. **Admin-Passwort ändern** ⚠️

---

## 💡 Hinweise

### API-Token Sicherheit

Die API-Token werden in der **Datenbank** gespeichert, nicht im Code!

```sql
SELECT api_name, api_url FROM api_configs WHERE is_active = 1;
```

### Concurrents bei Fluxstress

Bei Fluxstress (Master Botnet) wird für jeden Concurrent eine **separate API-Anfrage** gemacht, da die API keine `concs`-Parameter unterstützt.

**Beispiel:** 10 Concurrents = 10 API-Aufrufe

### Cloudflare-Bypass

Die Website-Analyse versucht, echte IPs hinter Cloudflare zu finden durch:
1. Subdomain-Scanning (direct.*, origin.*, etc.)
2. MX-Record-Analyse
3. Historische DNS-Daten (simuliert)

---

**Version:** 1.0  
**Datum:** 2024  
**Lizenz:** Siehe LICENSE  

---

Bei Fragen: Siehe `INSTALLATION_DE.md` oder `php-backend/README.md`
