import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../context/VoiceContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Sun,
  Layers,
  CreditCard,
  History
} from 'lucide-react';

export default function VoiceAssistantModal() {
  const {
    isListening,
    isSpeaking,
    transcript,
    messages,
    voiceEnabled,
    isAssistantOpen,
    setIsAssistantOpen,
    setVoiceEnabled,
    startListening,
    stopListening,
    handleVoiceCommand,
  } = useVoice();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAssistantOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const cmd = inputVal;
    setInputVal('');
    handleVoiceCommand(cmd);
  };

  const quickPrompts = [
    { label: 'Check Balance', icon: CreditCard, query: 'What is my balance?' },
    { label: 'Add ₹500', icon: Sparkles, query: 'Add 500 rupees' },
    { label: 'Send ₹300 to Arun', icon: ArrowRight, query: 'Transfer 300 to Arun' },
    { label: 'Pay Electricity Bill', icon: Sparkles, query: 'Pay electricity bill' },
    { label: 'Convert to Light Mode', icon: Sun, query: 'Switch to light mode' },
    { label: 'Show DB Schema', icon: Layers, query: 'Show database schema' },
    { label: 'History', icon: History, query: 'Show transaction history' },
  ];

  return (
    <>
      {/* Floating Voice Assistant Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2">
        {!isAssistantOpen && (
          <button
            onClick={() => {
              setIsAssistantOpen(true);
              startListening();
            }}
            className="group relative flex items-center space-x-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
            title="Open Voice Assistant"
          >
            <div className="relative">
              <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce text-yellow-200' : 'text-white'}`} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></span>
            </div>
            <span className="font-semibold text-sm hidden sm:inline">WiseVoice AI</span>
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">Voice</span>
          </button>
        )}
      </div>

      {/* Voice Assistant Drawer / Modal */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-black/40 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="w-full sm:w-[460px] h-[85vh] sm:h-[620px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-teal-800/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-teal-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-base">WiseVoice Assistant</h3>
                    <span className="text-[10px] bg-teal-500/30 text-teal-200 px-1.5 py-0.5 rounded-full border border-teal-400/30 font-medium">
                      AI Powered
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {isListening ? 'Listening to your speech...' : isSpeaking ? 'Speaking...' : 'Ready for your voice or commands'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-1.5 rounded-lg border text-xs transition ${
                    voiceEnabled
                      ? 'bg-teal-500/20 border-teal-400/40 text-teal-200'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title={voiceEnabled ? 'Mute Speech' : 'Enable Speech'}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    stopListening();
                    setIsAssistantOpen(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                  title="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Audio Wave Visualizer when Listening/Speaking */}
            {(isListening || isSpeaking) && (
              <div className="bg-teal-50 dark:bg-teal-950/40 border-b border-teal-200 dark:border-teal-900/50 py-2 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-300">
                    {isListening ? 'Listening...' : 'Assistant speaking'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(9)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse"
                      style={{
                        height: `${8 + Math.sin(i * 1.5) * 12 + Math.random() * 8}px`,
                        animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                      }}
                    ></span>
                  ))}
                </div>
              </div>
            )}

            {/* Live speech interim banner */}
            {isListening && transcript && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 flex items-center space-x-2">
                <Mic className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                <span className="font-medium italic">"{transcript}"</span>
              </div>
            )}

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 dark:bg-slate-900/60">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start space-x-2.5 ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span
                      className={`text-[10px] block mt-1 ${
                        m.sender === 'user' ? 'text-teal-100 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider px-1">
                Voice suggestions:
              </p>
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {quickPrompts.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleVoiceCommand(p.query)}
                      className="flex-shrink-0 flex items-center space-x-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-1 transition"
                    >
                      <Icon className="w-3 h-3 text-teal-500" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form + Mic Button */}
            <form
              onSubmit={handleSubmit}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2"
            >
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  isListening
                    ? 'bg-rose-500 text-white ring-4 ring-rose-200 dark:ring-rose-900/50 animate-pulse'
                    : 'bg-teal-500 hover:bg-teal-600 text-white shadow-md'
                }`}
                title={isListening ? 'Stop Listening' : 'Speak Now'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={isListening ? 'Speak your command...' : 'Type or ask WiseVoice anything...'}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />

              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="p-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 dark:hover:bg-teal-700 disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
