/**
 * Error extraction helper for API responses (FastAPI, Axios, Network errors)
 * Prevents [object Object] alerts and produces clean, user-friendly error messages.
 */
export const getErrorMessage = (err, fallback = 'An unexpected error occurred.') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  const detail = err.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((d) => {
        if (typeof d === 'string') return d;
        const loc = d.loc ? d.loc.filter((x) => x !== 'body').join('.') : '';
        return loc ? `${loc}: ${d.msg || 'Invalid value'}` : (d.msg || JSON.stringify(d));
      })
      .join('; ');
  }

  if (typeof detail === 'object' && detail !== null) {
    return detail.msg || detail.message || JSON.stringify(detail);
  }

  if (err.response?.data?.message) return err.response.data.message;
  
  if (err.message === 'Network Error') {
    return 'Network or CORS Error: Unable to connect to backend server. Please verify backend URL and CORS configuration.';
  }

  return err.message || fallback;
};
