export class ApiError extends Error {
  constructor(public status: number, public message: string) {
    super(message);
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // @ts-ignore
const baseUrl = import.meta.env.VITE_API_URL || '';
  const url = `${baseUrl}/api/v1${endpoint}`;
  const headers: Record<string, string> = {};
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: options.credentials || 'include',
  });

  if (!response.ok) {
    if (response.status === 401 && endpoint !== '/auth/me' && endpoint !== '/auth/login') {
      window.location.href = '/login';
    }
    
    let errorMessage = 'حدث خطأ غير متوقع في الاتصال بالخادم';
    try {
      const data = await response.json();
      errorMessage = data.error || errorMessage;
      if (data.details) {
        console.error(`[Validation Error] ${endpoint}:`, data.details);
      }
    } catch (e) {
      // Couldn't parse JSON
    }

    if (response.status >= 500) {
      console.error(`[Server Error] ${endpoint} returned ${response.status}:`, errorMessage);
      errorMessage = 'حدث خطأ داخلي في الخادم، يرجى المحاولة لاحقاً';
    } else if (response.status === 403) {
      errorMessage = 'غير مصرح لك بإجراء هذه العملية';
    } else if (response.status === 429) {
      errorMessage = 'عذراً، تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً';
    }

    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}
