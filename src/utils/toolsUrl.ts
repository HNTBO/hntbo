const rawToolsOrigin = (import.meta.env.PUBLIC_TOOLS_ORIGIN || '').trim();
const toolsOrigin = rawToolsOrigin.replace(/\/+$/, '');

export function toolsUrl(path: string): string {
  if (!path.startsWith('/')) return path;
  if (!path.startsWith('/tools')) return path;
  if (!toolsOrigin) return path;
  return `${toolsOrigin}${path}`;
}
