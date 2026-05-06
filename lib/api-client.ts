import { useStore } from './store';

export const apiClient = {
  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const setError = useStore.getState().setError;
    const setIsLoading = useStore.getState().setIsLoading;

    setIsLoading(true);
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '요청이 실패했습니다');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : '오류가 발생했습니다';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  },

  get<T>(url: string) {
    return this.request<T>(url, { method: 'GET' });
  },

  post<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(url: string) {
    return this.request<T>(url, { method: 'DELETE' });
  },
};
