# Tools Origin Isolation

Goal: host high-privilege tools (File System Access, microphone/tab capture) on a dedicated origin.

## Why
- Limits blast radius if one origin is compromised.
- Prevents marketing pages from sharing the same origin permissions as destructive tool pages.

## Recommended topology
- `https://hntbo.example.com` for marketing pages.
- `https://tools.hntbo.example.com` for `/tools/*` and `/tools/*/live` only.

## Repo support included
- `src/utils/toolsUrl.ts` supports `PUBLIC_TOOLS_ORIGIN` to generate tool links from marketing pages.
- `nginx.multi-origin.conf` provides a deployment example with redirect + split roots.

## Rollout steps
1. Provision DNS for `tools.hntbo.example.com`.
2. Deploy separate artifact/root for tools origin.
3. Set `PUBLIC_TOOLS_ORIGIN=https://tools.hntbo.example.com` in marketing deployment.
4. Validate links from home/nav route to tools origin.
5. Gradually tighten tools CSP (remove `'unsafe-inline'` as scripts are externalized).

## Validation checklist
- Marketing origin returns redirect for `/tools/*`.
- Tools origin serves only tool pages/assets.
- Browser permissions granted on tools origin are not available to marketing origin.
