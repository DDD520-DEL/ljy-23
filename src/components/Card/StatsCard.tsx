import { ReactNode, useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'amber' | 'green' | 'red' | 'blue';
  subtitle?: string;
}

const StatsCard = ({ title, value, icon, color, subtitle }: StatsCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const numericValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;

  useEffect(() => {
    setIsAnimating(true);
    setDisplayValue(0);
    const duration = 1000;
    const steps = 30;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue]);

  const colorClasses = {
    amber: {
      bg: 'bg-amber-100',
      border: 'border-amber-700',
      text: 'text-amber-800',
      iconBg: 'bg-amber-600',
      pin: 'bg-amber-500',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-forest-700',
      text: 'text-forest-700',
      iconBg: 'bg-forest-600',
      pin: 'bg-green-500',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-crimson-700',
      text: 'text-crimson-700',
      iconBg: 'bg-crimson-700',
      pin: 'bg-red-500',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-map-600',
      text: 'text-map-600',
      iconBg: 'bg-map-600',
      pin: 'bg-blue-500',
    },
  };

  const classes = colorClasses[color];

  const formatDisplayValue = () => {
    const originalDecimalPlaces = typeof value === 'string' && value.includes('.')
      ? value.split('.')[1].length
      : 0;
    
    if (numericValue >= 100 && originalDecimalPlaces === 0) {
      return displayValue.toFixed(0);
    } else if (originalDecimalPlaces > 0) {
      return displayValue.toFixed(originalDecimalPlaces);
    } else if (numericValue >= 10) {
      return displayValue.toFixed(1);
    } else {
      return displayValue.toFixed(1);
    }
  };

  return (
    <div className={`card-paper p-6 relative ${classes.bg} ${classes.border} border-2`}>
      <div 
        className={`absolute -top-2 left-4 w-4 h-4 ${classes.pin} rounded-full shadow-md border-2 border-white`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`${classes.iconBg} p-3 rounded-xl text-parchment-100 shadow-lg`}>
            {icon}
          </div>
          {subtitle && (
            <span className={`badge-stamp ${classes.text} ${classes.bg} ${classes.border}`}>
              {subtitle}
            </span>
          )}
        </div>

        <h3 className="font-display text-lg text-amber-900 mb-2">
          {title}
        </h3>

        <p className={`font-mono text-4xl font-bold ${classes.text} ${isAnimating ? 'number-pop' : ''}`}>
          {formatDisplayValue()}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
