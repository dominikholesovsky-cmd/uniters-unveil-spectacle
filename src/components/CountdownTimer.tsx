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
      title: "Portál se otevře",
      date: "22. ledna 2026 v 18:00",
      days: "Dní",
      hours: "Hodin",
      minutes: "Minut",
      seconds: "Sekund",
      locked: "Portál je zatím uzamčen",
    },
    en: {
      title: "Portal opens",
      date: "January 22, 2026 at 6:00 PM",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      locked: "Portal is currently locked",
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
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center shadow-lg">
          <span className="text-2xl sm:text-3xl font-bold text-white font-['Raleway',sans-serif]">
            {value.toString().padStart(2, "0")}
          </span>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-xl blur-sm -z-10" />
      </div>
      <span className="mt-2 text-xs sm:text-sm text-white/70 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/20 rounded-full">
          <Lock className="w-5 h-5 text-amber-400" />
        </div>
        <span className="text-white/60 text-sm">{t.locked}</span>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-white font-['Raleway',sans-serif] mb-2">
          {t.title}
        </h3>
        <div className="flex items-center justify-center gap-2 text-white/80">
          <Clock className="w-4 h-4" />
          <span className="text-sm sm:text-base">{t.date}</span>
        </div>
      </div>

      {/* Countdown blocks */}
      <div className="flex justify-center gap-3 sm:gap-4">
        <TimeBlock value={timeLeft.days} label={t.days} />
        <div className="flex items-center text-white/40 text-2xl font-light self-start mt-5">:</div>
        <TimeBlock value={timeLeft.hours} label={t.hours} />
        <div className="flex items-center text-white/40 text-2xl font-light self-start mt-5">:</div>
        <TimeBlock value={timeLeft.minutes} label={t.minutes} />
        <div className="flex items-center text-white/40 text-2xl font-light self-start mt-5">:</div>
        <TimeBlock value={timeLeft.seconds} label={t.seconds} />
      </div>

      {/* Decorative glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-2xl pointer-events-none" />
    </div>
  );
};
