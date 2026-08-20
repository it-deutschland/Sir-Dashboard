/**
 * Mock API Service für Sir Dashboard (Spark-Entwicklungsumgebung)
 * 
 * Diese Mock-API simuliert das PHP-Backend für Entwicklungs- und Demonstrationszwecke.
 * In der Produktionsumgebung wird automatisch die echte PHP-API verwendet.
 */

import { useKV } from '@github/spark/hooks'
import type {
  ApiResponse,
  User,
  LoginCredentials,
  ScanRequest,
  ScanResult,
  StresserRequest,
  StresserResponse,
  WebsiteAnalysisRequest,
  WebsiteAnalysisResult,
} from './api'

const MOCK_DELAY = 800

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export const mockApi = {
  auth: {
    login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
      await delay(MOCK_DELAY)
      
      const validUsers = [
        { id: 'user_admin', username: 'admin', password: 'admin123', is_owner: true },
        { id: 'user_test1', username: 'user1', password: 'admin123', is_owner: false },
        { id: 'user_test2', username: 'test', password: 'admin123', is_owner: false },
      ]
      
      const user = validUsers.find(
        u => u.username === credentials.username && u.password === credentials.password
      )
      
      if (!user) {
        return {
          success: false,
          error: 'Ungültiger Benutzername oder Passwort'
        }
      }
      
      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          is_owner: user.is_owner,
          created_at: new Date().toISOString()
        },
        message: 'Login erfolgreich'
      }
    },

    logout: async (): Promise<ApiResponse> => {
      await delay(300)
      return {
        success: true,
        message: 'Logout erfolgreich'
      }
    },

    getCurrentUser: async (): Promise<ApiResponse<User>> => {
      await delay(300)
      return {
        success: true,
        data: {
          id: 'user_demo',
          username: 'demo',
          is_owner: false,
          created_at: new Date().toISOString()
        }
      }
    },
  },

  users: {
    list: async (): Promise<ApiResponse<User[]>> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        data: [
          {
            id: 'user_admin',
            username: 'admin',
            is_owner: true,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 'user_test1',
            username: 'user1',
            is_owner: false,
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 'user_test2',
            username: 'test',
            is_owner: false,
            created_at: '2024-02-01T14:20:00Z'
          },
        ]
      }
    },

    create: async (username: string, password: string, isOwner: boolean = false): Promise<ApiResponse<User>> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        data: {
          id: generateId(),
          username,
          is_owner: isOwner,
          created_at: new Date().toISOString()
        },
        message: 'Benutzer erfolgreich erstellt'
      }
    },

    delete: async (userId: string): Promise<ApiResponse> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        message: 'Benutzer erfolgreich gelöscht'
      }
    },
  },

  scans: {
    start: async (scanRequest: ScanRequest): Promise<ApiResponse<ScanResult>> => {
      await delay(MOCK_DELAY)
      
      const scanId = generateId()
      
      return {
        success: true,
        data: {
          id: scanId,
          target: scanRequest.target,
          scan_type: scanRequest.scan_type,
          status: 'running',
          created_at: new Date().toISOString()
        },
        message: 'Scan erfolgreich gestartet'
      }
    },

    list: async (): Promise<ApiResponse<ScanResult[]>> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        data: [
          {
            id: 'scan_001',
            target: 'https://example.com',
            scan_type: 'vulnerability',
            status: 'completed',
            results: {
              vulnerabilities_found: 5,
              critical: 1,
              high: 2,
              medium: 1,
              low: 1
            },
            created_at: '2024-03-15T10:30:00Z',
            completed_at: '2024-03-15T10:35:00Z'
          },
          {
            id: 'scan_002',
            target: 'https://test.example.com',
            scan_type: 'configuration',
            status: 'running',
            created_at: new Date().toISOString()
          }
        ]
      }
    },

    getById: async (scanId: string): Promise<ApiResponse<ScanResult>> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        data: {
          id: scanId,
          target: 'https://example.com',
          scan_type: 'vulnerability',
          status: 'completed',
          results: {
            vulnerabilities_found: 5
          },
          created_at: '2024-03-15T10:30:00Z',
          completed_at: '2024-03-15T10:35:00Z'
        }
      }
    },

    delete: async (scanId: string): Promise<ApiResponse> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        message: 'Scan erfolgreich gelöscht'
      }
    },
  },

  stresser: {
    execute: async (request: StresserRequest): Promise<ApiResponse<StresserResponse>> => {
      await delay(MOCK_DELAY)
      
      const attackId = Math.floor(Math.random() * 9999999).toString()
      
      return {
        success: true,
        data: {
          status: 'success',
          message: 'Attack successfully sent!',
          host: request.host,
          port: request.port,
          method: request.method,
          time: request.time,
          concurrents: '1',
          attack_ids: [attackId],
          attack_summary: [{
            id: attackId,
            server: request.api_type === 'fluxstress' ? 'Master-Botnet-02' : 'Master-Stresser-01',
            send_time_ms: `${(Math.random() * 50 + 10).toFixed(2)} ms`,
            timestamp: new Date().toLocaleString('de-DE'),
            end_time: new Date(Date.now() + request.time * 1000).toLocaleString('de-DE')
          }]
        },
        message: 'Attack erfolgreich gestartet'
      }
    },

    getActive: async (): Promise<ApiResponse<StresserResponse[]>> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        data: []
      }
    },

    getHistory: async (): Promise<ApiResponse<StresserResponse[]>> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        data: [
          {
            status: 'success',
            message: 'Attack completed',
            host: '1.1.1.1',
            port: 443,
            method: 'NTP',
            time: 20,
            concurrents: '1',
            attack_ids: ['123456']
          }
        ]
      }
    },

    getStatistics: async (): Promise<ApiResponse<any>> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        data: {
          total_attacks: 42,
          active_attacks: 0,
          total_duration: 840,
          most_used_method: 'NTP'
        }
      }
    },
  },

  websiteAnalysis: {
    analyze: async (request: WebsiteAnalysisRequest): Promise<ApiResponse<WebsiteAnalysisResult>> => {
      await delay(MOCK_DELAY * 2)
      
      return {
        success: true,
        data: {
          id: generateId(),
          domain: request.domain,
          ips: [
            {
              ip: '104.21.78.92',
              real_ip: '198.51.100.42',
              ports: [80, 443, 2087],
              hosts: ['example.com', 'www.example.com']
            }
          ],
          endpoints: [
            { port: 443, protocol: 'HTTPS' },
            { port: 2087, protocol: 'HTTP', path: '/robots.txt' },
            { port: 2087, protocol: 'HTTP', path: '/cpanel' }
          ],
          software: [
            { name: 'cPanel WHM', version: '110.0' },
            { name: 'Roundcube Webmail', version: '1.6.1' },
            { name: 'Apache', version: '2.4.53' }
          ],
          created_at: new Date().toISOString()
        },
        message: 'Analyse erfolgreich abgeschlossen'
      }
    },

    getHistory: async (): Promise<ApiResponse<WebsiteAnalysisResult[]>> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        data: []
      }
    },

    getById: async (analysisId: string): Promise<ApiResponse<WebsiteAnalysisResult>> => {
      await delay(MOCK_DELAY)
      
      return {
        success: true,
        data: {
          id: analysisId,
          domain: 'example.com',
          ips: [],
          endpoints: [],
          software: [],
          created_at: new Date().toISOString()
        }
      }
    },
  },
}

export function useMockMode(): boolean {
  const isDevelopment = import.meta.env.DEV
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1'
  
  return isDevelopment || isLocalhost
}
