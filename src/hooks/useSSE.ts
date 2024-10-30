import { useCallback } from 'react';

export function useSSE(url: string) {
  const connect = useCallback(() => {
    const sse = new EventSource(url);
    
    sse.onerror = (error) => {
      console.error('SSE error:', error);
      sse.close();
      
      setTimeout(() => {
        connect();
      }, 1000);
    };

    return sse;
  }, [url]);

  return connect;
}