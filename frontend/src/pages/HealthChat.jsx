import { motion } from "framer-motion";
import { Mic, MicOff, PlusCircle, SendHorizontal, Stethoscope } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import useStream from "../hooks/useStream";
import { buildChatRequest } from "../utils/api";

const quickQuestions = [
  "What are symptoms of diabetes?",
  "Is my fever dangerous?",
  "What does this blood report mean?",
  "When should I see a doctor?",
];

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function HealthChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useLocalStorage("radiology_ai_history", []);
  const listRef = useRef(null);
  const recognitionRef = useRef(null);
  const prevStreaming = useRef(false);

  const { text, isStreaming, error, start } = useStream("http://localhost:8000/chat", {
    method: "POST",
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, text]);

  useEffect(() => {
    if (!isStreaming) return;
    setMessages((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      const idx = next.length - 1;
      if (next[idx].role === "assistant") {
        next[idx] = { ...next[idx], content: text };
      }
      return next;
    });
  }, [isStreaming, text]);

  useEffect(() => {
    if (prevStreaming.current && !isStreaming && text.trim()) {
      setMessages((prev) => {
        if (!prev.length) return prev;
        const next = [...prev];
        const idx = next.length - 1;
        if (next[idx].role === "assistant") {
          next[idx] = { ...next[idx], content: text, createdAt: new Date().toISOString() };
        }
        return next;
      });

      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          type: "chat",
          summary: text.slice(0, 90),
          severity: "info",
          confidence: 0,
          content: text,
        },
        ...prev,
      ]);
    }
    prevStreaming.current = isStreaming;
  }, [isStreaming, setHistory, text]);

  const sendMessage = async (nextText) => {
    const content = (nextText || input).trim();
    if (!content || isStreaming) return;

    const now = new Date().toISOString();
    const nextMessages = [...messages, { role: "user", content, createdAt: now }];

    setMessages([...nextMessages, { role: "assistant", content: "", createdAt: now }]);
    setInput("");

    await start(
      buildChatRequest({
        messages: nextMessages.map((message) => ({ role: message.role, content: message.content })),
      })
    );
  };

  const canUseSpeech = useMemo(
    () => typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

  const toggleVoice = () => {
    if (!canUseSpeech) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
          <h2 className="text-lg font-semibold text-white">AI Health Chat</h2>
          <button
            type="button"
            onClick={() => setMessages([])}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-3 py-2 text-xs text-gray-300"
          >
            <PlusCircle className="h-4 w-4" /> New Conversation
          </button>
        </div>

        <div ref={listRef} className="chat-scroll h-[56vh] space-y-3 overflow-y-auto rounded-xl border border-gray-800 bg-gray-950/70 p-3">
          {!messages.length && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-cyan-100">
              👋 Hello! I'm Dr. AI. I can help answer your health questions, explain symptoms, and
              guide you. How can I help you today?
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={`${message.role}-${idx}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    : "border border-gray-700 bg-gray-800 text-gray-200"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="mb-1 inline-flex items-center gap-1 text-xs text-cyan-300">
                    <Stethoscope className="h-3.5 w-3.5" /> Dr. AI
                  </div>
                )}

                {message.content || (isStreaming && idx === messages.length - 1) ? (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                ) : (
                  <div className="typing-dots inline-flex gap-1">
                    <span />
                    <span />
                    <span />
                  </div>
                )}

                <p className="mt-2 text-[10px] opacity-70">{formatTime(message.createdAt)}</p>
              </div>
            </div>
          ))}

          {error && (
            <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-100">
              {error}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => sendMessage(question)}
              disabled={isStreaming}
              className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300 hover:border-cyan-500/40"
            >
              {question}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
            className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-3 py-3 text-sm text-gray-100 outline-none focus:border-cyan-500"
            placeholder="Ask Dr. AI anything about your health..."
          />

          <button
            type="button"
            onClick={toggleVoice}
            disabled={!canUseSpeech}
            className={`rounded-xl border px-3 py-3 text-sm ${
              isListening
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                : "border-gray-700 bg-gray-900 text-gray-300"
            }`}
            title={canUseSpeech ? "Voice input" : "Speech recognition unavailable"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:scale-105 disabled:opacity-50"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}

export default HealthChat;
