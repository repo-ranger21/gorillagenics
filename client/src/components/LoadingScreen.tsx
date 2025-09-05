import { motion } from "framer-motion";

export default function LoadingScreen({ message = "🦍 Peeling the data bananas..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated Gorilla */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
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

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-bold">{message}</h2>
          <p className="text-muted-foreground">Fetching the freshest NFL intel...</p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center space-x-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-primary rounded-full"
            />
          ))}
        </motion.div>

        {/* Fun Facts Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="max-w-md"
        >
          <motion.p
            key="fact1"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatDelay: 8
            }}
            className="text-sm text-muted-foreground italic"
          >
            "Did you know? Our BioBoost algorithm analyzes over 47 factors per game!"
          </motion.p>
          
          <motion.p
            key="fact2"
            animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatDelay: 8,
              delay: 4
            }}
            className="text-sm text-muted-foreground italic"
          >
            "Fun fact: Gorillas have better pattern recognition than most NFL analysts!"
          </motion.p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="h-1 bg-primary/20 rounded-full overflow-hidden max-w-xs mx-auto"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-full w-1/3 bg-primary rounded-full"
          />
        </motion.div>
      </div>
    </div>
  );
}