# Live Tools Runtime, Performance, and Maintainability Audit

The live tools are functional and well-featured, but there are two high-impact correctness risks and one clear performance hotspot. The biggest issue is a time-of-check/time-of-use delete flow that can remove newly-added files. Secondary issues include shared permission state across tabs in Folder Manager and a heavy MD2Word client bundle.

Conducted February 21, 2026.

---

## Findings by Severity

### CRITICAL

#### C1. Delete-empty workflow can remove non-empty folders after scan (TOCTOU data loss) (`src/components/FolderManager.astro:717`, `src/components/FolderManager.astro:610`) — Confidence: High
- Code snippet showing the problem:
```ts
const { empties } = await scanEmptyFolders(folderHandle);
...
await parent.removeEntry(target, { recursive: true });
```
- **Reproduction:**
  1. In Folder Manager, select a folder containing empty subfolder `A`.
  2. Click `Scan for Empty Folders`.
  3. Before clicking `Delete All Empty`, create a file inside `A` externally (Explorer/Finder/terminal).
  4. Click `Delete All Empty`.
  5. `A` is deleted recursively, including the newly added file.
- Explanation of what's wrong and why it matters:
  - The deletion step trusts stale scan output and uses recursive removal without revalidating emptiness, enabling unintended data loss.
- **Recommendation:**
  - Re-check each candidate folder immediately before deletion.
  - Remove only if still empty; otherwise skip and report.
  - Consider non-recursive delete to force failure if folder is no longer empty.

### HIGH

#### H1. Shared folder handle mixes read and readwrite flows, causing delete path failures (`src/components/FolderManager.astro:500`, `src/components/FolderManager.astro:852`, `src/components/FolderManager.astro:754`) — Confidence: High
- Code snippet showing the problem:
```ts
function setSharedFolder(handle) { folderHandle = handle; delScan.disabled = false; }
...
const handle = await pickFolder('read');
setSharedFolder(handle);
...
await deleteFolders(folderHandle, emptyFolders);
```
- **Reproduction:**
  1. Open `Count Files` tab and choose folder (read permission).
  2. Switch to `Delete Empty Folders`, scan, then run delete.
  3. Delete operation throws permission errors because shared handle may be read-only.
- Explanation of what's wrong and why it matters:
  - Cross-tab shared state conflates permission levels and produces confusing behavior for destructive operations.
- **Recommendation:**
  - Store separate handles per tab/use-case, or track permission capability before enabling delete actions.

#### H2. MD2Word client payload is large for an interactive tool route (`src/components/MD2Word.astro:412`) — Confidence: High
- Code snippet showing the problem:
```ts
import { Document, Packer, Paragraph, TextRun, ... } from 'docx';
```
- **Reproduction:**
  1. Run `npm run build`.
  2. Observe generated client chunk: `MD2Word...js` around `352.56 kB` (`103.68 kB` gzip).
- Explanation of what's wrong and why it matters:
  - This affects first-load performance for `/tools/md2word/live`, especially on mobile/slow networks.
- **Recommendation:**
  - Lazy-load `docx` only when conversion begins.
  - Split parser/converter into external module and consider worker offloading.

### MEDIUM

#### M1. Batch conversion deduplicates by filename only, dropping same-name files from different paths (`src/components/MD2Word.astro:937`) — Confidence: Medium
- Code snippet showing the problem:
```ts
if (!selectedFiles.some(sf => sf.name === f.name)) {
  selectedFiles.push(f);
}
```
- Explanation of what's wrong and why it matters:
  - Distinct files with identical names can be silently ignored in batch mode.
- **Recommendation:**
  - Deduplicate by `(name, size, lastModified)` at minimum, or allow duplicates and disambiguate output names.

### LOW

None.

---

## Recommended Fix Plan

1. Add pre-delete revalidation and non-recursive safety checks (C1)  
Affected files: `src/components/FolderManager.astro`  
Effort: 1-2 hrs

2. Decouple read vs readwrite folder handles (H1)  
Affected files: `src/components/FolderManager.astro`  
Effort: 45-90 min

3. Defer/async load `docx` conversion runtime (H2)  
Affected files: `src/components/MD2Word.astro`  
Effort: 1-3 hrs

4. Improve batch dedupe identity semantics (M1)  
Affected files: `src/components/MD2Word.astro`  
Effort: 30-60 min

### What NOT to Change

- Keep explicit confirmation modal before destructive folder actions.
- Keep detailed operation logs (`Deleted`, `Error`, counts) in results panes; this materially helps troubleshooting.
- Keep clear tab separation of Delete/Duplicate/Count workflows in Folder Manager UI.
- Keep progress/status messaging (`setStatus`) around long operations.
- Keep client-side-only conversion model in MD2Word (privacy-preserving, no upload requirement).

---

## Summary Table

| Priority | Item | Confidence | Files Affected | Effort |
|----------|------|:----------:|----------------|--------|
| Critical | C1: TOCTOU delete can remove newly-added files | High | `src/components/FolderManager.astro` | 1-2 hrs |
| High | H1: Shared read/readwrite handle causes delete failures | High | `src/components/FolderManager.astro` | 45-90 min |
| High | H2: MD2Word bundle size is heavy | High | `src/components/MD2Word.astro` | 1-3 hrs |
| Medium | M1: Batch dedupe by filename only | Medium | `src/components/MD2Word.astro` | 30-60 min |
