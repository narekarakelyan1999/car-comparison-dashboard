"use client";

import { type MouseEvent, type ReactNode, useEffect, useId, useRef } from "react";

type DialogProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

function isDialogOpen(dialog: HTMLDialogElement): boolean {
  return dialog.open || dialog.hasAttribute("open");
}

function showDialog(dialog: HTMLDialogElement) {
  if (isDialogOpen(dialog)) {
    return;
  }

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    return;
  }

  dialog.setAttribute("open", "");
}

function hideDialog(dialog: HTMLDialogElement) {
  if (typeof dialog.close === "function" && dialog.open) {
    dialog.close();
    return;
  }

  dialog.removeAttribute("open");
}

export function Dialog({ title, open, onClose, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingFromProp = useRef(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const { documentElement, body } = document;
    const scrollY = window.scrollY;
    const previous = {
      htmlOverflow: documentElement.style.overflow,
      bodyOverflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      documentElement.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open) {
      showDialog(dialog);
      return;
    }

    if (!isDialogOpen(dialog)) {
      return;
    }

    closingFromProp.current = true;
    hideDialog(dialog);
    closingFromProp.current = false;
  }, [open]);

  function requestClose() {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
      return;
    }

    dialog.removeAttribute("open");
    onClose();
  }

  function onDialogClose() {
    if (closingFromProp.current) {
      return;
    }

    onClose();
  }

  function onBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      requestClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed top-32 left-1/2 z-50 m-0 max-h-[calc(100dvh-10rem)] w-[min(24rem,calc(100%-6rem))] -translate-x-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl backdrop:bg-slate-900/40"
      onClick={onBackdropClick}
      onClose={onDialogClose}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center text-3xl leading-none text-slate-700"
          aria-label="Close"
          onClick={requestClose}
        >
          ×
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </dialog>
  );
}
