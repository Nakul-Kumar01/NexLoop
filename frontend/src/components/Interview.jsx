import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../utils/axiosClient";


const bubbleVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 600, damping: 30 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } }
};

export default function Interview() {
  const { register, handleSubmit, reset, setValue, watch } = useForm({ defaultValues: { message: "" } });

  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: "Hi — I'm your AI interviewer. When you're ready, press the mic and answer verbally or type your response." }] }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [autoSend, setAutoSend] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (transcription !== "") setValue('message', transcription);
  }, [transcription, setValue]);

  useEffect(() => {
    return () => stopListening();
  }, []);

  const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition || null);

  const startListening = () => {
    setError(null);
    if (!SpeechRecognition) {
      setError('SpeechRecognition not supported. Use Chrome/Edge on desktop or Chrome on Android.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setTranscription('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) final += result[0].transcript;
          else interim += result[0].transcript;
        }
        setTranscription(final + interim);
      };

      recognition.onerror = (ev) => {
        console.error('Recognition error', ev);
        setError('Recognition error: ' + (ev.error || 'unknown'));
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
        if (autoSend && (transcription && transcription.trim().length > 0)) {
          setTimeout(() => {
            handleSubmit(onSubmit)();
          }, 150);
        }
      };

      recognition.start();
    } catch (err) {
      console.error('startListening error', err);
      setError('Failed to start speech recognition');
      setListening(false);
    }
  };

  const stopListening = () => {
    const r = recognitionRef.current;
    if (r && typeof r.stop === 'function') {
      try { r.stop(); } catch (e) { }
    }
    recognitionRef.current = null;
    setListening(false);
  };

  const speak = (text) => {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 1;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch (err) {
      console.warn('TTS failed', err);
    }
  };

  const onSubmit = async (data) => {
    if (!data.message || data.message.trim().length < 1) return;

    const trimmed = data.message.trim();
    const userMessage = { role: 'user', parts: [{ text: trimmed }] };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    reset({ message: '' });
    setTranscription('');
    setIsTyping(true);

    try {
      const response = await axiosClient.post('/interview', { messages: updatedMessages });
      const aiText = response?.data?.message ?? response?.data?.reply ?? '(no response)';

      const modelMessage = { role: 'model', parts: [{ text: aiText }] };
      setMessages(prev => [...prev, modelMessage]);

      speak(aiText);

    } catch (err) {
      console.error('API Error:', err);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Sorry — the interview service failed. Try again.' }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleListening = () => {
    if (listening) stopListening();
    else startListening();
  };

  const handleStartInterview = () => {
    setMessages([{ role: 'model', parts: [{ text: `Welcome! I'll ask you technical questions. Question: Describe the time complexity of quicksort.` }] }]);
    reset({ message: '' });
    setTranscription('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br pt-20 sm:pt-15 from-[#061021] via-[#071428] to-[#08122a] text-gray-100">
      <div className="w-full max-w-5xl ">
        <div className="col-span-8">
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] rounded-2xl shadow-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-400/20 flex items-center justify-center ring-1 ring-yellow-400/20">
                  <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4S8 5.79 8 8s1.79 4 4 4zM6 20v-1c0-2.21 3.58-4 6-4s6 1.79 6 4v1H6z"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">AI Interview — Live</h3>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={handleStartInterview} className="btn btn-sm btn-ghost text-yellow-400 hover:bg-yellow-500/10">Restart</button>
              </div>
            </div>

            <main className="h-[60vh] overflow-auto p-4 rounded-lg border border-[rgba(255,255,255,0.03)] bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent">
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((m, idx) => (
                    <motion.div key={idx} variants={bubbleVariants} initial="hidden" animate="visible" exit="exit" className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${m.role === 'user' ? 'bg-gradient-to-r from-yellow-500/40 to-yellow-400/20 text-black' : 'bg-[rgba(255,255,255,0.03)] text-gray-200'} p-3 rounded-2xl w-full sm:max-w-[78%] shadow-sm border border-[rgba(255,255,255,0.02)]`}>
                        {m.parts.map((p, i) => (
                          <p key={i} className="whitespace-pre-wrap leading-relaxed">{p.text}</p>
                        ))}
                        <div className="text-xs text-gray-400 mt-2">{m.role === 'user' ? 'You' : 'Interviewer'}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[rgba(255,255,255,0.02)] p-2 rounded-lg text-sm text-gray-400">AI is thinking...</div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </main>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex items-center gap-3">
              <textarea {...register('message')} placeholder={SpeechRecognition ? 'Press the mic and speak, or type your answer...' : 'Type your answer...'} rows={2} className="flex-1 resize-none p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)] focus:outline-none" />

              <div className="flex flex-col items-center gap-3">
                <button type="button" onClick={handleToggleListening} aria-pressed={listening} className={`relative p-3 rounded-full shadow-lg transition-transform ${listening ? 'scale-105 ring-4 ring-yellow-400/20' : ''}`} title="Start / Stop voice capture">
                  <div className={`absolute inset-0 rounded-full ${listening ? 'animate-pulse bg-yellow-400/10' : ''}`}></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${listening ? 'text-yellow-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v11m0 0a3 3 0 003-3V5a3 3 0 10-6 0v4a3 3 0 003 3zM19 11v2a7 7 0 01-14 0v-2" />
                  </svg>
                </button>

                <button type="submit" className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-semibold shadow hover:brightness-105">Send</button>
              </div>
            </form>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <div>{listening ? 'Listening...' : 'Click the mic to speak'}</div>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="checkbox checkbox-sm" checked={autoSend} onChange={(e) => setAutoSend(e.target.checked)} /> Auto-send
                </label>
                {error && <div className="text-red-400">{error}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
