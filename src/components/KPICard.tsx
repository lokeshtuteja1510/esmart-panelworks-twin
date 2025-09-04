import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  trend?: number[];
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function KPICard({ 
  title, 
  value, 
  unit, 
  delta, 
  deltaLabel = "vs prev shift",
  trend = [],
  className,
  size = 'medium'
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-IN', { maximumFractionDigits: 1 });
    }
    return val;
  };

  const getDeltaIcon = () => {
    if (!delta) return <Minus className="w-3 h-3" />;
    return delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const getDeltaClass = () => {
    if (!delta) return "bg-muted text-muted-foreground";
    return delta > 0 ? "kpi-delta-positive" : "kpi-delta-negative";
  };

  const sizeClasses = {
    small: "p-3",
    medium: "p-4", 
    large: "p-6"
  };

  const valueSizeClasses = {
    small: "text-xl",
    medium: "text-2xl",
    large: "text-3xl"
  };

  // Simple sparkline using CSS
  const renderSparkline = () => {
    if (trend.length === 0) return null;
    
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    
    return (
      <div className="flex items-end gap-px h-8 mt-2">
        {trend.slice(-12).map((point, i) => {
          const height = ((point - min) / range) * 100;
          return (
            <div
              key={i}
              className="bg-primary/30 flex-1 min-h-[2px] transition-all duration-300"
              style={{ height: `${Math.max(height, 8)}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("kpi-card", sizeClasses[size], className)}>
      <div className="flex items-start justify-between mb-2">
        <div className="kpi-label font-medium text-xs uppercase tracking-wide">
          {title}
        </div>
        {delta !== undefined && (
          <div className={cn("kpi-delta flex items-center gap-1", getDeltaClass())}>
            {getDeltaIcon()}
            <span>{Math.abs(delta).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1 mb-1">
        <div className={cn("kpi-value font-bold tracking-tight", valueSizeClasses[size])}>
          {formatValue(value)}
        </div>
        {unit && (
          <span className="text-sm text-muted-foreground font-medium">
            {unit}
          </span>
        )}
      </div>
      
      {delta !== undefined && (
        <div className="text-xs text-muted-foreground">
          {deltaLabel}
        </div>
      )}
      
      {renderSparkline()}
    </div>
  );
}