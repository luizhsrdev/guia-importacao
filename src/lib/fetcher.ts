/**
 * Fetcher padrão para uso com SWR
 * Retorna JSON da resposta ou lança erro
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('Erro ao buscar dados');
    throw error;
  }

  return res.json();
}

/**
 * Fetcher com POST para mutações
 */
export async function postFetcher<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = new Error('Erro ao enviar dados');
    throw error;
  }

  return res.json();
}
