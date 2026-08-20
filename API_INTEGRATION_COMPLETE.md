# API-Integration Abgeschlossen ✓

## Was wurde implementiert

### 1. API-Service Layer (`src/lib/api.ts`)

Ein vollständiger TypeScript-API-Service wurde erstellt, der alle Backend-Endpunkte abdeckt:

- **Authentifizierung**: Login, Logout, Session-Prüfung
- **Benutzerverwaltung**: Auflisten, Erstellen, Löschen
- **Scans**: Starten, Auflisten, Abrufen, Löschen
- **Stresser-Tests**: Ausführen, Aktive Tests, Historie, Statistiken
- **Website-Analyse**: Analysieren, Historie, Einzelergebnisse

**Features:**
- Typsichere API-Calls mit TypeScript
- Fehlerbehandlung mit custom `ApiError` Klasse
- Automatische JSON-Verarbeitung
- Cookie-basierte Session-Verwaltung

### 2. React Hooks (`src/hooks/use-api.ts`)

Wiederverwendbare React Hooks für einfache API-Integration:

- `useApi()` - Basis-Hook mit Loading/Error States
- `useAuth()` - Authentifizierungs-Hook
- `useScans()` - Scanner-Verwaltung
- `useStresser()` - Stresser-Tests
- `useWebsiteAnalysis()` - Website-Analysen
- `useUsers()` - Benutzerverwaltung

**Vorteile:**
- Automatisches State-Management (Loading, Error, Data)
- Konsistente API über alle Komponenten
- Einfache Fehlerbehandlung

### 3. Login-Integration

`LoginScreen.tsx` wurde angepasst:
- Verwendet jetzt `api.auth.login()` statt lokaler Mock-Daten
- Asynchrone Authentifizierung gegen PHP-Backend
- Fehlerbehandlung mit Toast-Benachrichtigungen

`App.tsx` wurde vereinfacht:
- Keine lokale User-Verwaltung mehr
- Session wird vom Backend verwaltet

### 4. Dokumentation

**FRONTEND_BACKEND_CONNECTION.md:**
- Vollständige Setup-Anleitung
- IIS/Apache Konfiguration
- Troubleshooting-Guide
- Sicherheitshinweise

**api.config.example.ts:**
- Konfigurations-Template für verschiedene Umgebungen
- Development, Production, Staging Settings

## Verwendung in Komponenten

### Beispiel 1: Login

```typescript
import { api, ApiError } from '@/lib/api'
import { toast } from 'sonner'

const handleLogin = async () => {
  try {
    const response = await api.auth.login({ username, password })
    if (response.success && response.data) {
      toast.success('Login erfolgreich')
      // Session wird automatisch gespeichert
    }
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.message)
    }
  }
}
```

### Beispiel 2: Mit React Hook

```typescript
import { useAuth } from '@/hooks/use-api'

function LoginComponent() {
  const { login, isLoading, isAuthenticated } = useAuth()
  
  const handleLogin = async () => {
    try {
      await login(username, password)
      toast.success('Angemeldet!')
    } catch (error) {
      toast.error('Login fehlgeschlagen')
    }
  }
  
  return (
    <Button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Lädt...' : 'Anmelden'}
    </Button>
  )
}
```

### Beispiel 3: Scan starten

```typescript
import { useScans } from '@/hooks/use-api'

function ScanComponent() {
  const { startScan, isLoading } = useScans()
  
  const handleScan = async () => {
    try {
      const result = await startScan('example.com', 'vulnerability', {
        depth: 'full'
      })
      toast.success(`Scan gestartet: ${result.id}`)
    } catch (error) {
      toast.error('Scan fehlgeschlagen')
    }
  }
  
  return <Button onClick={handleScan} disabled={isLoading}>Scan starten</Button>
}
```

### Beispiel 4: Stresser ausführen

```typescript
import { useStresser } from '@/hooks/use-api'

function StresserComponent() {
  const { executeStresser, isLoading } = useStresser()
  
  const handleStress = async () => {
    try {
      const result = await executeStresser({
        host: '1.1.1.1',
        port: 443,
        time: 60,
        method: 'TCP',
        api_type: 'fluxstress',
        layer: 'L4'
      })
      toast.success(`Attack gestartet: ${result.attack_ids?.[0]}`)
    } catch (error) {
      toast.error('Attack fehlgeschlagen')
    }
  }
  
  return <Button onClick={handleStress} disabled={isLoading}>Start</Button>
}
```

