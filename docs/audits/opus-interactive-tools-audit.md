# Interactive Tool Components Audit

The three interactive tool components (MD2Word, FolderManager, AudioVisualizer) are well-structured, self-contained Astro components using IIFE-scoped scripts with consistent design token usage. The most significant issues are in the MD2Word markdown parser: a regex that can match across inline formatting boundaries producing incorrect output, silent loss of nested/mixed markdown features, and an unclosed code fence that causes the rest of a document to vanish. FolderManager has solid safeguards for destructive operations (modal confirmation, deepest-first deletion) but has a subtle shared-state coupling between tabs that could surprise users. AudioVisualizer is the cleanest of the three, with proper audio context lifecycle management, though it has a minor resource leak on the `resize` listener and does not null out audio references on stop.

Conducted 2026-02-21.

---

## Findings by Severity

### CRITICAL

#### C1. Unclosed code fence silently swallows remaining document (`MD2Word.astro:559-568`) -- Confidence: High

```typescript
// Code blocks (fenced)
if (ln.startsWith('```')) {
  const language = ln.slice(3).trim();
  const codeLines: string[] = [];
  i++;
  while (i < lines.length && !lines[i].startsWith('```')) {
    codeLines.push(lines[i]);
    i++;
  }
  blocks.push({ type: 'code_block', text: codeLines.join('\n'), language });
  i++; // skip closing ```
  continue;
}
```

**Reproduction:**
1. Paste the following markdown into the text tab:
```
# Title

Some paragraph.

` `` javascript
const x = 1;

## This heading disappears
More text that disappears too.
```
(Remove the spaces in the opening fence above -- it is a valid triple-backtick fence.)

2. Click "Convert to Word."
3. The resulting DOCX will contain "Title," "Some paragraph," and then a code block containing everything from `const x = 1;` through the end of the document. The heading and trailing paragraph are consumed as code block content.

**Explanation:** When the closing ```` ``` ```` is never found, the `while` loop runs to the end of `lines`. Every remaining line -- headings, paragraphs, lists -- is silently absorbed into one giant code block. The `i++` on line 568 then pushes `i` past `lines.length`, which is harmless but wasteful.

**Recommendation:** After the while loop, check whether a closing fence was actually found. If not, either (a) treat the opening fence as a regular paragraph and re-parse from the line after it, or (b) still emit the code block but log a warning to the results area so the user knows their document had a malformed fence. Minimal fix:

```typescript
let closedFence = false;
while (i < lines.length && !lines[i].startsWith('```')) {
  codeLines.push(lines[i]);
  i++;
}
if (i < lines.length) { closedFence = true; i++; } // skip closing ```
blocks.push({ type: 'code_block', text: codeLines.join('\n'), language });
// Optionally warn if !closedFence
```

---

### HIGH

#### H1. Inline formatting regex produces wrong output with adjacent/overlapping markers (`MD2Word.astro:673`) -- Confidence: High

```typescript
const pattern = /(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*)|(__(.+?)__)|(\*(.+?)\*)|(_(.+?)_)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
```

**Reproduction:**
1. Enter this markdown: `This is **bold and *italic* inside** end`
2. Convert to Word.
3. Expected: "bold and" in bold, "italic" in bold+italic, "inside" in bold.
4. Actual: The `**...**` alternative matches `**bold and *italic*` as bold (consuming up to the first `**` boundary it can find via non-greedy), and the remaining `inside**` is emitted as plain text with literal asterisks.

**Explanation:** The regex-based approach cannot handle nested formatting. Any markdown with `**text *nested* text**` or `*text **nested** text*` will produce incorrect runs. The non-greedy `.+?` matches the shortest span, but it cannot look inside itself for nested markers -- it just finds the nearest closing delimiter, which may be a different nesting level.

**Recommendation:** Replace the single-pass regex with a small recursive parser or a state-machine approach that tracks open formatting spans. Alternatively, document this as a known limitation in the UI. For a minimal impact fix, at least handle the most common case: `***` for simultaneous bold+italic is already handled, so ensure the documentation warns about nesting.

#### H2. Table detection triggers on any line containing a pipe character (`MD2Word.astro:613`) -- Confidence: High

```typescript
// Tables
if (ln.includes('|')) {
  const tableLines: string[] = [];
  while (i < lines.length && lines[i].includes('|')) {
    tableLines.push(lines[i]);
    i++;
  }
  ...
}
```

**Reproduction:**
1. Enter this markdown:
```
The result of A | B is a bitwise OR.

