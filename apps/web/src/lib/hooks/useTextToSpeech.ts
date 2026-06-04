"use client";

import { useCallback, useRef, useState } from "react";

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
    setSpeakingId(null);
  }, []);

  const speakWithBrowser = useCallback(
    (text: string, id: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return false;
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setSpeakingId(id);
      return true;
    },
    [],
  );

  const speak = useCallback(
    async (text: string, id: string) => {
      stop();
      const trimmed = text.trim();
      if (!trimmed) return;

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed.slice(0, 4000) }),
        });

        if (res.ok && res.headers.get("content-type")?.includes("audio")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            URL.revokeObjectURL(url);
            setIsSpeaking(false);
            setSpeakingId(null);
            audioRef.current = null;
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            speakWithBrowser(trimmed, id);
          };
          setIsSpeaking(true);
          setSpeakingId(id);
          await audio.play();
          return;
        }
      } catch {
        // fall through to browser TTS
      }

      speakWithBrowser(trimmed, id);
    },
    [stop, speakWithBrowser],
  );

  return { speak, stop, isSpeaking, speakingId };
}
