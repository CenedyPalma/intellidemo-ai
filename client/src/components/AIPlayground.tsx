import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

interface ChatMessage {
  name: string;
  message: string;
  dateTime: string;
  isAi?: boolean;
}

const socket: Socket = io('http://localhost:4000');

export default function AIPlayground() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [clientsTotal, setClientsTotal] = useState(0);
  const [feedback, setFeedback] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('clients-total', (data: number) => {
      setClientsTotal(data);
    });

    socket.on('chat-message', (data: ChatMessage) => {
      setMessages((prev) => [...prev, { ...data, isAi: data.name.includes('AI') }]);
      setFeedback('');
    });

    socket.on('feedback', (data: { feedback: string }) => {
      setFeedback(data.feedback);
    });

    return () => {
      socket.off('clients-total');
      socket.off('chat-message');
      socket.off('feedback');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, feedback]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const data = {
      name: 'DemoClient', // Auto-assigned for demo
      message: input,
      dateTime: new Date().toISOString(),
    };

    socket.emit('message', data);
    setMessages((prev) => [...prev, { ...data, isAi: false }]);
    setInput('');
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    socket.emit('feedback', { feedback: `DemoClient is typing...` });
  };

  return (
    <section id="ai-playground" className="min-h-screen flex flex-col items-center justify-center py-20 relative bg-gradient-to-b from-[#050510] to-[#0f1020]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        className="glass-card w-full max-w-4xl h-[700px] rounded-3xl flex flex-col overflow-hidden relative z-10 mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              Live Intelligence Engine
            </h2>
          </div>
          <div className="text-sm text-gray-400">
            {clientsTotal} Active Sessions
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <FaRobot className="text-6xl text-white/10" />
              <p>Ask anything. Experience output generation in real-time.</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.isAi ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex max-w-[80%] gap-3 ${msg.isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.isAi ? 'bg-gradient-to-br from-purple-500 to-blue-600' : 'bg-gray-700'}`}>
                    {msg.isAi ? <FaRobot className="text-white text-sm" /> : <FaUser className="text-gray-300 text-sm" />}
                  </div>

                  {/* Bubble */}
                  <div className={`p-4 rounded-2xl backdrop-blur-md border ${
                    msg.isAi 
                      ? 'bg-white/10 border-white/10 text-gray-100 rounded-tl-none' 
                      : 'bg-blue-600/20 border-blue-500/30 text-white rounded-tr-none shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  }`}>
                    <p className="leading-relaxed">{msg.message}</p>
                    <span className="text-xs text-white/30 mt-2 block">
                      {new Date(msg.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {feedback && (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="flex items-center gap-2 text-sm text-cyan-400 pl-14"
             >
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
               {feedback}
             </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/5 border-t border-white/10">
          <form onSubmit={sendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInput}
              placeholder="Type a message to generate output..."
              className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