Also, use cmd | grep to filter output.
```
2. Convert to Word.
3. Expected: Two paragraphs of prose.
4. Actual: Both lines are consumed as a table. The first line produces a table row with cells ["The result of A ", " B is a bitwise OR."]. The second line produces ["Also, use cmd ", " grep to filter output."].

**Explanation:** Any line containing a `|` character is interpreted as a table row. Pipe characters in prose, code references, and shell commands are common in technical markdown. Standard markdown parsers require a header separator row (e.g., `|---|---|`) to identify a table.

**Recommendation:** Before entering the table parsing path, verify that the set of collected lines includes at least one separator row matching `/^\|?[\s\-:|]+\|[\s\-:|]+\|?$/`. If no separator row exists, fall through to paragraph parsing instead.

#### H3. Lists do not support continuation lines or nested lists (`MD2Word.astro:573-591`) -- Confidence: High

```typescript
// Unordered lists
if (/^[\*\-\+]\s/.test(ln)) {
  const items: string[] = [];
  while (i < lines.length && /^[\*\-\+]\s/.test(lines[i])) {
    items.push(lines[i].replace(/^[\*\-\+]\s/, ''));
    i++;
  }
  blocks.push({ type: 'unordered_list', items });
  continue;
}
```

**Reproduction:**
1. Enter:
```
- Item one that has
  a continuation line
- Item two
  - Nested item
- Item three
```
2. Convert to Word.
3. Expected: Three items, first with continuation, second with a nested sub-item.
4. Actual: Only "Item one that has" and "Item two" are captured as list items. The continuation line "  a continuation line" breaks the while loop (it doesn't match `^[\*\-\+]\s`), becomes a paragraph, then "  - Nested item" becomes a separate one-item list, and "- Item three" becomes yet another separate list.

**Explanation:** The parser only collects lines that start with a list marker at column 0. Indented continuation lines and indented sub-list markers terminate the current list. This is a common limitation in simple parsers but silently fragments user content.

**Recommendation:** At minimum, treat lines starting with whitespace followed by content (not a new block marker) as continuations of the previous list item. For nested lists, support 2-4 space indentation for sub-items and map them to `bullet.level > 0`. If full support is too complex, add a note in the UI about supported markdown subset.

---

### MEDIUM

#### M1. Horizontal rule pattern conflicts with unordered list pattern (`MD2Word.astro:522-531,606`) -- Confidence: High

```typescript
// In isSpecialLine():
if (/^[\*\-\+]\s/.test(line)) return true;       // line 528
if (/^[\-\*_]{3,}\s*$/.test(line)) return true;   // line 529

