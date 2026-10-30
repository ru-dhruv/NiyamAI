/**
 * ChatBubbleSlot
 *
 * This is an EMPTY RESERVED SLOT for the chat assistant bubble.
 * It renders a clearly-labelled placeholder fixed to the bottom-right.
 *
 * ─ NO chat UI is built here ─
 * ─ Position: 56 px circle, 18 px from edges + CSS safe-area inset ─
 * ─ z-index: 40 (below drawer at 50 and sheet at 60) ─
 *
 * The chat feature is owned by Member C.
 * When ready, replace the contents of this component with the real chat bubble.
 */

import * as React from "react";

export function ChatBubbleSlot() {
  return (
    <div
      aria-hidden="true"
      data-slot="chat-bubble"
      className={[
        "fixed z-[40] flex items-center justify-center",
        "right-[max(18px,env(safe-area-inset-right,18px))]",
        "bottom-[max(18px,env(safe-area-inset-bottom,18px))]",
        "h-14 w-14 rounded-full",
        "border-2 border-dashed border-[var(--ny-forest)] opacity-30",
      ].join(" ")}
    >
      {process.env.NODE_ENV !== "production" && (
        <span
          className="text-[9px] text-[var(--ny-forest)] font-mono leading-none text-center select-none"
          aria-hidden="true"
        >
          CHAT
          <br />
          SLOT
        </span>
      )}
    </div>
  );
}
