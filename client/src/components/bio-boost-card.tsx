import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BioMetric } from "@shared/schema";
import { Flame, Moon, TrendingUp, Droplets, Heart } from "lucide-react";

const iconMap = {
  fire: Flame,
  moon: Moon,
  trending: TrendingUp,
  droplets: Droplets,
  heart: Heart,
};

const colorMap = {
  testosterone: "text-testosterone",
  sleep: "text-sleep", 
  cortisol: "text-cortisol",
  hydration: "text-hydration",
  recovery: "text-recovery",
};

const progressColorMap = {
  testosterone: "bg-testosterone",
  sleep: "bg-sleep",
  cortisol: "bg-cortisol", 
  hydration: "bg-hydration",
  recovery: "bg-recovery",
};

interface BioBoostCardProps {
  metric: BioMetric;
}

export default function BioBoostCard({ metric }: BioBoostCardProps) {
  const IconComponent = iconMap[metric.icon as keyof typeof iconMap] || Flame;
  const textColor = colorMap[metric.id as keyof typeof colorMap] || "text-primary";
  const progressColor = progressColorMap[metric.id as keyof typeof progressColorMap] || "bg-primary";

  return (
    <Card className="bg-card border border-border hover:border-primary/50 transition-all group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-card-foreground">{metric.name}</h3>
          <IconComponent className={`${textColor} text-2xl w-6 h-6`} />
        </div>
        
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          {metric.description}
        </p>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">BioBoost Score</span>
            <span className={`text-2xl font-bold ${textColor}`} data-testid={`score-${metric.id}`}>
              {metric.score}/100
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${metric.score}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-3 rounded-full ${progressColor}`}
            />
          </div>
        </div>

        <Button 
          variant="ghost" 
          className="text-primary hover:text-primary/80 transition-colors font-medium p-0 h-auto mb-4"
          data-testid={`button-historical-impact-${metric.id}`}
        >
          Show Historical Impact →
        </Button>

        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          whileInView={{ opacity: 1, height: "auto" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="p-4 bg-secondary/50 rounded-lg"
        >
          <p className="text-sm text-secondary-foreground">
            {metric.historicalImpact}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
