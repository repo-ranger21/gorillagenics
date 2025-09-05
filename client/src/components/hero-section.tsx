import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import gorillaImage from "@assets/Untitled_1757073459800.png";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen gradient-jungle flex items-center justify-center overflow-hidden">
      {/* Background jungle silhouette */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/10" />
      </div>
      
      <div className="relative z-10 text-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          {/* OVER/UNDER Ticker */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.1 }}
            className="flex items-center justify-center gap-8 mb-8"
          >
            <div className="bg-destructive text-white px-6 py-3 rounded-full font-bold text-xl transform -rotate-12">
              OVER
            </div>
            <div className="bg-accent text-white px-6 py-3 rounded-full font-bold text-xl transform rotate-12">
              UNDER
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-4"
          >
            <span className="block text-gradient">GUERRILLAGENICS</span>
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-3xl md:text-5xl font-bold text-foreground mb-6"
          >
            Bet Smarter. Go Primal.
          </motion.h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            className="bg-primary text-primary-foreground px-8 py-4 text-lg font-bold hover:bg-primary/90 transition-all transform hover:scale-105 animate-pulse-glow"
            data-testid="button-enter-jungle-hero"
          >
            🦍 Enter the Jungle
          </Button>
          <Button 
            variant="secondary"
            className="bg-secondary text-secondary-foreground px-8 py-4 text-lg font-bold hover:bg-secondary/80 transition-all"
            data-testid="button-how-it-works"
          >
            📊 How It Works
          </Button>
        </motion.div>
      </div>

      {/* Gorilla mascot image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-10 right-10 hidden lg:block"
      >
        <motion.div 
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="hover:animate-gorilla-shake cursor-pointer"
        >
          <img 
            src={gorillaImage} 
            alt="GuerillaGenics Mascot" 
            className="w-24 h-24 object-contain"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
