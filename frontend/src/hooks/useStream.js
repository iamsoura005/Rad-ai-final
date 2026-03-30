import { useCallback, useRef, useState } from "react";
import { streamSSE } from "../utils/api";

function useStream(defaultUrl, defaultOptions = {}) {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const reset = useCallback(() => {
    setText("");
    setError("");
  }, []);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const start = useCallback(
    async (override = {}) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setText("");
      setError("");
      setIsStreaming(true);

      try {
        const overrideOptions = override.options || override;
        await streamSSE({
          url: override.url || defaultUrl,
          options: {
            ...defaultOptions,
            ...overrideOptions,
            signal: controller.signal,
          },
          onChunk: (chunk) => {
            setText((prev) => prev + chunk);
          },
          onError: (errMsg) => {
            setError(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
          },
        });
      } catch (err) {
        if (err?.name !== "AbortError") {
          const message = err?.message || err || "Stream failed";
          setError(typeof message === "string" ? message : JSON.stringify(message));
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [defaultOptions, defaultUrl]
  );

  return {
    text,
    isStreaming,
    error,
    start,
    reset,
    cancel,
  };
}

export default useStream;
