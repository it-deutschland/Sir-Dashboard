import { useState, useCallback } from 'react';
import { api, ApiError, type ApiResponse } from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  showToast?: boolean;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiCall();
        
        if (response.success && response.data) {
          setData(response.data);
          options.onSuccess?.(response.data);
          return response.data;
        } else if (response.error) {
          throw new ApiError(response.error);
        }
        
        return response.data;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError('Unbekannter Fehler');
        setError(apiError);
        options.onError?.(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { execute, isLoading } = useApi();

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await execute(() => api.auth.login({ username, password }));
      if (result) {
        setIsAuthenticated(true);
        setCurrentUser(result);
      }
      return result;
    },
    [execute]
  );

  const logout = useCallback(async () => {
    await execute(() => api.auth.logout());
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, [execute]);

  const checkAuth = useCallback(async () => {
    try {
      const result = await execute(() => api.auth.getCurrentUser());
      if (result) {
        setIsAuthenticated(true);
        setCurrentUser(result);
      }
    } catch {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, [execute]);

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    login,
    logout,
    checkAuth,
  };
}

export function useScans() {
  const { execute, isLoading } = useApi();

  const startScan = useCallback(
    (target: string, scanType: string, options?: Record<string, any>) => {
      return execute(() => api.scans.start({ target, scan_type: scanType, options }));
    },
    [execute]
  );

  const listScans = useCallback(() => {
    return execute(() => api.scans.list());
  }, [execute]);

  const getScan = useCallback(
    (scanId: string) => {
      return execute(() => api.scans.getById(scanId));
    },
    [execute]
  );

  const deleteScan = useCallback(
    (scanId: string) => {
      return execute(() => api.scans.delete(scanId));
    },
    [execute]
  );

  return {
    isLoading,
    startScan,
    listScans,
    getScan,
    deleteScan,
  };
}

export function useStresser() {
  const { execute, isLoading } = useApi();

  const executeStresser = useCallback(
    (params: {
      host: string;
      port: number;
      time: number;
      method: string;
      api_type: 'fluxstress' | 'netdowner';
      layer: 'L4' | 'L7';
      concurrents?: number;
    }) => {
      return execute(() => api.stresser.execute(params));
    },
    [execute]
  );

  const getActive = useCallback(() => {
    return execute(() => api.stresser.getActive());
  }, [execute]);

  const getHistory = useCallback(() => {
    return execute(() => api.stresser.getHistory());
  }, [execute]);

  const getStatistics = useCallback(() => {
    return execute(() => api.stresser.getStatistics());
  }, [execute]);

  return {
    isLoading,
    executeStresser,
    getActive,
    getHistory,
    getStatistics,
  };
}

export function useWebsiteAnalysis() {
  const { execute, isLoading } = useApi();

  const analyzeDomain = useCallback(
    (domain: string) => {
      return execute(() => api.websiteAnalysis.analyze({ domain }));
    },
    [execute]
  );

  const getHistory = useCallback(() => {
    return execute(() => api.websiteAnalysis.getHistory());
  }, [execute]);

  const getAnalysis = useCallback(
    (analysisId: string) => {
      return execute(() => api.websiteAnalysis.getById(analysisId));
    },
    [execute]
  );

  return {
    isLoading,
    analyzeDomain,
    getHistory,
    getAnalysis,
  };
}

export function useUsers() {
  const { execute, isLoading } = useApi();

  const listUsers = useCallback(() => {
    return execute(() => api.users.list());
  }, [execute]);

  const createUser = useCallback(
    (username: string, password: string, isOwner: boolean = false) => {
      return execute(() => api.users.create(username, password, isOwner));
    },
    [execute]
  );

  const deleteUser = useCallback(
    (userId: string) => {
      return execute(() => api.users.delete(userId));
    },
    [execute]
  );

  return {
    isLoading,
    listUsers,
    createUser,
    deleteUser,
  };
}
