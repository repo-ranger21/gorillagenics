import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0B3D2E] via-[#0F4A36] to-[#134A3A] flex items-center justify-center z-50">
      <div className="text-center space-y-8">
        {/* Bouncing Gorilla */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-8xl"
        >
          🦍
        </motion.div>
        
        {/* Loading Text */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-yellow-400"
          >
            GUERILLAGENICS
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xl text-primary font-semibold"
          >
            🍌 Peeling the data bananas...
          </motion.p>
          
          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-yellow-400 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Pulsing Background Ring */}
        <motion.div
          className="absolute inset-0 border-4 border-primary/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: "300px",
            height: "300px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
          }}
        />
      </div>
    </div>
  );
}