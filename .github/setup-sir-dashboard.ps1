# ============================================
# Sir Dashboard - Quick Setup Script
# Windows Server 2022 + IIS + PHP + MariaDB
# ============================================
# 
# Dieses Script automatisiert die Grundkonfiguration
# Führen Sie es als Administrator aus!
#
# PowerShell als Administrator:
# Set-ExecutionPolicy Bypass -Scope Process -Force
# .\setup-sir-dashboard.ps1
# ============================================

param(
    [string]$InstallPath = "C:\inetpub\wwwroot\sir-dashboard",
    [string]$PHPPath = "C:\PHP",
    [string]$SiteName = "Sir Dashboard",
    [int]$Port = 80,
    [string]$DBPassword = ""
)

$ErrorActionPreference = "Stop"

# Farben für Ausgabe
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Banner
Clear-Host
Write-Host "================================================" -ForegroundColor Green
Write-Host "    SIR DASHBOARD - QUICK SETUP SCRIPT" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Admin-Check
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "FEHLER: Dieses Script muss als Administrator ausgeführt werden!"
    Write-Host "Rechtsklick auf PowerShell -> Als Administrator ausführen" -ForegroundColor Yellow
    exit 1
}

Write-Success "✓ Administrator-Rechte verifiziert"
Write-Host ""

# ============================================
# SCHRITT 1: VORAUSSETZUNGEN PRÜFEN
# ============================================
Write-Info "SCHRITT 1: Voraussetzungen prüfen..."

# PHP prüfen
if (Test-Path "$PHPPath\php.exe") {
    $phpVersion = & "$PHPPath\php.exe" -v | Select-String -Pattern "PHP (\d+\.\d+\.\d+)" | ForEach-Object { $_.Matches.Groups[1].Value }
    Write-Success "✓ PHP gefunden: Version $phpVersion"
} else {
    Write-Warning "⚠ PHP nicht gefunden in $PHPPath"
    Write-Host "   Bitte installieren Sie PHP 8.5.4 Thread Safe zuerst" -ForegroundColor Yellow
    Write-Host "   Download: https://windows.php.net/download/" -ForegroundColor Yellow
    $continue = Read-Host "Möchten Sie trotzdem fortfahren? (j/n)"
    if ($continue -ne "j") { exit 0 }
}

# MariaDB/MySQL prüfen
$mysqlService = Get-Service -Name "MySQL" -ErrorAction SilentlyContinue
if ($mysqlService) {
    if ($mysqlService.Status -eq "Running") {
        Write-Success "✓ MariaDB/MySQL Service läuft"
    } else {
        Write-Warning "⚠ MariaDB/MySQL Service gestoppt - starte Service..."
        Start-Service MySQL
        Write-Success "✓ Service gestartet"
    }
} else {
    Write-Warning "⚠ MariaDB/MySQL Service nicht gefunden"
    Write-Host "   Bitte installieren Sie MariaDB 11.4.10 zuerst" -ForegroundColor Yellow
    Write-Host "   Download: https://mariadb.org/download/" -ForegroundColor Yellow
    $continue = Read-Host "Möchten Sie trotzdem fortfahren? (j/n)"
    if ($continue -ne "j") { exit 0 }
}

# IIS prüfen
$iisFeature = Get-WindowsFeature -Name Web-Server -ErrorAction SilentlyContinue
if ($iisFeature -and $iisFeature.Installed) {
    Write-Success "✓ IIS installiert"
} else {
    Write-Warning "⚠ IIS nicht installiert"
    $installIIS = Read-Host "Möchten Sie IIS jetzt installieren? (j/n)"
    if ($installIIS -eq "j") {
        Write-Info "Installiere IIS..."
        Install-WindowsFeature -Name Web-Server -IncludeManagementTools
        Install-WindowsFeature -Name Web-CGI
        Write-Success "✓ IIS installiert"
    } else {
        Write-Error "IIS wird benötigt. Installation abgebrochen."
        exit 1
    }
}

Write-Host ""

# ============================================
# SCHRITT 2: PHP KONFIGURATION
# ============================================
Write-Info "SCHRITT 2: PHP konfigurieren..."

if (Test-Path $PHPPath) {
    # Verzeichnisse erstellen
    $phpDirs = @("$PHPPath\sessions", "$PHPPath\logs")
    foreach ($dir in $phpDirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Success "✓ Erstellt: $dir"
        }
    }
    
    # Berechtigungen setzen
    Write-Info "Setze Berechtigungen für PHP-Verzeichnisse..."
    icacls "$PHPPath\sessions" /grant "IIS_IUSRS:(OI)(CI)M" /T /Q | Out-Null
    icacls "$PHPPath\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T /Q | Out-Null
    Write-Success "✓ Berechtigungen gesetzt"
    
    # php.ini prüfen
    if (-not (Test-Path "$PHPPath\php.ini")) {
        if (Test-Path "$PHPPath\php.ini-production") {
            Copy-Item "$PHPPath\php.ini-production" "$PHPPath\php.ini"
            Write-Success "✓ php.ini erstellt von php.ini-production"
            Write-Warning "⚠ Bitte php.ini manuell konfigurieren (siehe Anleitung)"
        } else {
            Write-Warning "⚠ Keine php.ini gefunden - bitte manuell erstellen"
        }
    } else {
        Write-Success "✓ php.ini vorhanden"
    }
}

