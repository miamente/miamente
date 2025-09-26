import { useState, useEffect, useCallback } from 'react';

export interface AdminDataConfig<T> {
  loadFunction: () => Promise<T[]>;
}

export interface AdminDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export interface AdminDataActions<T> {
  refreshData: () => Promise<void>;
  updateItem: (id: string, updatedItem: T) => void;
  removeItem: (id: string) => void;
  setError: (error: string | null) => void;
}

export function useAdminData<T extends { id: string }>({
  loadFunction,
}: AdminDataConfig<T>): AdminDataState<T> & AdminDataActions<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await loadFunction();
      setData(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [loadFunction]);

  useEffect(() => {
    loadData();
  }, [loadFunction, loadData]);

  const updateItem = (id: string, updatedItem: T) => {
    setData(prev => prev.map(item => item.id === id ? updatedItem : item));
  };

  const removeItem = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  return {
    data,
    loading,
    error,
    refreshData: loadData,
    updateItem,
    removeItem,
    setError
  };
}
