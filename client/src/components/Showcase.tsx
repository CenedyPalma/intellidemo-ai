import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { FaRocket, FaDatabase, FaPalette, FaNetworkWired } from 'react-icons/fa';
import * as THREE from 'three';

const FloatingShape = ({ position, color }: { position: [number, number, number]; color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
    </Float>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }: { icon: React.ComponentType<{ className?: string }>, title: string, desc: string, delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -10 }}
      viewport={{ once: true }}
      className="glass-card p-8 rounded-2xl border border-white/5 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Icon className="text-2xl text-cyan-400 group-hover:text-cyan-300" />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

export default function Showcase() {
  return (
    <section id="showcase" className="min-h-screen relative py-20 px-4 bg-[#050510] overflow-hidden">
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <FloatingShape position={[-3, 2, 0]} color="#22d3ee" />
          <FloatingShape position={[3, -2, -2]} color="#a855f7" />
          <FloatingShape position={[0, 4, -5]} color="#3b82f6" />
        </Canvas>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Architecture of Tomorrow
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built for scale, speed, and intelligence. Our stack defines the future of web applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={FaRocket}
            title="Ultra-Fast AI"
            desc="Powered by Groq's LPU™ Inference Engine for blazing fast token generation."
            delay={0.1}
          />
          <FeatureCard
            icon={FaDatabase}
            title="Smart Memory"
            desc="MongoDB powered context retention and real-time analytics aggregations."
            delay={0.2}
          />
          <FeatureCard
            icon={FaPalette}
            title="Premium UX"
            desc="Glassmorphism, 3D interactions, and 60FPS animations using React Three Fiber."
            delay={0.3}
          />
          <FeatureCard
            icon={FaNetworkWired}
            title="Scalable Core"
            desc="Node.js and Socket.IO architecture capable of handling concurrent sessions."
            delay={0.4}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-10 glass-card rounded-3xl text-center border border-white/10"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-gray-400 mb-8">
            Experience the power of intelligent applications.
          </p>
          <button 
            className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Start Project
          </button>
        </motion.div>
      </div>
    </section>
  );
}
