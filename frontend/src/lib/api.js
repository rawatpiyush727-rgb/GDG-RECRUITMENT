/**
 * Thin fetch wrapper for GDG On Campus API requests.
 * - Always includes session cookie credentials ('include')
 * - Automatically parses JSON
 * - Sanitizes server errors to friendly messages without exposing Mongo/stack traces
 * - Preserves validation field errors in err.fields
 */

function sanitizeErrorMessage(rawMessage, status) {
  if (status === 502 || status === 503 || status === 504) {
    return 'Backend server is offline or unreachable. Please ensure the backend is running on port 5000.';
  }

  if (typeof rawMessage === 'string') {
    const lower = rawMessage.toLowerCase();
    if (
      lower.includes('econnrefused') ||
      lower.includes('proxy error') ||
      lower.includes('connect error')
    ) {
      return 'Backend server is offline or unreachable. Please ensure the backend is running on port 5000.';
    }
  }

  if (!rawMessage || typeof rawMessage !== 'string') {
    if (status === 401) return 'Please sign in to continue.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status >= 500) return 'Server error. Please try again shortly.';
    return 'An unexpected error occurred. Please try again.';
  }

  // Sanitize Mongo / Mongoose / Database errors
  if (
    rawMessage.includes('E11000') ||
    rawMessage.toLowerCase().includes('duplicate key')
  ) {
    return 'An account with these details already exists.';
  }

  if (
    rawMessage.includes('Mongo') ||
    rawMessage.includes('Cast to ObjectId failed') ||
    rawMessage.includes('ValidationError') ||
    rawMessage.includes('BSON') ||
    rawMessage.includes('at ') // stack trace indicator
  ) {
    return 'Invalid data submitted. Please check your inputs.';
  }

  // Strip status codes from message if prefixed (e.g., "500 Internal Server Error: ...")
  const clean = rawMessage.replace(/^\d{3}\s*(Error|Internal Server Error)?:\s*/i, '').trim();
  return clean || 'An unexpected error occurred. Please try again.';
}

class ApiError extends Error {
  constructor(message, status, fields = null, raw = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
    this.raw = raw;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  let url = endpoint;
  if (!endpoint.startsWith('http')) {
    if (API_BASE_URL) {
      const base = API_BASE_URL.replace(/\/+$/, '');
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      url = `${base}${path}`;
    } else {
      url = endpoint;
    }
  }

  const defaultHeaders = {
    Accept: 'application/json',
  };

  const storedToken =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem('gdg_auth_token')
      : null;
  if (storedToken) {
    defaultHeaders['Authorization'] = `Bearer ${storedToken}`;
  }

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    console.error('Network request failed:', networkErr);
    throw new ApiError(
      'Unable to connect to the backend server. Please verify that the backend is running on port 5000.',
      0,
      null,
      networkErr
    );
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error('Failed to parse JSON response:', parseErr);
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('gdg_auth_token');
    }
    const rawError = data?.error || data?.message || '';
    const fields = data?.fields || null;
    const sanitized = sanitizeErrorMessage(rawError, response.status);

    console.error(`API Error [${response.status}] on ${endpoint}:`, rawError || data);

    throw new ApiError(sanitized, response.status, fields, rawError);
  }

  return data;
}

export const api = {
  get: (url, options) => request(url, { ...options, method: 'GET' }),
  post: (url, body, options) => request(url, { ...options, method: 'POST', body }),
  put: (url, body, options) => request(url, { ...options, method: 'PUT', body }),
  patch: (url, body, options) => request(url, { ...options, method: 'PATCH', body }),
  delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
};

export default api;
