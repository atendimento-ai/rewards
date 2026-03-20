import { useEffect, useRef, useState } from "react";

interface OdometerValueProps {
  value: number;
  className?: string;
}

export function OdometerValue({ value, className = "" }: OdometerValueProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isRolling, setIsRolling] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current === value) return;
    
    setIsRolling(true);
    const start = prevValue.current;
    const end = value;
    const diff = end - start;
    const duration = 800;
    const steps = 20;
    const stepDuration = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step >= steps) {
        setDisplayValue(end);
        setIsRolling(false);
        clearInterval(interval);
      } else {
        // Easing: cubic out
        const t = step / steps;
        const ease = 1 - Math.pow(1 - t, 3);
        setDisplayValue(Math.round(start + diff * ease));
      }
    }, stepDuration);

    prevValue.current = value;
    return () => clearInterval(interval);
  }, [value]);

  const digits = displayValue.toLocaleString().split("");

  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      {digits.map((char, i) => (
        <span
          key={`${i}-${char}`}
          className={`inline-block ${isRolling ? "animate-odometer-digit" : ""}`}
          style={{ 
            animationDelay: `${i * 30}ms`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
