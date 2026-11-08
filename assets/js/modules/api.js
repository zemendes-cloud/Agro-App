// Pedidos HTTP / Fetch

/**
 * Pedido genérico que devolve JSON.
 * @param {string} url
 * @param {RequestInit} [options]
 */
export async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao pedir ${url}`);
  }

  return response.status === 204 ? null : response.json();
}

export const getJSON = (url) => request(url);

export const postJSON = (url, body) =>
  request(url, { method: 'POST', body: JSON.stringify(body) });
