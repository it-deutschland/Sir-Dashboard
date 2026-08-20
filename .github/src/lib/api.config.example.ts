/**
 * API-Konfiguration für verschiedene Umgebungen
 * 
 * Kopieren Sie diese Datei zu `api.config.ts` und passen Sie die Werte an
 */

export const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:8080/api',
    timeout: 10000,
    debug: true,
  },
  
  production: {
    baseUrl: '/php-backend/api',
    timeout: 30000,
    debug: false,
  },
  
  staging: {
    baseUrl: 'https://staging.ihr-server.de/sir-api/api',
    timeout: 30000,
    debug: true,
  },
};

const environment = import.meta.env.MODE || 'development';

export const currentConfig = API_CONFIG[environment as keyof typeof API_CONFIG] || API_CONFIG.development;