// In parseMarkdown():
// Unordered list check (line 573) runs BEFORE hr check (line 606)
if (/^[\*\-\+]\s/.test(ln)) { ... }  // checked first
if (/^[\-\*_]{3,}\s*$/.test(ln)) { ... } // checked second
```

**Reproduction:**
1. Enter: `* * *` (a valid markdown horizontal rule using spaced asterisks).
2. Convert to Word.
3. Expected: A horizontal rule.
4. Actual: `* * *` matches the unordered list pattern (`*` followed by space) and becomes a list item with text `* *`.

**Explanation:** The unordered list check at line 573 runs before the horizontal rule check at line 606. The input `* * *` matches `^[\*\-\+]\s` (asterisk followed by space), so it's consumed as a list item. The horizontal rule patterns `---`, `***`, `___` without spaces work correctly, but spaced variants like `* * *` or `- - -` are valid horizontal rules in CommonMark that get misidentified.

**Recommendation:** Move the horizontal rule check before the list check in `parseMarkdown()`, or specifically test for the spaced-asterisk/dash hr pattern before falling into list parsing.

#### M2. Blockquote loses inline formatting (`MD2Word.astro:802-810`) -- Confidence: High

```typescript
case 'blockquote':
  children.push(new Paragraph({
    children: [new TextRun({
      text: block.text!,
      italics: true,
    })],
    indent: { left: 720 },
    spacing: { before: 120, after: 120 },
  }));
  break;
```

**Reproduction:**
1. Enter: `> This has **bold** and *italic* text`
2. Convert to Word.
3. Expected: Blockquote with "bold" in bold and "italic" in italic (on top of the base italic style).
4. Actual: The entire blockquote text is rendered as a single italic TextRun. The `**bold**` and `*italic*` markers appear as literal asterisks in the Word output.

**Explanation:** The blockquote builder creates a single `TextRun` with the raw text instead of calling `makeTextRuns()` to process inline formatting. This is inconsistent with how headings, paragraphs, and list items are rendered.

**Recommendation:** Replace the single TextRun with `makeTextRuns(block.text!, true)` where the second argument applies base italic. Or better, use `makeTextRuns()` and then set `italics: true` on each returned TextRun.

#### M3. Code block rendered as single paragraph loses line breaks (`MD2Word.astro:767-777`) -- Confidence: High

```typescript
case 'code_block':
  children.push(new Paragraph({
    children: [new TextRun({
      text: block.text!,
      font: 'Consolas',
      size: 18,
    })],
    indent: { left: 360 },
    spacing: { before: 120, after: 120 },
  }));
  break;
```

**Reproduction:**
1. Enter a fenced code block with multiple lines:
````
```python
def hello():
    print("world")
    return True
