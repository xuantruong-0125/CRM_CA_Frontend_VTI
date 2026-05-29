/**
 * Keyboard shortcuts utilities for Lead module
 */

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  label: string;
}

export const LEAD_SHORTCUTS: Record<string, Shortcut> = {
  // LeadListPage
  CREATE_LEAD: { key: "n", alt: true, label: "Alt+N - Tạo lead mới" },
  TOGGLE_FILTER: { key: "f", ctrl: true, label: "Ctrl+F - Mở/đóng filter nâng cao" },
  TOGGLE_SECURITY: { key: "m", ctrl: true, shift: true, label: "Ctrl+Shift+M - Lọc bảo mật" },
  TOGGLE_PAGE_SIZE: { key: "p", ctrl: true, shift: true, label: "Ctrl+Shift+P - Đổi lead/trang" },
  FIRST_PAGE: { key: "Home", ctrl: true, label: "Ctrl+Home - Trang đầu" },
  PREV_PAGE: { key: "PageUp", ctrl: true, label: "Ctrl+PageUp - Trang trước" },
  NEXT_PAGE: { key: "PageDown", ctrl: true, label: "Ctrl+PageDown - Trang sau" },
  LAST_PAGE: { key: "End", ctrl: true, label: "Ctrl+End - Trang cuối" },
  
  // LeadForm
  SAVE_FORM: { key: "s", ctrl: true, label: "Ctrl+S - Lưu" },
  CANCEL_FORM: { key: "Escape", label: "Esc - Hủy" },
  
  // LeadDetailPage  
  EDIT_LEAD: { key: "e", ctrl: true, label: "Ctrl+E - Chỉnh sửa" },
  CREATE_ACTIVITY: { key: "a", ctrl: true, label: "Ctrl+A - Log hoạt động" },
  CREATE_TASK: { key: "t", ctrl: true, label: "Ctrl+T - Tạo nhắc việc" },

  // LeadInteractionPanel
  INTERACTION_CLOSE: { key: "Escape", label: "Esc - Đóng" },
  INTERACTION_ACTIVITY_TAB: { key: "a", alt: true, label: "Alt+A - Tab Log hoạt động" },
  INTERACTION_TASK_TAB: { key: "t", alt: true, label: "Alt+T - Tab Tạo nhắc việc" },
  INTERACTION_SUBMIT: { key: "s", ctrl: true, label: "Ctrl+S - Lưu/Tạo" },
  INTERACTION_RESET: { key: "r", ctrl: true, label: "Ctrl+R - Reset form" },
};

export function getShortcutLabel(shortcut: Shortcut): string {
  return shortcut.label;
}

export function getShortcutDisplay(shortcut: Shortcut): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.alt) parts.push("Alt");
  parts.push(shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1));
  return parts.join("+");
}

export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: Shortcut
): boolean {
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
