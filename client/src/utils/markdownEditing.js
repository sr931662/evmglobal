// Shared behaviour for the plain <textarea> markdown editors in the admin.
// Typing a list should feel like typing a list: press Enter at the end of a
// bullet and the next bullet is already there; press Enter on an empty bullet
// and you drop out of the list instead of collecting empty markers.

// "- ", "* ", "+ ", "1. ", "1) ", optionally a "[ ] "/"[x] " task box, and
// whatever indentation the line already carries.
const LIST_LINE = /^(\s*)(?:([-*+])|(\d+)([.)]))\s+(\[[ xX]\]\s+)?(.*)$/

/**
 * Continuation for the line the cursor sits on, or null when it isn't a list
 * item (in which case the caller should let the keypress through untouched).
 */
export function listContinuation(value, cursor) {
  const text      = value || ''
  const lineStart = text.lastIndexOf('\n', cursor - 1) + 1
  const lineEnd   = text.indexOf('\n', cursor)
  const line      = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd)

  const match = LIST_LINE.exec(line)
  if (!match) return null

  const [, indent, bullet, number, delimiter, task, content] = match

  // Enter on a marker with nothing after it means "I'm done with this list" —
  // clear the marker rather than adding another empty one.
  if (!content.trim()) {
    const next = text.slice(0, lineStart) + indent + text.slice(cursor)
    return { value: next, cursor: lineStart + indent.length }
  }

  const marker = bullet
    ? `${indent}${bullet} `
    : `${indent}${Number(number) + 1}${delimiter} `
  // A checklist continues as an unchecked box, never as a pre-ticked one.
  const prefix = marker + (task ? '[ ] ' : '')

  const next = `${text.slice(0, cursor)}\n${prefix}${text.slice(cursor)}`
  return { value: next, cursor: cursor + 1 + prefix.length }
}

/**
 * Wire onto a textarea's onKeyDown. Returns true when it handled the key, so
 * callers can skip their own Enter handling.
 *
 *   onKeyDown={e => handleListKeyDown(e, value, onChange)}
 */
export function handleListKeyDown(event, value, onChange) {
  if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return false

  const ta = event.target
  // A selection means the user is replacing text, not extending a list.
  if (ta.selectionStart !== ta.selectionEnd) return false

  const result = listContinuation(value, ta.selectionStart)
  if (!result) return false

  event.preventDefault()
  onChange(result.value)
  // The value lands on the next render, so move the caret after it.
  requestAnimationFrame(() => {
    ta.focus()
    ta.setSelectionRange(result.cursor, result.cursor)
  })
  return true
}

/**
 * Toggles a line prefix ("- ", "1. ", "> " …) across every line the selection
 * touches — the behaviour people expect from a list button in a toolbar.
 */
export function toggleLinePrefix(value, start, end, prefix) {
  const text      = value || ''
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const tail      = text.indexOf('\n', end)
  const lineEnd   = tail === -1 ? text.length : tail

  const lines = text.slice(lineStart, lineEnd).split('\n')
  const allPrefixed = lines.every(line => !line.trim() || line.startsWith(prefix))

  const updated = lines.map(line => {
    if (!line.trim()) return line
    if (allPrefixed) return line.slice(prefix.length)
    return prefix + line
  })

  const block = updated.join('\n')
  const delta = block.length - (lineEnd - lineStart)
  return {
    value:  text.slice(0, lineStart) + block + text.slice(lineEnd),
    cursor: Math.max(lineStart, end + delta),
  }
}

/**
 * A horizontal rule only parses as one when a blank line precedes it —
 * "text\n---" is a setext heading, which is why dividers kept disappearing
 * from published articles. This pads the insertion so it always renders.
 */
export function dividerInsertion(value, cursor) {
  const text   = value || ''
  const before = text.slice(0, cursor)
  const after  = text.slice(cursor)

  const leading  = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''
  const trailing = after.startsWith('\n\n') ? '' : (after.startsWith('\n') ? '\n' : '\n\n')

  const insert = `${leading}---${trailing}`
  return { value: before + insert + after, cursor: cursor + insert.length }
}
