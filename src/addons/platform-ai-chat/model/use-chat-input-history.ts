import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "../api/ai-chat-api";

const STORAGE_KEY = "aichat_input_history";
const MAX_HISTORY = 50;

function loadStoredHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function saveStoredHistory(history: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
  } catch {
    // Ignore storage quota or access errors in private windows
  }
}

export function useChatInputHistory(
  content: string,
  setContent: (value: string) => void,
  sessionMessages?: ChatMessage[],
) {
  const [history, setHistory] = useState<string[]>(() => loadStoredHistory());
  const historyIndexRef = useRef<number>(-1);
  const draftRef = useRef<string>("");

  // Seed history from existing session user messages if present
  useEffect(() => {
    if (!sessionMessages?.length) return;
    const userMsgs = sessionMessages
      .filter((m) => m.role === "USER" && m.content.trim())
      .map((m) => m.content.trim());

    if (userMsgs.length > 0) {
      setHistory((prev) => {
        const combined = Array.from(new Set([...prev, ...userMsgs]));
        saveStoredHistory(combined);
        return combined;
      });
    }
  }, [sessionMessages]);

  const addToHistory = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      const next = prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed];
      saveStoredHistory(next);
      return next;
    });

    historyIndexRef.current = -1;
    draftRef.current = "";
  }, []);

  const resetNavigation = useCallback(() => {
    historyIndexRef.current = -1;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "ArrowUp") {
        const textarea = e.currentTarget;
        const isAtStart = textarea.selectionStart === 0 && textarea.selectionEnd === 0;
        const isNavigating = historyIndexRef.current !== -1;

        if ((isAtStart || isNavigating || content === "") && history.length > 0) {
          e.preventDefault();

          if (!isNavigating) {
            draftRef.current = content;
            historyIndexRef.current = history.length - 1;
          } else if (historyIndexRef.current > 0) {
            historyIndexRef.current -= 1;
          }

          const targetMessage = history[historyIndexRef.current];
          if (targetMessage !== undefined) {
            setContent(targetMessage);
            requestAnimationFrame(() => {
              textarea.setSelectionRange(targetMessage.length, targetMessage.length);
            });
          }
        }
      } else if (e.key === "ArrowDown") {
        if (historyIndexRef.current !== -1) {
          e.preventDefault();
          const textarea = e.currentTarget;

          if (historyIndexRef.current < history.length - 1) {
            historyIndexRef.current += 1;
            const targetMessage = history[historyIndexRef.current];
            if (targetMessage !== undefined) {
              setContent(targetMessage);
              requestAnimationFrame(() => {
                textarea.setSelectionRange(targetMessage.length, targetMessage.length);
              });
            }
          } else {
            // Reached newest item: restore draft
            historyIndexRef.current = -1;
            const draft = draftRef.current;
            setContent(draft);
            requestAnimationFrame(() => {
              textarea.setSelectionRange(draft.length, draft.length);
            });
          }
        }
      }
    },
    [content, history, setContent],
  );

  return {
    addToHistory,
    handleKeyDown,
    resetNavigation,
  };
}
