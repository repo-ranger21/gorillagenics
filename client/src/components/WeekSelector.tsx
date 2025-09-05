import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getCurrentNFLWeek, getWeekDisplayName } from "@/utils/weekFetcher";

export default function WeekSelector({ 
  currentWeek, 
  onWeekChange, 
  maxWeek = 18, 
  className = "" 
}) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  
  useEffect(() => {
    setSelectedWeek(currentWeek);
  }, [currentWeek]);

  const handleWeekChange = (newWeek) => {
    if (newWeek >= 1 && newWeek <= maxWeek) {
      setSelectedWeek(newWeek);
      onWeekChange(newWeek);
    }
  };

  const handlePrevious = () => {
    if (selectedWeek > 1) {
      handleWeekChange(selectedWeek - 1);
    }
  };

  const handleNext = () => {
    if (selectedWeek < maxWeek) {
      handleWeekChange(selectedWeek + 1);
    }
  };

  const isFirstWeek = selectedWeek === 1;
  const isLastWeek = selectedWeek === maxWeek;
  const isCurrentWeek = selectedWeek === getCurrentNFLWeek();

  // Generate week options
  const weekOptions = Array.from({ length: maxWeek }, (_, i) => i + 1);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Arrow Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={isFirstWeek}
          className="h-9 w-9 p-0"
          data-testid="week-previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Week Display with Dropdown */}
        <Select
          value={selectedWeek.toString()}
          onValueChange={(value) => handleWeekChange(parseInt(value))}
        >
          <SelectTrigger className="w-40 h-9" data-testid="week-selector-trigger">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <SelectValue>
                {getWeekDisplayName(selectedWeek)}
                {isCurrentWeek && (
                  <span className="text-xs ml-2 px-2 py-0.5 bg-primary/20 text-primary rounded">
                    CURRENT
                  </span>
                )}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {weekOptions.map((week) => (
              <SelectItem 
                key={week} 
                value={week.toString()}
                data-testid={`week-option-${week}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{getWeekDisplayName(week)}</span>
                  {week === getCurrentNFLWeek() && (
                    <span className="text-xs ml-4 px-2 py-0.5 bg-primary/20 text-primary rounded">
                      CURRENT
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={isLastWeek}
          className="h-9 w-9 p-0"
          data-testid="week-next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Info */}
      <motion.div
        key={selectedWeek}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        {isCurrentWeek ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live Week</span>
          </div>
        ) : selectedWeek > getCurrentNFLWeek() ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Upcoming</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span>Completed</span>
          </div>
        )}
      </motion.div>

      {/* Quick Jump to Current Week */}
      {!isCurrentWeek && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleWeekChange(getCurrentNFLWeek())}
          className="text-xs h-9 px-3"
          data-testid="jump-to-current"
        >
          Jump to Current
        </Button>
      )}
    </div>
  );
}