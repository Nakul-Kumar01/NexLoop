import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Chat-only component (left-side chat area) using your theme: #061021, #071428, #08122a and yellow-500
// Tailwind + daisyUI + Framer Motion for animations and micro-interactions.

export default function ChatAi({ problem }) {
  // console.log(problem);
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: "Hi, How are you" }] },
    { role: 'user', parts: [{ text: "I am Good" }] }
  ]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data) => {
    if (!data.message || data.message.trim().length < 2) return;
    // console.log(data);
    // console.log(messages);
    // setMessages(prev => [...prev, { role: 'user', parts: [{ text: data.message }] }]);
    // console.log(messages);
    const newMessage = { role: 'user', parts: [{ text: data.message }] };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);


    reset();
    setIsTyping(true);

    try {


      const response = await axiosClient.post("/ai/chat", {

        messages: updatedMessages,
        title: problem?.title,
        description: problem?.discription,
        testCases: problem?.visibleTestCases,
        startCode: problem?.startCode
      });


      await new Promise(r => setTimeout(r, 400));

      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: response.data?.message ?? "(no response)" }]
      }]);

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: "Error from AI Chatbot" }]
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const bubbleVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 600, damping: 30 } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.12 } }
  };

  return (
    <div className="min-h-[500px] max-h-[80vh] w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(180deg, rgba(6,16,33,0.85), rgba(7,20,40,0.75))', border: '1px solid rgba(255,255,255,0.03)' }}>

      {/* header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500 text-[#061021] font-bold shadow-lg transform-gpu animate-[pulse_2.2s_ease-in-out_infinite]">AI</div>
          <div>
            <div className="text-sm font-semibold text-white">CodeBuddy</div>
            <div className="text-xs text-white/60">Problem-solving assistant</div>
          </div>
        </div>
        <div className="text-xs text-white/50">Online</div>
      </div>

      {/* messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={idx}
                layout
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={bubbleVariants}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`chat ${isUser ? 'chat-end' : 'chat-start'} w-full max-w-[86%]`}>
                  <div className={`chat-bubble ${isUser ? 'bg-yellow-500 text-[#061021]' : 'bg-[rgba(255,255,255,0.04)] text-white'} shadow-[0_8px_24px_rgba(0,0,0,0.6)]`} style={{ boxShadow: isUser ? '0 10px 30px rgba(250,204,21,0.14)' : undefined }}>
                    {msg.parts[0].text}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="chat chat-start">
                <div className="chat-bubble bg-[rgba(255,255,255,0.03)] text-white">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white/80 animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 rounded-full bg-white/70 animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.14s' }} />
                    <span className="w-2 h-2 rounded-full bg-white/60 animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.28s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t border-white/5 bg-gradient-to-t from-transparent to-[rgba(255,255,255,0.01)]">
        <div className="flex items-center gap-3">
          <input
            placeholder="Ask me anything"
            className="input input-bordered flex-1 bg-[rgba(255,255,255,0.02)] text-white placeholder-white/50 focus:outline-none"
            {...register("message", { required: true, minLength: 2 })}
          />

          <button type="submit" className={`btn ${errors.message ? 'btn-disabled' : 'bg-yellow-500 text-[#061021] hover:scale-[1.02]'} rounded-full p-2`} disabled={!!errors.message}>
            <Send size={18} />
          </button>
        </div>

        <div className="mt-2 text-xs text-white/40">Tip: ask for code snippets, testcases or explain errors — I'm optimized for competitive coding help.</div>
      </form>

    </div>
  );
}
