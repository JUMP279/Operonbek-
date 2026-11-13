import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/api';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  ChevronUp,
  RefreshCw,
  Zap,
  TrendingUp,
  BarChart3,
  Users,
  ArrowLeft
} from 'lucide-react';
import { AIOrbCanvas, AIOrbState } from './AIOrbCanvas';
import { useLanguage } from '../context/LanguageContext';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storeContext: any;
  isEmbedded?: boolean;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  storeContext,
  isEmbedded = false
}) => {
  const { t, language } = useLanguage();

  const getWelcomeText = (lang: string) => {
    if (lang === 'ru') {
      return "Здравствуйте! Я ваш AI бизнес-аналитик. Задайте любой вопрос о прибыли магазина, динамике продаж, активности клиентов или остатках товаров.";
    }
    return "Сәлеметсіз бе! Мен сіздің AI бизнес-талдаушыңызбын. Дүкен табысы, сату динамикасы, клиенттер белсенділігі немесе тауар қалдықтары туралы кез келген сұрақ қойыңыз.";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: getWelcomeText(language),
      timestamp: language === 'ru' ? 'Сейчас' : 'Қазір'
    }
  ]);

  // Update initial welcome message when language changes if only welcome is present
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'ai',
            text: getWelcomeText(language),
            timestamp: language === 'ru' ? 'Сейчас' : 'Қазір'
          }
        ];
      }
      return prev;
    });
  }, [language]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [orbState, setOrbState] = useState<AIOrbState>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(t.aiOnline);

  useEffect(() => {
    if (orbState === 'idle') {
      setStatusMessage(t.aiOnline);
    }
  }, [language, t.aiOnline, orbState]);

  const recognitionRef = useRef<any>(null);
  // Holds the live transcript. `recognition.onend` runs long after the closure
  // that created it, so reading `input` there always saw a stale (usually empty)
  // value and the dictated question was silently dropped.
  const transcriptRef = useRef<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getPromptSuggestions = () => {
    if (language === 'ru') {
      return [
        {
          icon: <BarChart3 className="w-3.5 h-3.5 text-blue-500" />,
          label: 'Итоги периода',
          query: 'Кратко подведи итоги моего бизнеса за последний месяц по реальным данным.'
        },
        {
          icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />,
          label: 'Как поднять продажи',
          query: 'Что мне сделать на этой неделе, чтобы увеличить продажи?'
        },
        {
          icon: <Users className="w-3.5 h-3.5 text-purple-500" />,
          label: 'Запросы без продаж',
          query: 'Почему часть клиентов интересуется, но не покупает, и как это исправить?'
        },
        {
          icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Идеи для Instagram',
          query: 'Предложи 3 идеи постов для Instagram под мой бизнес.'
        }
      ];
    }
    return [
      {
        icon: <BarChart3 className="w-3.5 h-3.5 text-blue-500" />,
        label: 'Кезең қорытындысы',
        query: 'Нақты деректер бойынша соңғы айдағы бизнесімнің қорытындысын қысқаша айт.'
      },
      {
        icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />,
        label: 'Сатылымды қалай өсіру',
        query: 'Осы аптада сатылымды көбейту үшін не істеуім керек?'
      },
      {
        icon: <Users className="w-3.5 h-3.5 text-purple-500" />,
        label: 'Сатылмаған сұраулар',
        query: 'Неге кейбір клиенттер қызығады, бірақ сатып алмайды және оны қалай түзетуге болады?'
      },
      {
        icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
        label: 'Instagram идеялары',
        query: 'Менің бизнесіме арналған Instagram үшін 3 пост идеясын ұсын.'
      }
    ];
  };

  const promptSuggestions = getPromptSuggestions();

  // Stop listening helper
  const stopListening = useCallback(() => {
    setIsListening(false);
    setAudioLevel(0);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setOrbState('idle');
    setStatusMessage(t.aiOnline);
  }, [t.aiOnline]);

  // Text to Speech
  const speakText = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = language === 'ru' ? 'ru-RU' : 'kk-KZ';
      
      utterance.onstart = () => {
        setOrbState('speaking');
        setStatusMessage(language === 'ru' ? 'AI озвучивает ответ...' : 'AI жауап беруде...');
      };
      
      utterance.onend = () => {
        setOrbState('idle');
        setStatusMessage(t.aiOnline);
      };
      
      utterance.onerror = () => {
        setOrbState('idle');
        setStatusMessage(t.aiOnline);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
      setOrbState('idle');
    }
  }, [isMuted, language, t.aiOnline]);

  // Handle send function
  const handleSend = useCallback(async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (isListening) {
      stopListening();
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setOrbState('thinking');
    setStatusMessage(t.aiTyping);

    try {
      if (!storeContext?.businessId) throw new Error('no-business');
      // Oxirgi 10 ta xabar — AI oldingi savolga ishorani tushunishi uchun
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-10)
        .map((m) => ({ role: (m.sender === 'user' ? 'user' : 'ai') as 'user' | 'ai', text: m.text }));
      const data = await api.ask(storeContext.businessId, query, history);
      const aiReply = data.answer;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiReply);
    } catch (e) {
      console.error(e);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: language === 'ru'
          ? 'Не удалось получить ответ от Operon AI. Проверьте подключение и попробуйте ещё раз.'
          : 'Operon AI жауап бере алмады. Байланысты тексеріп, қайталап көріңіз.',
        timestamp: language === 'ru' ? 'Сейчас' : 'Қазір'
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text);
    } finally {
      setLoading(false);
    }
  }, [input, isListening, loading, speakText, stopListening, storeContext, language, t.aiTyping, messages]);

  // Microphone Voice Input handling
  const startListening = useCallback(async () => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      transcriptRef.current = '';
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(avg / 128, 1);
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Speech Recognition if supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'ru' ? 'ru-RU' : 'kk-KZ';

        recognition.onstart = () => {
          setIsListening(true);
          setOrbState('listening');
          setStatusMessage(language === 'ru' ? 'Слушаю вас...' : 'Сізді тыңдап тұрмын...');
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          transcriptRef.current = transcript;
          setInput(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          transcriptRef.current = '';
          stopListening();
        };

        recognition.onend = () => {
          stopListening();
          const finalTranscript = transcriptRef.current.trim();
          transcriptRef.current = '';
          if (finalTranscript) {
            handleSend(finalTranscript);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        setIsListening(true);
        setOrbState('listening');
        setStatusMessage(language === 'ru' ? 'Слушаю...' : 'Тыңдап тұрмын...');
      }
    } catch (err) {
      console.warn('Mic access error:', err);
      setIsListening(false);
      setOrbState('idle');
      setStatusMessage(language === 'ru' ? 'Доступ к микрофону отклонен' : 'Микрофонға рұқсат берілмеді');
    }
  }, [handleSend, language, stopListening]);

  const toggleMic = useCallback(() => {
    if (isListening) {
      // When SpeechRecognition is driving, `onend` performs the send. Sending
      // here as well produced the same question twice.
      const hadRecognition = !!recognitionRef.current;
      stopListening();
      if (!hadRecognition && input.trim()) {
        handleSend(input);
      }
    } else {
      startListening();
    }
  }, [handleSend, input, isListening, startListening, stopListening]);

  // Auto scroll messages
  useEffect(() => {
    if (showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showHistory]);

  // Clean up audio on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, stopListening]);

  if (!isOpen) return null;

  const latestAiMessage = [...messages].reverse().find((m) => m.sender === 'ai');

  const content = (
    <div className={`relative w-full ${isEmbedded ? 'h-full rounded-none border-none' : 'max-w-[440px] h-[720px] max-h-[96vh] rounded-[40px] shadow-[0_30px_90px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.3)] border border-white/40'} flex flex-col overflow-hidden bg-gradient-to-b from-[#CBC5E6] via-[#BEB6DE] to-[#B0A7D6]`}>
      
      {/* Soft atmospheric background lights */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-white/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 px-5 pt-4 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isEmbedded && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-800 backdrop-blur-md shadow-xs flex items-center justify-center border border-white/60 mr-1 active:scale-95 transition-transform"
              title={language === 'ru' ? 'Назад' : 'Артқа'}
            >
              <ArrowLeft className="w-4 h-4 text-slate-800" />
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md shadow-xs flex items-center justify-center text-slate-800 border border-white/60">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 tracking-tight">{t.aiCardTitle}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </div>
            <p className="text-[10px] font-medium text-slate-700/80">{t.aiCardSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio Voice Toggle */}
          <button
            onClick={() => {
              if (!isMuted && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setIsMuted(!isMuted);
            }}
            className="w-8 h-8 rounded-full bg-white/60 hover:bg-white text-slate-700 backdrop-blur-md flex items-center justify-center transition-all shadow-xs border border-white/60"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Chat Log Drawer Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-xs border border-white/60 ${
              showHistory ? 'bg-indigo-600 text-white' : 'bg-white/60 hover:bg-white text-slate-700'
            }`}
            title="Chat History"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Close Button (if not embedded, or as close action) */}
          {!isEmbedded && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/60 hover:bg-white text-slate-700 backdrop-blur-md flex items-center justify-center transition-all shadow-xs border border-white/60"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Center Main Stage: EXACT 3D AI Glassmorphic Orb from Attached Design */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        {!showHistory ? (
          <div className="flex flex-col items-center justify-center w-full my-auto animate-in fade-in zoom-in-95 duration-300">
            {/* 3D WebGL Three.js Orb Canvas */}
            <div className="relative flex items-center justify-center">
              <AIOrbCanvas
                state={orbState}
                audioLevel={audioLevel}
                size={isEmbedded ? 240 : 260}
                className="cursor-pointer"
              />

              {/* Status indicator pill floating below the orb */}
              <div className="absolute -bottom-2 px-3.5 py-1 rounded-full bg-white/75 backdrop-blur-md border border-white/80 shadow-xs flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    orbState === 'listening'
                      ? 'bg-rose-500 animate-ping'
                      : orbState === 'thinking'
                      ? 'bg-amber-500 animate-spin'
                      : orbState === 'speaking'
                      ? 'bg-indigo-500 animate-pulse'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="text-[11px] font-semibold text-slate-800">
                  {statusMessage}
                </span>
              </div>
            </div>

            {/* Latest AI Speech/Response Bubble */}
            {latestAiMessage && (
              <div className="mt-7 w-full max-w-[370px] bg-white/80 backdrop-blur-lg rounded-2xl p-3.5 shadow-md border border-white/90 text-center transition-all duration-300">
                <p className="text-[12px] font-medium text-slate-800 leading-relaxed line-clamp-3">
                  "{latestAiMessage.text}"
                </p>
              </div>
            )}

            {/* Quick Action Suggestion Chips */}
            <div className="mt-3.5 w-full max-w-[380px] grid grid-cols-2 gap-2">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.query)}
                  className="p-2 bg-white/60 hover:bg-white/90 text-left rounded-xl backdrop-blur-sm border border-white/70 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 group active:scale-98"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/80 flex items-center justify-center shrink-0 shadow-2xs">
                    {item.icon}
                  </div>
                  <span className="text-[10.5px] font-semibold text-slate-800 truncate">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Full Chat History View */
          <div className="w-full h-full flex flex-col bg-white/85 backdrop-blur-xl rounded-3xl p-4 shadow-lg border border-white/80 my-2 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                {language === 'ru' ? 'История диалога' : 'Сұхбат тарихы'}
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                {language === 'ru' ? 'Вернуться к 3D сфере' : '3D сфераға оралу'} <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 ${
                      m.sender === 'user'
                        ? 'bg-slate-900 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {m.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>

                  <div
                    className={`p-2.5 rounded-2xl max-w-[84%] text-[11.5px] leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-100 shadow-xs rounded-tl-xs'
                    }`}
                  >
                    {m.text}
                    <div
                      className={`text-[9px] mt-1 ${
                        m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>{t.aiTyping}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Interactive Voice & Text Input Dock */}
      <div className="relative z-10 px-4 pb-4 pt-1.5">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg border border-white/90 flex items-center gap-1.5">
          {/* Live Mic Button with Ripple when Active */}
          <button
            onClick={toggleMic}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 relative ${
              isListening
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse scale-105'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
            }`}
            title={isListening ? (language === 'ru' ? "Остановить запись" : "Жазуды тоқтату") : (language === 'ru' ? "Сказать AI" : "AI-ға айту")}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? (language === 'ru' ? "Слушаю..." : "Тыңдап тұрмын...") : t.aiInputPlaceholder}
            className="flex-1 text-xs bg-transparent px-2 py-2 outline-none text-slate-800 placeholder:text-slate-400"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center disabled:opacity-40 transition-all shadow-xs shrink-0"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {content}
    </div>
  );
};
