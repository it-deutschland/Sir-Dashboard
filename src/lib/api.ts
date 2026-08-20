/**
 * API Service für Sir Dashboard
 * Verbindet das React Frontend mit dem PHP Backend
 * 
 * In Spark-Entwicklungsumgebung wird automatisch die Mock-API verwendet.
 * In Produktionsumgebung wird das echte PHP-Backend verwendet.
 */

import { mockApi, useMockMode } from './mock-api';

const API_BASE_URL = '/php-backend/api';

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  username: string;
  is_owner: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ScanRequest {
  target: string;
  scan_type: string;
  options?: Record<string, any>;
}

export interface ScanResult {
  id: string;
  target: string;
  scan_type: string;
  status: 'running' | 'completed' | 'failed';
  results?: any;
  created_at: string;
  completed_at?: string;
}

export interface StresserRequest {
  host: string;
  port: number;
  time: number;
  method: string;
  api_type: 'fluxstress' | 'netdowner';
  layer: 'L4' | 'L7';
  concurrents?: number;
}

export interface StresserResponse {
  status: string;
  message: string;
  host: string;
  port: number;
  method: string;
  time: number;
  concurrents: string;
  attack_ids?: string[];
  attack_summary?: Array<{
    id: string;
    server: string;
    send_time_ms: string;
    timestamp: string;
    end_time: string;
  }>;
}

export interface WebsiteAnalysisRequest {
  domain: string;
}

export interface WebsiteAnalysisResult {
  id: string;
  domain: string;
  ips: Array<{
    ip: string;
    real_ip?: string;
    ports: number[];
    hosts: string[];
  }>;
  endpoints: Array<{
    port: number;
    protocol: string;
    path?: string;
  }>;
  software: Array<{
    name: string;
    version?: string;
  }>;
  created_at: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    throw new ApiError(
      'Server hat keine JSON-Antwort gesendet',
      response.status
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'API-Anfrage fehlgeschlagen',
      response.status,
      data
    );
  }

  return data;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Netzwerkfehler: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler')
    );
  }
}

export const api = {
  auth: {
    login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
      if (useMockMode()) {
        return mockApi.auth.login(credentials);
      }
      return apiRequest('auth/login.php', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    logout: async (): Promise<ApiResponse> => {
      if (useMockMode()) {
        return mockApi.auth.logout();
      }
      return apiRequest('auth/logout.php', {
        method: 'POST',
      });
    },

    getCurrentUser: async (): Promise<ApiResponse<User>> => {
      if (useMockMode()) {
        return mockApi.auth.getCurrentUser();
      }
      return apiRequest('auth/me.php');
    },
  },

  users: {
    list: async (): Promise<ApiResponse<User[]>> => {
      if (useMockMode()) {
        return mockApi.users.list();
      }
      return apiRequest('users.php?action=list');
    },

    create: async (username: string, password: string, isOwner: boolean = false): Promise<ApiResponse<User>> => {
      if (useMockMode()) {
        return mockApi.users.create(username, password, isOwner);
      }
      return apiRequest('users.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
          username,
          password,
          is_owner: isOwner,
        }),
      });
    },

    delete: async (userId: string): Promise<ApiResponse> => {
      if (useMockMode()) {
        return mockApi.users.delete(userId);
      }
      return apiRequest('users.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'delete',
          user_id: userId,
        }),
      });
    },
  },

  scans: {
    start: async (scanRequest: ScanRequest): Promise<ApiResponse<ScanResult>> => {
      if (useMockMode()) {
        return mockApi.scans.start(scanRequest);
      }
      return apiRequest('scans.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start',
          ...scanRequest,
        }),
      });
    },

    list: async (): Promise<ApiResponse<ScanResult[]>> => {
      if (useMockMode()) {
        return mockApi.scans.list();
      }
      return apiRequest('scans.php?action=list');
    },

    getById: async (scanId: string): Promise<ApiResponse<ScanResult>> => {
      if (useMockMode()) {
        return mockApi.scans.getById(scanId);
      }
      return apiRequest(`scans.php?action=get&scan_id=${scanId}`);
    },

    delete: async (scanId: string): Promise<ApiResponse> => {
      if (useMockMode()) {
        return mockApi.scans.delete(scanId);
      }
      return apiRequest('scans.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'delete',
          scan_id: scanId,
        }),
      });
    },
  },

  stresser: {
    execute: async (request: StresserRequest): Promise<ApiResponse<StresserResponse>> => {
      if (useMockMode()) {
        return mockApi.stresser.execute(request);
      }
      return apiRequest('stresser.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'execute',
          ...request,
        }),
      });
    },

    getActive: async (): Promise<ApiResponse<StresserResponse[]>> => {
      if (useMockMode()) {
        return mockApi.stresser.getActive();
      }
      return apiRequest('stresser.php?action=active');
    },

    getHistory: async (): Promise<ApiResponse<StresserResponse[]>> => {
      if (useMockMode()) {
        return mockApi.stresser.getHistory();
      }
      return apiRequest('stresser.php?action=history');
    },

    getStatistics: async (): Promise<ApiResponse<any>> => {
      if (useMockMode()) {
        return mockApi.stresser.getStatistics();
      }
      return apiRequest('stresser.php?action=statistics');
    },
  },

  websiteAnalysis: {
    analyze: async (request: WebsiteAnalysisRequest): Promise<ApiResponse<WebsiteAnalysisResult>> => {
      if (useMockMode()) {
        return mockApi.websiteAnalysis.analyze(request);
      }
      return apiRequest('website-analysis.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze',
          ...request,
        }),
      });
    },

    getHistory: async (): Promise<ApiResponse<WebsiteAnalysisResult[]>> => {
      if (useMockMode()) {
        return mockApi.websiteAnalysis.getHistory();
      }
      return apiRequest('website-analysis.php?action=history');
    },

    getById: async (analysisId: string): Promise<ApiResponse<WebsiteAnalysisResult>> => {
      if (useMockMode()) {
        return mockApi.websiteAnalysis.getById(analysisId);
      }
      return apiRequest(`website-analysis.php?action=get&analysis_id=${analysisId}`);
    },
  },
};

export { ApiError };
