/**
 * Keyboard shortcut badge component to display on buttons
 */

import { LEAD_SHORTCUTS } from "@/modules/lead/utils/keyboard-shortcuts";

type KeyboardShortcutBadgeProps = {
  shortcut: typeof LEAD_SHORTCUTS[keyof typeof LEAD_SHORTCUTS];
  className?: string;
};

export function KeyboardShortcutBadge({
  shortcut,
  className = "",
}: KeyboardShortcutBadgeProps) {
  const parts: string[] = [];
  if ("ctrl" in shortcut && shortcut.ctrl) parts.push("Ctrl");
  if ("shift" in shortcut && shortcut.shift) parts.push("Shift");
  if ("alt" in shortcut && shortcut.alt) parts.push("Alt");
  parts.push(
    shortcut.key === "Escape"
      ? "Esc"
      : shortcut.key === "Home"
        ? "Home"
        : shortcut.key === "End"
          ? "End"
          : shortcut.key === "PageUp"
            ? "PgUp"
            : shortcut.key === "PageDown"
              ? "PgDn"
              : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1)
  );

  return (
    <kbd
      className={`inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[8px] font-semibold text-sky-700 shadow-sm ${className}`}
      title={shortcut.label}
    >
      {parts.join("+")}
    </kbd>
  );
}
