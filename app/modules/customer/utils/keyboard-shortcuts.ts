export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  label: string;
}

export const CUSTOMER_SHORTCUTS: Record<string, Shortcut> = {
  ADD_NEW: { key: "n", alt: true, label: "Alt+N - Thêm mới" },
  BACK_TO_LIST: { key: "b", alt: true, label: "Alt+B - Quay lại danh sách" },
  EDIT_CUSTOMER: { key: "e", ctrl: true, label: "Ctrl+E - Chỉnh sửa" },
  TOGGLE_FILTER: { key: "f", ctrl: true, label: "Ctrl+F - Mở/đóng bộ lọc" },
};

export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
    (shortcut.key === "Escape" && event.key === "Escape") ||
    (shortcut.key === "Home" && event.key === "Home") ||
    (shortcut.key === "End" && event.key === "End") ||
    (shortcut.key === "PageUp" && event.key === "PageUp") ||
    (shortcut.key === "PageDown" && event.key === "PageDown");

  const ctrlMatch = (event.ctrlKey || event.metaKey) === (shortcut.ctrl ?? false);
  const shiftMatch = event.shiftKey === (shortcut.shift ?? false);
  const altMatch = event.altKey === (shortcut.alt ?? false);

  return keyMatch && ctrlMatch && shiftMatch && altMatch;
}

export function shouldIgnoreShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  return target.isContentEditable;
}
