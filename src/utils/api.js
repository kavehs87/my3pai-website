/**
 * Dynamically determines the API base URL based on the current hostname
 * @returns {string} The API base URL
 */
export function getApiBaseUrl() {
  const hostname = window.location.hostname;

  // Local Dev: Use HTTP and port 8000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  // Production: Prepend 'api.' and use HTTPS, append /api path
  const apiHost = 'api.' + hostname;
  return 'https://' + apiHost + '/api';
}
