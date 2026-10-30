"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  X,
  Send,
  ExternalLink,
  ShieldCheck,
  Scale,
  Bot,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import { queryComplianceAssistant, ChatMessage } from "@/lib/assistant";

export function ChatBubbleSlot() {
  const t = useTranslations("assistant");
  const { locale } = useLanguage();

  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);

  const initialWelcomeText =
    locale === "hi"
      ? "नमस्ते! मैं NiyamAI असिस्टेंट हूँ। मुझसे अपने अनिवार्य लाइसेंस (FSSAI, फायर एनओसी, ट्रेड लाइसेंस), जीएसटी इनवॉइस ऑडिट या नियमों के जुर्माने के बारे में पूछें। मैं केवल आधिकारिक नियमों के आधार पर जवाब देता हूँ।"
      : "Namaste! I am NiyamAI Assistant. Ask me any question about your mandatory licences (FSSAI, Fire NOC, Trade Licence), GST invoice audits, or statutory penalties. I answer strictly from official verified rules.";

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "assistant",
      text: initialWelcomeText,
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Hydration safety: only show dynamic elements after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Update initial message if locale changed and only 1 message exists
  React.useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "msg_welcome") {
        return [
          {
            id: "msg_welcome",
            sender: "assistant",
            text: initialWelcomeText,
            timestamp: "Just now",
          },
        ];
      }
      return prev;
    });
  }, [locale, initialWelcomeText]);

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = React.useCallback(
    async (textToSend: string) => {
      const trimmed = textToSend.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = {
        id: `usr_${Date.now()}`,
        sender: "user",
        text: trimmed,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const response = await queryComplianceAssistant(trimmed, locale);
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: "assistant",
          text: response.text,
          citation: response.citation,
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: "assistant",
          text:
            locale === "hi"
              ? "नियम डेटाबेस से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।"
              : "Could not query compliance rules. Please try again.",
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, locale]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const sampleQuestions = [
    t("sampleQ1"),
    t("sampleQ2"),
    t("sampleQ3"),
    t("sampleQ4"),
  ];

  return (
    <>
      {/* Floating Launcher Button — Fixed bottom-right */}
      <div
        className={cn(
          "fixed z-[40] flex items-center justify-center",
          "right-[max(18px,env(safe-area-inset-right,18px))]",
          "bottom-[max(18px,env(safe-area-inset-bottom,18px))]"
        )}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? t("close") : t("launcherLabel")}
          aria-expanded={isOpen}
          className={cn(
            "relative h-14 w-14 rounded-full flex items-center justify-center",
            "bg-[var(--ny-forest)] text-white shadow-xl hover:shadow-2xl",
            "transition-all duration-200 transform hover:scale-105 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86e2c3] focus-visible:ring-offset-2",
            isOpen ? "bg-[var(--ny-forest-deep)] rotate-90" : "bg-[var(--ny-forest)]"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white transition-transform" aria-hidden="true" />
          ) : (
            <>
              <Bot className="h-6 w-6 text-white" aria-hidden="true" />
              {/* Online pulse dot */}
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86e2c3] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#86e2c3]" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal / Card */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
          className={cn(
            "fixed z-[45] flex flex-col",
            "right-[max(18px,env(safe-area-inset-right,18px))]",
            "bottom-[max(84px,calc(env(safe-area-inset-bottom,18px)+66px))]",
            "w-[calc(100vw-36px)] sm:w-[410px]",
            "h-[min(540px,calc(100vh-120px))]",
            "rounded-[26px] bg-[var(--ny-surface)] border border-[var(--ny-border)]",
            "shadow-2xl overflow-hidden",
            "animate-in fade-in zoom-in-95 duration-200"
          )}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[var(--ny-forest-deep)] text-white flex items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 text-[#86e2c3]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold font-heading text-white truncate">
                    {t("title")}
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#86e2c3]/20 text-[#86e2c3] border border-[#86e2c3]/30 shrink-0">
                    {t("badge")}
                  </span>
                </div>
                <p className="text-[11px] text-[#86e2c3] truncate mt-0.5">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t("close")}
              className="h-8 w-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86e2c3]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[var(--ny-bg)]/50"
            aria-live="polite"
          >
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] text-xs leading-relaxed p-3.5 rounded-[18px]",
                      isUser
                        ? "bg-[var(--ny-forest)] text-white rounded-br-sm shadow-sm"
                        : "bg-[var(--ny-surface)] text-[var(--ny-text)] border border-[var(--ny-border)] rounded-bl-sm shadow-sm space-y-2.5"
                    )}
                  >
                    {/* Message text */}
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Rule Citation Card (if grounded rule attached) */}
                    {msg.citation && (
                      <div className="mt-2.5 pt-2.5 border-t border-[var(--ny-border)] bg-[#e5f3ee]/50 dark:bg-[#0d5b44]/20 p-2.5 rounded-xl space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-bold text-[var(--ny-forest)] dark:text-[#86e2c3] font-mono text-[10px] uppercase tracking-wider">
                            Rule: {msg.citation.rule_code}
                          </span>
                          <span className="text-[10px] text-[var(--ny-muted)]">
                            Verified: {msg.citation.last_verified}
                          </span>
                        </div>

                        <div className="flex items-start gap-1.5 text-[var(--ny-text)] font-semibold">
                          <Scale className="h-3.5 w-3.5 text-[var(--ny-forest)] shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{msg.citation.legal_reference}</span>
                        </div>

                        <div className="flex items-start gap-1.5 text-amber-700 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/50 dark:border-amber-800/40">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{msg.citation.penalty_formula}</span>
                        </div>

                        <a
                          href={msg.citation.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--ny-forest)] dark:text-[#86e2c3] hover:underline pt-0.5"
                        >
                          <span>{t("sourceLink")}</span>
                          <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-[18px] bg-[var(--ny-surface)] border border-[var(--ny-border)] w-20 text-[var(--ny-muted)] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ny-forest)] animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ny-forest)] animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ny-forest)] animate-bounce [animation-delay:300ms]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Strip (visible especially when few messages) */}
          {messages.length <= 3 && (
            <div className="px-3 py-2 bg-[var(--ny-surface)] border-t border-[var(--ny-border)] overflow-x-auto shrink-0 flex gap-1.5 no-scrollbar">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  disabled={isTyping}
                  className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--ny-bg)] hover:bg-[#e5f3ee] text-[var(--ny-text)] hover:text-[var(--ny-forest)] border border-[var(--ny-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86e2c3] truncate max-w-[240px]"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[var(--ny-surface)] border-t border-[var(--ny-border)] shrink-0 space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                disabled={isTyping}
                className="flex-1 h-11 px-3.5 rounded-full border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs placeholder:text-[var(--ny-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86e2c3]"
              />
              <Button
                type="submit"
                variant="primary"
                size="icon"
                disabled={!input.trim() || isTyping}
                aria-label={t("send")}
                className="h-11 w-11 rounded-full shrink-0 font-bold"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            {/* Disclaimer footer */}
            <p className="text-[10px] text-center text-[var(--ny-muted)] px-1 leading-tight">
              {t("disclaimer")}
            </p>
          </form>
        </div>
      )}
    </>
  );
}
