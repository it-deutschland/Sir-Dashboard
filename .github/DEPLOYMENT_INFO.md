# 🚀 Sir Dashboard - Deployment Information

## ⚠️ Wichtige Hinweise für diese Umgebung

### Diese Spark-Entwicklungsumgebung

Sie befinden sich aktuell in einer **Spark-Entwicklungsumgebung**, die auf **React/TypeScript** basiert. Diese Umgebung ist optimiert für Frontend-Entwicklung und verwendet:

- **Vite** als Build-Tool und Dev-Server
- **React 19** für das Frontend
- **TypeScript** für Type-Safety
- **Tailwind CSS** für Styling

### Das PHP-Backend

Das **PHP-Backend** im Ordner `/php-backend/` ist für den **produktiven Einsatz auf Ihrem Server** gedacht. Es funktioniert **NICHT** in dieser Spark-Entwicklungsumgebung, da:

1. Spark keinen PHP-Interpreter hat
2. Keine MySQL/MariaDB-Datenbank verfügbar ist
3. Der Vite Dev-Server nur statische Dateien und JavaScript ausliefert

## 🔄 Zwei Modi für Sir Dashboard

### 1️⃣ Entwicklungsmodus (Aktuelle Spark-Umgebung)

**Zweck**: Frontend-Entwicklung und UI/UX Design

**Was funktioniert:**
- ✅ Vollständiges UI/UX Design
- ✅ Alle React-Komponenten
- ✅ Mock-Daten für Demonstrationszwecke
- ✅ Interaktive Prototypen

**Was NICHT funktioniert:**
- ❌ Echte Datenbankverbindung
- ❌ PHP-Backend-Endpunkte
- ❌ Persistente Datenspeicherung
- ❌ Echte API-Calls zu Stresser-APIs

**Verwendung in Spark:**
```bash
# Frontend läuft automatisch
# Keine zusätzliche Konfiguration nötig
# Mock-Daten werden verwendet
```

### 2️⃣ Produktionsmodus (Ihr Windows Server)

**Zweck**: Vollständiger Betrieb mit Datenbank und APIs

**Was funktioniert:**
- ✅ Alles aus dem Entwicklungsmodus
- ✅ PHP-Backend mit MariaDB
- ✅ Echte Datenbankverbindung
- ✅ Persistente Datenspeicherung
- ✅ Echte API-Calls zu Stresser-APIs
- ✅ Benutzerauthentifizierung mit DB
- ✅ Vollständige Logging-Funktionen

**Installation:**
Folgen Sie der Anleitung in `SCHNELLSTART_ANLEITUNG.md`

## 🔧 Mock-API vs. Echte API

### Aktuelle Spark-Implementierung (Mock)

Das Frontend ist so konfiguriert, dass es automatisch zwischen Mock- und echter API wechselt:

```typescript
// src/lib/api.ts
const API_BASE_URL = '/php-backend/api';

// Wenn keine echte API verfügbar ist, werden Mock-Daten verwendet
```

### Für Produktionsumgebung

Wenn Sie das Dashboard auf Ihrem Server deployen:

1. **Frontend bauen:**
   ```bash
   npm install
   npm run build
   ```

2. **Build-Dateien kopieren:**
   - Kopieren Sie `dist/*` nach `C:\inetpub\wwwroot\sir-dashboard\`
   - Kopieren Sie `php-backend/` nach `C:\inetpub\wwwroot\sir-dashboard\php-backend\`

3. **Backend konfigurieren:**
   - Bearbeiten Sie `php-backend/config.php`
   - Importieren Sie `php-backend/database.sql`

## 📦 Deployment-Prozess

### Schritt-für-Schritt Anleitung

#### 1. Frontend kompilieren (auf Entwicklungsrechner)

```bash
cd /pfad/zum/sir-dashboard
npm install
npm run build
```

Dies erstellt optimierte Dateien in `dist/`

#### 2. Dateien auf Server kopieren

```
Windows Server Struktur:
C:\inetpub\wwwroot\sir-dashboard\
├── index.html              (aus dist/)
├── assets/                 (aus dist/assets/)
├── php-backend/
│   ├── config.php         (konfigurieren!)
│   ├── database.sql       (importieren!)
│   ├── api/
│   ├── auth/
│   └── logs/
└── web.config
```

#### 3. IIS konfigurieren

Siehe `SCHNELLSTART_ANLEITUNG.md` für detaillierte IIS-Setup-Anweisungen.

#### 4. Datenbank importieren

```sql
mysql -u root -p < php-backend/database.sql
```

#### 5. Konfiguration anpassen

Bearbeiten Sie `php-backend/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sir_dashboard');
define('DB_USER', 'root');
define('DB_PASS', 'IHR_PASSWORT');
```

#### 6. Testen

Öffnen Sie im Browser:
- `http://localhost/` - Hauptanwendung
- `http://localhost/php-backend/test.php` - Backend-Test

## 🛠️ Fehlersuche

### "Server hat keine JSON-Antwort gesendet"

**In Spark-Umgebung:**
- Das ist normal! Es gibt kein PHP-Backend
- Das Frontend sollte automatisch Mock-Daten verwenden
- Für echte Funktionalität: Auf Server deployen

**Auf Produktionsserver:**
- Prüfen Sie `php-backend/test.php`
- Stellen Sie sicher, dass die Datenbank läuft
- Überprüfen Sie `php-backend/config.php`
- Schauen Sie in die PHP-Error-Logs

### Entwicklung ohne Backend

Wenn Sie nur am Frontend arbeiten möchten, können Sie Mock-Daten verwenden:

```typescript
// Beispiel: Mock-Implementierung
const useMockData = !window.location.href.includes('ihreserver.de');

if (useMockData) {
  // Verwende Mock-Daten
} else {
  // Verwende echte API
}
```

## 📝 Checkliste für Deployment

### Vor dem Deployment
- [ ] `npm run build` ausgeführt
- [ ] `php-backend/config.php` mit Produktionsdaten ausgefüllt
- [ ] Datenbank erstellt und `database.sql` importiert
- [ ] PHP 8.5.4 (Thread Safe) installiert
- [ ] MariaDB 11.4.10 läuft
- [ ] IIS konfiguriert

### Nach dem Deployment
- [ ] `/php-backend/test.php` aufgerufen und alle Tests grün
- [ ] Login mit `admin` / `admin123` funktioniert
- [ ] Admin-Panel erreichbar
- [ ] Logs-Verzeichnis hat Schreibrechte

## 🎯 Zusammenfassung

| Feature | Spark (Entwicklung) | Server (Produktion) |
|---------|---------------------|---------------------|
| Frontend UI | ✅ | ✅ |
| Mock-Daten | ✅ | ❌ |
| PHP-Backend | ❌ | ✅ |
| Datenbank | ❌ | ✅ |
| Persistenz | ❌ | ✅ |
| Echte APIs | ❌ | ✅ |
| Login-System | Demo | Echt |

## 📞 Support

### In Spark-Umgebung
- Frontend-Entwicklung: Voll funktionsfähig
- Backend-Test: Nicht verfügbar (normale Situation)

### Auf Produktionsserver
- Komplette Dokumentation: `SCHNELLSTART_ANLEITUNG.md`
- Backend-Test: `http://localhost/php-backend/test.php`
- Logs: `php-backend/logs/php-error.log`

---

**Version**: 2.1.0  
**Stand**: Aktuell  
**Hinweis**: Diese Datei erklärt die zwei verschiedenen Betriebsmodi