```
````
2. Convert to Word.
3. Expected: Three lines of code, each on its own line.
4. Actual: In Word, newlines inside a single TextRun are often rendered differently across Word versions. Some versions collapse them; others render them inconsistently. The `docx` library requires explicit `break` elements for reliable newlines.

**Explanation:** The `block.text` contains `\n` characters, but the `docx` library's `TextRun` does not reliably render `\n` as visible line breaks in all Word processors. The correct approach is to split the code text on newlines and create separate `TextRun` objects with `break: true` between them, or emit one Paragraph per code line.

**Recommendation:** Split `block.text` by `\n` and create one Paragraph per line (all with Consolas font and indent), or create multiple TextRuns with explicit `{ break: 1 }` between them.

#### M4. FolderManager shared folder handle creates confusing cross-tab state (`FolderManager.astro:500-513`) -- Confidence: Medium

```typescript
function setSharedFolder(handle: FileSystemDirectoryHandle) {
  folderHandle = handle;
  setPathDisplay(delPath, handle.name);
  setPathDisplay(countPath, handle.name);
  delScan.disabled = false;
  countRun.disabled = false;
  delRun.disabled = true;
  emptyFolders = [];
  clearResults(delResults);
  clearResults(countResults);
}
```

**Reproduction:**
1. Go to the "Count Files" tab.
2. Click "Browse Folder" and select folder A.
3. Switch to the "Delete Empty Folders" tab.
4. Observe: The path display shows folder A, and "Scan for Empty Folders" is enabled -- even though the user never selected a folder on this tab.
5. Click "Scan for Empty Folders." It scans folder A.
6. Now suppose the user wanted to scan folder B for empty folders. They might not notice it's pre-populated with folder A.

**Explanation:** `setSharedFolder()` is called from both `delBrowse` and `countBrowse` click handlers. When the user picks a folder on one tab, it silently propagates to the other tab. While the path display updates on both tabs, the user may not have visited the other tab and may be surprised that clicking "Scan" operates on a folder they didn't explicitly choose for that operation.

**Recommendation:** Consider separate folder handles for delete and count operations. The shared handle is a deliberate UX choice (browse once, use in both tabs), but it conflates read-only counting with destructive deletion. At minimum, when the delete tab's folder was set by the count tab (or vice versa), show a subtle indicator like "(shared from Count tab)" next to the path.

#### M5. Ordered list numbering ignores source numbers (`MD2Word.astro:789-799`) -- Confidence: Medium

```typescript
case 'ordered_list':
  for (let idx = 0; idx < block.items!.length; idx++) {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${idx + 1}. ` }),
        ...makeTextRuns(block.items![idx]),
      ],
      ...
    }));
  }
  break;
```

**Reproduction:**
1. Enter:
```
3. Third item
4. Fourth item
5. Fifth item
```
2. Convert to Word.
3. Expected: Items numbered 3, 4, 5.
4. Actual: Items numbered 1, 2, 3.

**Explanation:** The parser strips the original numbers during parsing (`lines[i].replace(/^\d+\.\s/, '')`), and the builder always re-numbers from 1. This is arguably correct for standard markdown (where list numbers are advisory), but users who intentionally start at a higher number will see unexpected output. Also, the numbering is plain text, not Word's native numbered list feature.

**Recommendation:** Either (a) use the `docx` library's built-in numbered list numbering (`numbering` property) for proper Word-native ordered lists, or (b) preserve the original starting number from the first item in the block and number from there.

#### M6. AudioVisualizer window resize listener never removed (`AudioVisualizer.astro:356`) -- Confidence: Medium

```typescript
fitCanvas();
window.addEventListener('resize', fitCanvas);
```

**Reproduction:** This is a lifecycle concern rather than a user-facing bug. In Astro with client-side navigation (View Transitions or similar), if the component is unmounted and remounted, the old `resize` listener remains attached to `window`. Each mount adds another listener.

**Explanation:** The IIFE adds a `resize` event listener to `window` but never removes it. In a traditional full-page-load site this is harmless (page navigation clears all listeners). However, if Astro View Transitions or any SPA-like navigation is added in the future, this becomes a memory leak -- each visit to the page adds another `fitCanvas` call on every resize.

**Recommendation:** Store the listener reference and use an `unload` or `beforeunload` handler, or use `{ once: false }` with a documented assumption that the page does full reloads. For future-proofing, add cleanup:

```typescript
window.addEventListener('beforeunload', () => {
  window.removeEventListener('resize', fitCanvas);
});
```

#### M7. AudioVisualizer `stop()` does not null out audio references (`AudioVisualizer.astro:641-652`) -- Confidence: Medium

```typescript
function stop() {
  cancelAnimationFrame(rafId);
  if (srcNode) try { srcNode.disconnect(); } catch {}
  if (audioCtx) try { audioCtx.close(); } catch {}
  if (stream) stream.getTracks().forEach(t => t.stop());
  sink.srcObject = null;
  startBtn.textContent = 'Start';
  startBtn.disabled = false;
  stopBtn.disabled = true;
  micSelect.disabled = false;
  modeEl.disabled = false;
}
```

**Explanation:** After stop, `audioCtx`, `analyser`, `srcNode`, and `stream` still hold references to closed/stopped objects. The `draw()` function checks `if (!analyser) return;` -- but analyser is never nulled, so `draw()` would still try to read data from a disconnected analyser if the animation loop somehow continued (unlikely since `cancelAnimationFrame` is called, but defensive nulling is good practice). More importantly, these stale references prevent garbage collection of the AudioContext and MediaStream objects.

**Recommendation:** Add `audioCtx = null; analyser = null; srcNode = null; stream = null;` after the cleanup lines in `stop()`.

---

### LOW

#### L1. FolderManager delete operation uses `removeEntry({ recursive: true })` on "empty" folders (`FolderManager.astro:610`) -- Confidence: Low

```typescript
await parent.removeEntry(target, { recursive: true });
```

**Explanation:** The scan identifies folders with no files in their subtree. However, between scan and delete, another process could create a file inside one of those "empty" folders. The `{ recursive: true }` flag means the deletion will succeed even if the folder now has content. This is a TOCTOU (time-of-check-time-of-use) race condition. The practical risk is low because (a) the user must confirm via modal, (b) the folders were just scanned as empty, and (c) the File System Access API is sandboxed. However, the `recursive: true` flag is more aggressive than necessary for truly empty folders.

**Recommendation:** Use `removeEntry(target)` without `{ recursive: true }` first. If that fails (because the folder is no longer empty), catch the error and report it to the user. Fall back to `recursive: true` only with an additional warning. This makes the delete operation fail-safe: it won't accidentally delete newly-created content.

#### L2. MD2Word `isSpecialLine` check for tags is duplicated (`MD2Word.astro:523,546`) -- Confidence: High

```typescript
// isSpecialLine():
if (/^#[a-zA-Z]/.test(line)) return true;   // line 523

// parseMarkdown():
if (/^#[a-zA-Z]/.test(ln)) { i++; continue; }  // line 546
```

**Explanation:** The `isSpecialLine` function marks `#hashtag` lines as "special" (line 523), which means they break paragraph collection (line 629). Then in `parseMarkdown`, they are skipped entirely (line 546). The duplication is harmless but confusing: `isSpecialLine` says "this is a special line type" but the parser says "skip it entirely." If someone adds tag handling later, they need to update both locations.

**Recommendation:** Either remove the `#tag` check from `isSpecialLine` (since tags are skipped, they shouldn't break paragraphs -- though this would change behavior by absorbing them into adjacent paragraphs) or add a comment explaining the intentional duplication.

#### L3. Filename input allows potentially problematic characters (`MD2Word.astro:29-35`) -- Confidence: Low

```html
<input
  id="mw-filename"
  class="mw-input"
  type="text"
  value="document"
  placeholder="document"
/>
```

**Explanation:** The filename input accepts any characters, including `/`, `\`, `<`, `>`, `:`, `"`, `|`, `?`, `*` -- characters that are invalid in filenames on Windows. The browser's download dialog may handle this gracefully by stripping or replacing invalid characters, but the behavior is browser-dependent.

**Recommendation:** Sanitize the filename before passing it to `downloadDocx()`:
```typescript
const fname = (filenameInput.value.trim() || 'document').replace(/[<>:"/\\|?*]/g, '_');
```

#### L4. MD2Word `__text__` interpreted as bold, not italic (`MD2Word.astro:691-693`) -- Confidence: Medium

```typescript
} else if (full.startsWith('__')) {
  // bold (underscore)
  runs.push({ text: match[6], bold: true });
}
```

**Explanation:** In standard markdown (CommonMark, GFM), `__text__` is strong emphasis (bold) and `_text_` is emphasis (italic). The code correctly implements this. However, some users and markdown dialects treat double underscore as underline. This is not a bug per se, but the comment `// bold (underscore)` could be confusing to future maintainers. This finding is noted as informational -- the implementation matches CommonMark spec.

**Recommendation:** No code change needed. This is correctly implemented per CommonMark. The comment could be clarified to `// strong emphasis (double underscore) — same as **bold**`.

#### L5. FolderManager delete browse requests `readwrite` but count browse requests `read` (`FolderManager.astro:703,852`) -- Confidence: Low

```typescript
// Delete tab
delBrowse.addEventListener('click', async () => {
  const handle = await pickFolder('readwrite');  // line 703
  ...
  setSharedFolder(handle);
});

// Count tab
countBrowse.addEventListener('click', async () => {
  const handle = await pickFolder('read');  // line 852
  ...
  setSharedFolder(handle);
});
```

**Explanation:** Both tabs call `setSharedFolder()` which enables both the delete and count operations. If the user browses from the Count tab (read-only permission), then switches to Delete tab and tries to delete folders, the deletion will fail at runtime because the handle only has read permission. The user gets a permission error but no clear explanation of why.

**Recommendation:** When `setSharedFolder` is called from the count browse (read-only), either (a) disable the delete-related buttons and show a message like "Browse from Delete tab for write access," or (b) re-request readwrite permission when the user clicks "Delete All Empty."

#### L6. AudioVisualizer `primePermission()` called on page load without user gesture (`AudioVisualizer.astro:878-879`) -- Confidence: Low

```typescript
(async () => {
  if (secureOk()) { await primePermission(); }
  ...
})();
```

**Explanation:** On page load, `primePermission()` calls `getUserMedia({ audio: true })` to trigger the microphone permission prompt. Some browsers block `getUserMedia` calls that aren't triggered by a user gesture and will silently fail or show a warning in the console. The try/catch handles this gracefully (returns false), so it doesn't break the component. However, the user sees a microphone permission prompt before they've interacted with the tool, which can be confusing or annoying.

**Recommendation:** Defer `primePermission()` until the user clicks the Start button for the first time, or at least until the user interacts with any control in the visualizer. The mic list will show generic labels ("Microphone 1", "Microphone 2") without permission, but that's acceptable.

---

## Recommended Fix Plan

### Phase 1: Critical (1 finding, ~30 min)
- **C1** -- Add unclosed code fence detection in `MD2Word.astro` parser. File: `src/components/MD2Word.astro`, lines 559-568. Effort: 15 min.

### Phase 2: High Priority (3 findings, ~3-4 hours)
- **H2** -- Add table detection validation requiring separator row. File: `src/components/MD2Word.astro`, lines 613-624. Effort: 30 min.
- **H3** -- Add list continuation line support. File: `src/components/MD2Word.astro`, lines 573-591. Effort: 1-2 hours.
- **H1** -- Document nested inline formatting limitation or implement recursive parser. File: `src/components/MD2Word.astro`, line 673. Effort: 1-2 hours for recursive parser, 15 min for documentation.

### Phase 3: Medium Priority (7 findings, ~2-3 hours)
- **M1** -- Reorder hr/list checks in `parseMarkdown()`. File: `src/components/MD2Word.astro`. Effort: 15 min.
- **M2** -- Use `makeTextRuns()` for blockquote content. File: `src/components/MD2Word.astro`, lines 802-810. Effort: 15 min.
- **M3** -- Split code blocks into per-line paragraphs. File: `src/components/MD2Word.astro`, lines 767-777. Effort: 30 min.
- **M5** -- Use Word-native ordered list numbering or preserve source numbers. File: `src/components/MD2Word.astro`, lines 789-799. Effort: 30 min.
- **M7** -- Null out audio references in `stop()`. File: `src/components/AudioVisualizer.astro`, lines 641-652. Effort: 5 min.
- **M6** -- Add cleanup for window resize listener. File: `src/components/AudioVisualizer.astro`, line 356. Effort: 10 min.
- **M4** -- Add indicator for shared folder state or separate handles. File: `src/components/FolderManager.astro`, lines 500-513. Effort: 30 min.

### Phase 4: Low Priority (6 findings, ~1 hour)
- **L1, L3, L5** -- Small safeguards: non-recursive delete, filename sanitization, permission level check. Effort: 30 min total.
- **L2, L4, L6** -- Code clarity improvements and deferred permission. Effort: 30 min total.

### What NOT to Change

1. **IIFE scoping pattern** -- All three components use IIFEs to scope their variables. This is the correct pattern for Astro components with client-side scripts that could coexist on a page. The `mw-`, `fm-`, and `av-` CSS prefixes complement this isolation well. No changes needed.

2. **FolderManager modal confirmation flow** -- The modal-based confirmation before deleting folders is well-implemented. It shows the exact list of folders to be deleted, requires explicit click (not just Enter), and the promise-based pattern is clean. The "deepest first" deletion sort order is also correct.

3. **AudioVisualizer animation frame throttling** -- The `FRAME_MS = 1000/30` throttle with delta accumulation is a good pattern. It prevents the visualizer from running at unnecessarily high frame rates while keeping smooth 30fps rendering. The `lastFrame` reset on start is also correct.

4. **HTML escaping in results output** -- All three components consistently use `escHtml()` before injecting user-controlled text into innerHTML. The `escHtml` function handles `&`, `<`, and `>` -- sufficient for the contexts where it's used (inside div elements, not attributes). The `line()` helper enforces this consistently.

5. **FolderManager feature detection gate** -- The `showDirectoryPicker` check with graceful fallback to the compatibility message is the right approach. The component correctly hides the entire UI and shows a helpful message with a link to a desktop alternative. This is better than showing a broken UI.

6. **AudioVisualizer secure context check** -- The `secureOk()` function correctly gates microphone access behind HTTPS/localhost. The error message is clear. The `getTabStream()` path via `getDisplayMedia` is also properly handled with the audio track presence check.

7. **MD2Word file deduplication by name** -- The `addFiles()` function avoids duplicates by checking `sf.name`. While this means two different files with the same name can't both be added, this is the right tradeoff for a simple converter tool -- the alternative (allowing duplicates) would be more confusing.

8. **Canvas DPR handling in AudioVisualizer** -- The `fitCanvas()` function correctly reads `devicePixelRatio`, scales the canvas backing store, and uses `setTransform` to normalize drawing coordinates. This produces sharp rendering on high-DPI displays without requiring the drawing code to know about pixel density.

---

## Summary Table

| Priority | Item | Confidence | Files Affected | Effort |
|----------|------|:----------:|----------------|--------|
| CRITICAL | C1. Unclosed code fence swallows document | High | MD2Word.astro | 15 min |
| HIGH | H1. Nested inline formatting produces wrong output | High | MD2Word.astro | 1-2 hr |
| HIGH | H2. Pipe character in prose triggers false table | High | MD2Word.astro | 30 min |
| HIGH | H3. No list continuation or nesting support | High | MD2Word.astro | 1-2 hr |
| MEDIUM | M1. HR/list pattern ordering conflict | High | MD2Word.astro | 15 min |
| MEDIUM | M2. Blockquote loses inline formatting | High | MD2Word.astro | 15 min |
| MEDIUM | M3. Code block line breaks unreliable in Word | High | MD2Word.astro | 30 min |
| MEDIUM | M4. Shared folder handle cross-tab confusion | Medium | FolderManager.astro | 30 min |
| MEDIUM | M5. Ordered list re-numbers from 1 | Medium | MD2Word.astro | 30 min |
| MEDIUM | M6. Resize listener never removed | Medium | AudioVisualizer.astro | 10 min |
| MEDIUM | M7. Audio refs not nulled on stop | Medium | AudioVisualizer.astro | 5 min |
| LOW | L1. Recursive delete on "empty" folders | Low | FolderManager.astro | 10 min |
| LOW | L2. Duplicated tag-skip logic | High | MD2Word.astro | 5 min |
| LOW | L3. Unsanitized filename | Low | MD2Word.astro | 5 min |
| LOW | L4. Double underscore comment clarity | Medium | MD2Word.astro | 2 min |
| LOW | L5. Read-only handle enables delete UI | Low | FolderManager.astro | 15 min |
| LOW | L6. Permission prompt on page load | Low | AudioVisualizer.astro | 10 min |
