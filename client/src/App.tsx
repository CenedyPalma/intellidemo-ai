import Hero from './components/Hero';
import AIPlayground from './components/AIPlayground';
import Analytics from './components/Analytics';
import Showcase from './components/Showcase';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';

function App() {
  // Smooth scroll disabled for performance

  return (
    <>
      <CustomCursor />
      <div className="bg-[#050510] min-h-screen text-slate-200 selection:bg-cyan-500/30 cursor-none relative z-10">
        <Hero />
        
        <AIPlayground />
        <Analytics />
        <Showcase />
        <Footer />
      </div>
    </>
  );
}

export default App;
