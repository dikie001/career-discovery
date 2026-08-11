export function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  // Ensure we don't double slash if path starts with / and baseUrl ends with /
  if (baseUrl.endsWith("/") && path.startsWith("/")) {
    return `${baseUrl}${path.slice(1)}`;
  }
  return `${baseUrl}${path}`;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(getApiUrl(path), options);
}