Write-Host ""

# ============================================
# SCHRITT 3: INSTALLATION VORBEREITEN
# ============================================
Write-Info "SCHRITT 3: Installation vorbereiten..."

# Dashboard-Verzeichnis erstellen
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Success "✓ Installations-Verzeichnis erstellt: $InstallPath"
} else {
    Write-Warning "⚠ Verzeichnis existiert bereits: $InstallPath"
}

# Logs-Verzeichnis
$logsPath = "$InstallPath\php-backend\logs"
if (-not (Test-Path $logsPath)) {
    New-Item -ItemType Directory -Path $logsPath -Force | Out-Null
    Write-Success "✓ Logs-Verzeichnis erstellt"
}

# Berechtigungen setzen
Write-Info "Setze Berechtigungen für Dashboard..."
icacls "$InstallPath" /grant "IIS_IUSRS:(OI)(CI)RX" /T /Q | Out-Null
icacls "$InstallPath" /grant "IUSR:(OI)(CI)RX" /T /Q | Out-Null
icacls "$logsPath" /grant "IIS_IUSRS:(OI)(CI)M" /T /Q | Out-Null
Write-Success "✓ Berechtigungen gesetzt"

Write-Host ""

# ============================================
# SCHRITT 4: IIS KONFIGURIEREN
# ============================================
Write-Info "SCHRITT 4: IIS konfigurieren..."

# Import WebAdministration Module
Import-Module WebAdministration -ErrorAction SilentlyContinue

# Prüfen ob Site bereits existiert
$existingSite = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
if ($existingSite) {
    Write-Warning "⚠ Site '$SiteName' existiert bereits"
    $recreate = Read-Host "Möchten Sie die Site neu erstellen? (j/n)"
    if ($recreate -eq "j") {
        Remove-Website -Name $SiteName
        Write-Success "✓ Alte Site entfernt"
    } else {
        Write-Info "Site wird nicht neu erstellt"
    }
}

# Site erstellen (falls nicht existiert)
if (-not (Get-Website -Name $SiteName -ErrorAction SilentlyContinue)) {
    # Application Pool erstellen
    if (-not (Test-Path "IIS:\AppPools\$SiteName")) {
        New-WebAppPool -Name $SiteName | Out-Null
        Set-ItemProperty "IIS:\AppPools\$SiteName" -Name managedRuntimeVersion -Value ""
        Set-ItemProperty "IIS:\AppPools\$SiteName" -Name startMode -Value "AlwaysRunning"
        Write-Success "✓ Application Pool erstellt: $SiteName"
    }
    
    # Website erstellen
    New-Website -Name $SiteName `
                -PhysicalPath $InstallPath `
                -ApplicationPool $SiteName `
                -Port $Port `
                -Force | Out-Null
    Write-Success "✓ Website erstellt: $SiteName"
    Write-Info "   URL: http://localhost:$Port"
}

# Default Document konfigurieren
$defaultDocs = Get-WebConfiguration "//defaultDocument/files" -PSPath "IIS:\Sites\$SiteName"
$indexPhp = $defaultDocs.Collection | Where-Object { $_.value -eq "index.php" }
if (-not $indexPhp) {
    Add-WebConfiguration "//defaultDocument/files" -PSPath "IIS:\Sites\$SiteName" -Value @{value="index.php"} -AtIndex 0
    Write-Success "✓ index.php als Default Document hinzugefügt"
}

# FastCGI Handler für PHP (falls nicht existiert)
if (Test-Path "$PHPPath\php-cgi.exe") {
    $handler = Get-WebHandler -Name "PHP_via_FastCGI" -PSPath "IIS:\" -ErrorAction SilentlyContinue
    if (-not $handler) {
        New-WebHandler -Name "PHP_via_FastCGI" `
                       -Path "*.php" `
                       -Verb "*" `
                       -Modules "FastCgiModule" `
                       -ScriptProcessor "$PHPPath\php-cgi.exe" `
                       -ResourceType Either `
                       -PSPath "IIS:\" | Out-Null
        Write-Success "✓ FastCGI Handler für PHP erstellt"
    } else {
        Write-Success "✓ FastCGI Handler bereits vorhanden"
    }
}

Write-Host ""

# ============================================
# SCHRITT 5: FIREWALL-REGELN
# ============================================
Write-Info "SCHRITT 5: Firewall-Regeln konfigurieren..."

$firewallRules = @(
    @{Name="Sir Dashboard HTTP"; Port=80},
    @{Name="Sir Dashboard HTTPS"; Port=443}
)

