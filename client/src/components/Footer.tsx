import { FaGithub, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="py-10 bg-[#050510] border-t border-white/5 text-center relative z-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-center gap-6 mb-8 text-gray-400">
          <FaGithub className="text-xl hover:text-white transition-colors cursor-pointer" />
          <FaTwitter className="text-xl hover:text-cyan-400 transition-colors cursor-pointer" />
        </div>
        
        <p className="text-gray-500 flex items-center justify-center gap-2 mb-4">
          Designed for scale. Built for intelligence. 
        </p>
        
        <div className="text-xs text-gray-700">
          © {new Date().getFullYear()} IntelliDemo Systems. All rights reserved.
        </div>
      </div>
      
      {/* Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20" />
    </footer>
  );
}
