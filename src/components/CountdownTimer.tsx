import { useState, useEffect } from "react";
import { Lock, Clock } from "lucide-react";

interface CountdownTimerProps {
  language: "cs" | "en";
  targetDate: Date;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = ({ language, targetDate, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const content = {
    cs: {
      title: "Chatovací místnost se otevře",
      date: "22. ledna 2026 v 18:00",
      days: "Dní",
      hours: "Hodin",
      minutes: "Minut",
      seconds: "Sekund",
      locked: "Chatovací místnost je zatím uzamčena",
    },
    en: {
      title: "Chat room opens",
      date: "January 22, 2026 at 6:00 PM",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      locked: "Chat room is currently locked",
    },
  };

  const t = content[language];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (isComplete) {
    return null;
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center shadow-lg">
          <span className="text-xl sm:text-3xl font-bold text-gray-900 font-['Raleway',sans-serif]">
            {value.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
      <span className="mt-2 text-[10px] sm:text-sm text-gray-600 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-200 shadow-xl relative">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
        <div className="p-2 bg-amber-100 rounded-full">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
        </div>
        <span className="text-gray-500 text-xs sm:text-sm">{t.locked}</span>
      </div>

      {/* Title */}
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 font-['Raleway',sans-serif] mb-2">
          {t.title}
        </h3>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-base">{t.date}</span>
        </div>
      </div>

      {/* Countdown blocks */}
      <div className="flex justify-center gap-1 sm:gap-4">
        <TimeBlock value={timeLeft.days} label={t.days} />
        <div className="flex items-center text-gray-300 text-xl sm:text-2xl font-light self-start mt-4 sm:mt-5">:</div>
        <TimeBlock value={timeLeft.hours} label={t.hours} />
        <div className="flex items-center text-gray-300 text-xl sm:text-2xl font-light self-start mt-4 sm:mt-5">:</div>
        <TimeBlock value={timeLeft.minutes} label={t.minutes} />
        <div className="flex items-center text-gray-300 text-xl sm:text-2xl font-light self-start mt-4 sm:mt-5">:</div>
        <TimeBlock value={timeLeft.seconds} label={t.seconds} />
      </div>
    </div>
  );
};
