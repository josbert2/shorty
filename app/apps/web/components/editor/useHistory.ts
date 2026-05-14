"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX = 50;

export function useHistory<T>(initial: T) {
  const [stack, setStack] = useState<T[]>([initial]);
  const [index, setIndex] = useState(0);
  const stateRef = useRef(stack[0]);
  stateRef.current = stack[index];

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setStack((prev) => {
        const current = prev[index];
        const next =
          typeof updater === "function" ? (updater as (p: T) => T)(current) : updater;
        if (Object.is(next, current)) return prev;
        const trimmed = prev.slice(0, index + 1);
        trimmed.push(next);
        const cap = trimmed.length > MAX ? trimmed.slice(trimmed.length - MAX) : trimmed;
        setIndex(cap.length - 1);
        return cap;
      });
    },
    [index]
  );

  const undo = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const redo = useCallback(
    () => setIndex((i) => Math.min(stack.length - 1, i + 1)),
    [stack.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return {
    state: stack[index],
    set,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < stack.length - 1,
  };
}
