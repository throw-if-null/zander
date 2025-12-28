export type ShortcutsHandlers = {
  openCreateBookmarkDialog?: () => void;
  addCategory?: () => void;
  goToSettings?: () => void;
  goToHome?: () => void;
};

export function setupGlobalShortcuts(
  handlers: ShortcutsHandlers
): () => void {
  const handleGlobalShortcut = (ev: Event) => {
    const ce = ev as CustomEvent;
    const name = ce?.detail?.name as string | undefined;
    if (!name) return;

    switch (name) {
      case "home":
        handlers.goToHome?.();
        break;
      case "settings":
        handlers.goToSettings?.();
        break;
      case "add-bookmark":
        handlers.openCreateBookmarkDialog?.();
        break;
      case "add-category":
        handlers.addCategory?.();
        break;
      default:
        break;
    }
  };

  const handleGlobalEscape = () => {
    // Consumers can listen for zander:escape or implement their own close logic.
    const ev = new CustomEvent("zander:escape:internal");
    window.dispatchEvent(ev);
  };

  window.addEventListener("zander:shortcut", handleGlobalShortcut as EventListener);
  window.addEventListener("zander:escape", handleGlobalEscape as EventListener);

  return () => {
    window.removeEventListener("zander:shortcut", handleGlobalShortcut as EventListener);
    window.removeEventListener("zander:escape", handleGlobalEscape as EventListener);
  };
}
