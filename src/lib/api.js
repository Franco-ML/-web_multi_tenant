const EXTRA_HEADERS = { 'ngrok-skip-browser-warning': 'true' }

export function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...EXTRA_HEADERS, ...options.headers },
  })
}