## Nächste Schritte

### 1. Backend bereitstellen

```bash
cd php-backend
# Datenbank importieren
mysql -u root -p sir_dashboard < database.sql

# PHP Dev-Server starten (nur für Tests)
php -S localhost:8080
```

### 2. Frontend-API-URL setzen

In `src/lib/api.ts` die `API_BASE_URL` anpassen:

```typescript
// Für PHP Dev-Server
const API_BASE_URL = 'http://localhost:8080/api';

// Für Production (gleicher Server)
const API_BASE_URL = '/php-backend/api';
```

### 3. Komponenten aktualisieren

Die folgenden Komponenten können jetzt die API-Integration nutzen:

- ✓ `LoginScreen.tsx` - Bereits integriert
- ⏳ `AdminPanel.tsx` - Benutzerverwaltung mit `useUsers()`
- ⏳ `StresserTest.tsx` - Stresser mit `useStresser()`
- ⏳ `ScanHistory.tsx` - Scans mit `useScans()`
- ⏳ `WebsiteAnalysis.tsx` - Analyse mit `useWebsiteAnalysis()`

### 4. Komponenten-Updates (Optional)

Sie können die bestehenden Komponenten Schritt für Schritt auf die API umstellen:

**AdminPanel.tsx:**
```typescript
import { useUsers } from '@/hooks/use-api'

function AdminPanel() {
  const { listUsers, createUser, deleteUser, isLoading } = useUsers()
  
  // Verwenden Sie die Hooks statt lokaler State
  // Alle Daten werden in der Datenbank gespeichert
}
```

**StresserTest.tsx:**
```typescript
import { useStresser } from '@/hooks/use-api'

function StresserTest() {
  const { executeStresser, getActive, getHistory } = useStresser()
  
  // API-Calls direkt an Fluxstress/Netdowner
  // Ergebnisse werden in DB gespeichert
}
```

## API-Endpunkte Übersicht

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| POST | `/api/auth/login.php` | Benutzer einloggen |
| POST | `/api/auth/logout.php` | Benutzer ausloggen |
| GET | `/api/auth/me.php` | Aktuelle Session |
| GET | `/api/users.php?action=list` | Alle Benutzer |
| POST | `/api/users.php` | Benutzer erstellen/löschen |
| GET | `/api/scans.php?action=list` | Alle Scans |
| POST | `/api/scans.php` | Scan starten |
| GET | `/api/stresser.php?action=active` | Aktive Attacks |
| POST | `/api/stresser.php` | Attack starten |
| GET | `/api/website-analysis.php?action=history` | Analysen |
| POST | `/api/website-analysis.php` | Analyse starten |

## Fehlerbehandlung

Alle API-Calls werfen `ApiError` bei Fehlern:

```typescript
try {
  await api.users.create(username, password)
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API-Fehler:', error.message)
    console.error('Status Code:', error.statusCode)
    console.error('Response:', error.response)
  }
}
```

## Sicherheit

⚠️ **Wichtige Sicherheitshinweise:**

1. **CORS konfigurieren** wenn Frontend und Backend auf verschiedenen Domains laufen
2. **HTTPS verwenden** in Production
3. **API-Tokens schützen** - nur im Backend speichern
4. **Sessions validieren** - Backend prüft alle Anfragen
5. **Input validieren** - Backend validiert alle Eingaben

## Testing

Test-Anfrage an das Backend:

```bash
# Login testen
curl -X POST http://localhost:8080/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# Mit Session testen
curl http://localhost:8080/api/users.php?action=list \
  -b cookies.txt
```

## Support

Bei Problemen:

1. Browser-Konsole prüfen (F12 → Console Tab)
2. Network Tab prüfen (F12 → Network Tab)
3. PHP-Fehlerlog prüfen (`php-backend/logs/`)
4. FRONTEND_BACKEND_CONNECTION.md lesen

---

**Status:** ✓ API-Integration abgeschlossen und bereit zur Verwendung!
