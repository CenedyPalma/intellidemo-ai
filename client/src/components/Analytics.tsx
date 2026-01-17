import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaBolt, FaBrain, FaUsers } from 'react-icons/fa';

interface Stats {
  interactionsToday: number;
  activeSessions: number;
  aiResponseTime: number;
  aiConfidence: number;
}

export default function Analytics() {
  const [stats, setStats] = useState<Stats>({
    interactionsToday: 0,
    activeSessions: 0,
    aiResponseTime: 0,
    aiConfidence: 0.99,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/analytics/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      label: 'Daily Interactions',
      value: stats.interactionsToday,
      icon: FaChartLine,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Avg Response Time',
      value: `${stats.aiResponseTime}ms`,
      icon: FaBolt,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'AI Confidence',
      value: `${(stats.aiConfidence * 100).toFixed(1)}%`,
      icon: FaBrain,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Active Sessions',
      value: stats.activeSessions,
      icon: FaUsers,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <section className="py-20 px-4 bg-[#050510] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
            Live System Metrics
          </h2>
          <p className="text-gray-500 mt-2">Powered by MongoDB Aggregations</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <card.icon className={`text-xl ${card.color}`} />
                </div>
                <div className="flex items-center gap-1 text-xs text-green-400 font-mono">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  LIVE
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">{card.label}</h3>
              <div className="text-3xl font-bold text-white mt-1">{card.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