foreach ($rule in $firewallRules) {
    $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if (-not $existing) {
        New-NetFirewallRule -DisplayName $rule.Name `
                           -Direction Inbound `
                           -LocalPort $rule.Port `
                           -Protocol TCP `
                           -Action Allow | Out-Null
        Write-Success "✓ Firewall-Regel erstellt: $($rule.Name)"
    } else {
        Write-Info "  Firewall-Regel existiert bereits: $($rule.Name)"
    }
}

# MySQL nur localhost
$mysqlRule = Get-NetFirewallRule -DisplayName "MariaDB Local Only" -ErrorAction SilentlyContinue
if (-not $mysqlRule) {
    New-NetFirewallRule -DisplayName "MariaDB Local Only" `
                       -Direction Inbound `
                       -LocalPort 3306 `
                       -Protocol TCP `
                       -Action Allow `
                       -RemoteAddress @("127.0.0.1", "::1") | Out-Null
    Write-Success "✓ MariaDB Firewall-Regel erstellt (nur localhost)"
}

Write-Host ""

# ============================================
# SCHRITT 6: ABSCHLUSS
# ============================================
Write-Info "SCHRITT 6: Abschluss..."

# IIS neu starten
Write-Info "Starte IIS neu..."
iisreset /restart | Out-Null
Write-Success "✓ IIS neu gestartet"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "    SETUP ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Nächste Schritte
Write-Host "NÄCHSTE SCHRITTE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Kopieren Sie die Dashboard-Dateien nach:" -ForegroundColor Yellow
Write-Host "   $InstallPath" -ForegroundColor White
Write-Host ""
Write-Host "2. Bearbeiten Sie die Konfigurationsdatei:" -ForegroundColor Yellow
Write-Host "   $InstallPath\php-backend\config.php" -ForegroundColor White
Write-Host "   -> Setzen Sie DB_PASS mit Ihrem MariaDB-Passwort" -ForegroundColor White
Write-Host ""
Write-Host "3. Importieren Sie die Datenbank:" -ForegroundColor Yellow
Write-Host "   mysql -u root -p sir_dashboard < $InstallPath\php-backend\database.sql" -ForegroundColor White
Write-Host ""
Write-Host "4. Testen Sie die Installation:" -ForegroundColor Yellow
Write-Host "   http://localhost:$Port/php-backend/test-connection.php" -ForegroundColor White
Write-Host ""
Write-Host "5. Öffnen Sie das Dashboard:" -ForegroundColor Yellow
Write-Host "   http://localhost:$Port" -ForegroundColor White
Write-Host "   Login: admin / admin123" -ForegroundColor White
Write-Host ""

# Zusammenfassung
Write-Host "KONFIGURIERTE KOMPONENTEN:" -ForegroundColor Cyan
Write-Host "  ✓ PHP-Verzeichnisse und Berechtigungen" -ForegroundColor Green
Write-Host "  ✓ IIS Site: $SiteName (Port $Port)" -ForegroundColor Green
Write-Host "  ✓ Application Pool: $SiteName" -ForegroundColor Green
Write-Host "  ✓ FastCGI Handler für PHP" -ForegroundColor Green
Write-Host "  ✓ Firewall-Regeln" -ForegroundColor Green
Write-Host "  ✓ Installations-Verzeichnis: $InstallPath" -ForegroundColor Green
Write-Host ""

Write-Host "Weitere Informationen finden Sie in:" -ForegroundColor Yellow
Write-Host "  - IIS_SETUP_GUIDE.md (vollständige Anleitung)" -ForegroundColor White
Write-Host "  - INSTALLATION_DE.md (Installations-Übersicht)" -ForegroundColor White
Write-Host ""

Write-Success "Setup erfolgreich abgeschlossen!"
Write-Host ""

# Log erstellen
$logFile = "$InstallPath\setup-log-$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$logContent = @"
Sir Dashboard Setup Log
Datum: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Konfiguration:
- Installations-Pfad: $InstallPath
- PHP-Pfad: $PHPPath
- IIS Site-Name: $SiteName
- Port: $Port

Durchgeführte Schritte:
✓ PHP-Verzeichnisse konfiguriert
✓ IIS Site erstellt
✓ Application Pool konfiguriert
✓ FastCGI Handler eingerichtet
✓ Firewall-Regeln erstellt
✓ Berechtigungen gesetzt

Nächste manuelle Schritte:
1. Dashboard-Dateien kopieren
2. config.php bearbeiten (DB-Passwort setzen)
3. Datenbank importieren
4. Installation testen

Test-URL: http://localhost:$Port/php-backend/test-connection.php
Dashboard-URL: http://localhost:$Port
"@

try {
    $logContent | Out-File -FilePath $logFile -Encoding UTF8
    Write-Info "Setup-Log gespeichert: $logFile"
} catch {
    Write-Warning "Konnte Setup-Log nicht speichern"
}
