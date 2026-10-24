import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

const VoiceContext = createContext();

export function VoiceProvider({ children }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [prefilledAction, setPrefilledAction] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hello! I am WiseVoice, your intelligent wallet assistant. You can speak to me or type commands like "What is my balance?", "Add 500 rupees", "Send 300 to Arun", or "Switch to light mode".',
      time: 'Just now',
    },
  ]);

  const recognitionRef = useRef(null);
  const { wallet, user, refreshWallet } = useAuth();
  const { theme, setExplicitTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);

        if (event.results[current].isFinal) {
          handleVoiceCommand(text);
        }
      };

      recognition.onerror = (event) => {
        console.warn('[SpeechRecognition Error]', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [wallet, user, theme]);

  // Text-to-Speech function
  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Siri'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      addAssistantMessage("Your browser does not support Speech Recognition. You can type commands below!");
      return;
    }
    setTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Recognition already started or error:', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const addAssistantMessage = (text, actionData = null) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender: 'assistant',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: actionData,
      },
    ]);
    speakText(text);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender: 'user',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Command Processing Logic
  const handleVoiceCommand = (rawText) => {
    const cmd = rawText.toLowerCase().trim();
    addUserMessage(rawText);

    // 1. Balance queries
    if (cmd.includes('balance') || cmd.includes('how much money') || cmd.includes('how much do i have')) {
      const bal = wallet?.balance ? `₹${parseFloat(wallet.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹5,280.00';
      const reply = `Your available demo wallet balance is ${bal}.`;
      addAssistantMessage(reply);
      navigate('/dashboard/wallet');
      return;
    }

    // 2. Add demo money (e.g. "Add 500 rupees", "Deposit 1000")
    if (cmd.includes('add') || cmd.includes('deposit') || cmd.includes('top up') || cmd.includes('topup')) {
      const match = cmd.match(/\d+/);
      const amount = match ? parseInt(match[0], 10) : 500;
      setPrefilledAction({ type: 'ADD_MONEY', amount });
      addAssistantMessage(`Navigating to Add Money with ₹${amount} prefilled. Click to confirm your demo deposit.`, { type: 'ADD_MONEY', amount });
      navigate('/dashboard/add-money');
      return;
    }

    // 3. Transfer money (e.g. "Transfer 300 to Arun", "Send 500 to Priya")
    if (cmd.includes('transfer') || cmd.includes('send money') || cmd.includes('pay to')) {
      const matchAmount = cmd.match(/\d+/);
      const amount = matchAmount ? parseInt(matchAmount[0], 10) : 250;
      let recipient = 'arun@email.com';
      if (cmd.includes('priya')) recipient = 'priya@email.com';
      if (cmd.includes('arun')) recipient = 'arun@email.com';

      setPrefilledAction({ type: 'TRANSFER', amount, recipient });
      addAssistantMessage(`Prepared transfer of ₹${amount} to ${recipient}. Please review and tap Continue.`, { type: 'TRANSFER', amount, recipient });
      navigate('/dashboard/transfer');
      return;
    }

    // 4. Pay bills
    if (cmd.includes('bill') || cmd.includes('electricity') || cmd.includes('water') || cmd.includes('broadband')) {
      let category = 'Electricity';
      if (cmd.includes('water')) category = 'Water';
      if (cmd.includes('internet') || cmd.includes('broadband')) category = 'Internet';
      if (cmd.includes('gas')) category = 'Piped Gas';

      setPrefilledAction({ type: 'BILL', category });
      addAssistantMessage(`Opening Pay Bills for ${category}. Choose provider and confirm details.`, { type: 'BILL', category });
      navigate('/dashboard/bills');
      return;
    }

    // 5. Transaction History
    if (cmd.includes('transaction') || cmd.includes('history') || cmd.includes('statement') || cmd.includes('recent')) {
      addAssistantMessage('Opening your detailed transaction ledger and search filters.');
      navigate('/dashboard/transactions');
      return;
    }

    // 6. Theme Switching: "Light Mode", "Dark Mode", "Toggle Theme"
    if (cmd.includes('light mode') || cmd.includes('convert to light') || cmd.includes('turn on light')) {
      setExplicitTheme('light');
      addAssistantMessage('Switched to clean Light Mode as requested.');
      return;
    }

    if (cmd.includes('dark mode') || cmd.includes('turn on dark')) {
      setExplicitTheme('dark');
      addAssistantMessage('Switched to sleek Dark Mode.');
      return;
    }

    if (cmd.includes('toggle mode') || cmd.includes('toggle theme')) {
      toggleTheme();
      addAssistantMessage(`Toggled theme to ${theme === 'dark' ? 'Light' : 'Dark'} Mode.`);
      return;
    }

    // 7. Database schema / ER diagram
    if (cmd.includes('schema') || cmd.includes('er diagram') || cmd.includes('database') || cmd.includes('sql') || cmd.includes('dbms')) {
      addAssistantMessage('Opening the interactive DBMS Database Architecture, ER Diagram, and ACID Relational Explorer.');
      navigate('/database-schema');
      return;
    }

    // 8. Admin dashboard
    if (cmd.includes('admin') || cmd.includes('audit log') || cmd.includes('management')) {
      addAssistantMessage('Opening the Admin Dashboard with system metrics and audit logs.');
      navigate('/admin');
      return;
    }

    // 9. Profile / User identity
    if (cmd.includes('who am i') || cmd.includes('my profile') || cmd.includes('account details')) {
      const name = user?.fullName || 'Mega Sree';
      const email = user?.email || 'megasree@email.com';
      addAssistantMessage(`You are logged in as ${name} (${email}). Role: ${user?.role || 'USER'}.`);
      navigate('/dashboard/profile');
      return;
    }

    // 10. Help
    addAssistantMessage(
      `I can help you navigate and manage your wallet! Try saying:
• "What is my balance?"
• "Add 500 rupees"
• "Transfer 300 to Arun"
• "Pay electricity bill"
• "Show transaction history"
• "Switch to light mode"
• "Show database schema"`
    );
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isSpeaking,
        transcript,
        messages,
        voiceEnabled,
        isAssistantOpen,
        prefilledAction,
        setPrefilledAction,
        setIsAssistantOpen,
        setVoiceEnabled,
        startListening,
        stopListening,
        handleVoiceCommand,
        speakText,
        clearMessages: () => setMessages([]),
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export const useVoice = () => useContext(VoiceContext);
