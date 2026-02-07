## 2025-05-19 - Interactive Lists Accessibility
**Learning:** Common pattern of `div` with `onClick` for list items (like notifications) blocks keyboard users.
**Action:** Always replace with `<button type="button" className="w-full text-left ...">` to maintain layout while gaining native focus and keyboard support.

## 2025-05-20 - Disabled Button Tooltips
**Learning:** Disabled buttons (with `disabled` attribute) swallow pointer events in React/browsers, preventing tooltips from triggering.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `className="block"` to ensure the tooltip trigger works for both mouse and keyboard users.
