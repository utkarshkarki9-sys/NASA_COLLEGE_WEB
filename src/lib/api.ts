import { getUser } from '@netlify/identity';
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  await getUser();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response: Response;
  try { response = await fetch(`/api${path}`, { ...options, signal: options.signal || controller.signal, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...options.headers } }); }
  catch { throw new Error('Connection interrupted. Check your network and try again. If you just submitted a registration, check your dashboard before submitting again.'); }
  finally { clearTimeout(timeout); }
  let data;
  try { data = await response.json(); } catch { throw new Error('The service is unavailable. Please try again shortly.'); }
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}
