const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function normalizeLineBreaks(text) {
  return text.replace(/\r/g, "");
}

function detailToMessage(detail) {
  if (!detail) return "Unknown error";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.msg) return item.msg;
        return JSON.stringify(item);
      })
      .join(" | ");
  }
  if (detail?.msg) return detail.msg;
  return JSON.stringify(detail);
}

export async function streamSSE({ url, options = {}, onChunk, onError, onData }) {
  const response = await fetch(url, options);
  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.detail) errorMsg = detailToMessage(data.detail);
    } catch {
      // Keep fallback error message.
    }
    throw new Error(errorMsg);
  }

  if (!response.body) {
    throw new Error("Streaming not supported by this browser");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    if (streamDone) break;

    buffer += normalizeLineBreaks(decoder.decode(value, { stream: true }));
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const eventText of events) {
      const payload = eventText
        .split("\n")
        .filter((line) => line.startsWith("data: "))
        .map((line) => line.slice(6))
        .join("\n");

      if (!payload) continue;
      if (payload === "[DONE]") {
        done = true;
        break;
      }

      if (payload.startsWith("{")) {
        try {
          const parsed = JSON.parse(payload);
          if (typeof parsed?.error === "string") {
            onError?.(parsed.error);
            continue;
          }
          if (typeof parsed?.chunk === "string") {
            onChunk?.(parsed.chunk);
            continue;
          }
          onData?.(parsed);
          continue;
        } catch {
          // Fall through to plain text handling.
        }
      }

      if (payload.startsWith("ERROR:")) {
        onError?.(payload.replace(/^ERROR:\s*/, ""));
        continue;
      }

      onChunk?.(payload);
    }
  }
}

export function buildAnalyzeRequest(file, context = "") {
  const body = new FormData();
  body.append("file", file);
  body.append("context", context);

  return {
    url: `${API_BASE}/analyze`,
    options: {
      method: "POST",
      body,
    },
  };
}

export function buildSymptomsRequest(payload) {
  return {
    url: `${API_BASE}/symptoms`,
    options: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  };
}

export function buildMedicineRequest(payload) {
  return {
    url: `${API_BASE}/medicine`,
    options: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  };
}

export function buildChatRequest(payload) {
  return {
    url: `${API_BASE}/chat`,
    options: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  };
}
