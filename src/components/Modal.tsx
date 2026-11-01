"use client";

import { useEffect, useRef, type ReactNode } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type ModalProps = {
  labelledBy: string;
  describedBy?: string;
  role?: "dialog" | "alertdialog";
  onClose: () => void;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  panelClassName?: string;
  children: ReactNode;
};

export default function Modal({
  labelledBy,
  describedBy,
  role = "dialog",
  onClose,
  closeOnOverlay = true,
  closeOnEscape = true,
  panelClassName = "",
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const originalOverflow = document.body.style.overflow;
    const panel = panelRef.current;

    document.body.style.overflow = "hidden";

    function getFocusableElements() {
      if (!panel) return [];

      return Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");
    }

    const firstElement = getFocusableElements()[0];
    (firstElement ?? panel)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || active === panel || !panel.contains(active))
      ) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [closeOnEscape]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`w-full overflow-hidden rounded-2xl bg-background shadow-xl outline-none ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
