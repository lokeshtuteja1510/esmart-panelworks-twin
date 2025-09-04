import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

interface HotspotTooltipProps {
  hotspot: any;
  data?: any;
  onClose: () => void;
}

export const HotspotTooltip: React.FC<HotspotTooltipProps> = ({
  hotspot,
  data,
  onClose
}) => {
  const getAlertLevel = () => {
    if (!data || data.value === undefined) return 'NO_SIGNAL';
    
    const value = data.value;
    
    if (hotspot.thresholds.type === 'binary') {
      return value === hotspot.thresholds.alarm ? 'ALARM' : 'OK';
    }
    
    if (hotspot.thresholds.direction === 'below') {
      if (value <= hotspot.thresholds.alarm) return 'ALARM';
      if (value <= hotspot.thresholds.warn) return 'WARN';
    } else if (hotspot.thresholds.direction === 'outside_band' && hotspot.thresholds.band) {
      const [min, max] = hotspot.thresholds.band;
      if (value < min || value > max) return 'ALARM';
      const margin = (max - min) * 0.1;
      if (value < min + margin || value > max - margin) return 'WARN';
    } else {
      if (value >= hotspot.thresholds.alarm) return 'ALARM';
      if (value >= hotspot.thresholds.warn) return 'WARN';
    }
    
    return 'OK';
  };

  const alertLevel = getAlertLevel();
  const age = data?.timestamp ? Math.floor((Date.now() - new Date(data.timestamp).getTime()) / 1000) : 0;

  const getBadgeVariant = () => {
    switch (alertLevel) {
      case 'ALARM': return 'destructive';
      case 'WARN': return 'secondary';
      case 'NO_SIGNAL': return 'outline';
      default: return 'default';
    }
  };

  const formatValue = () => {
    if (!data || data.value === undefined) return 'No Signal';
    
    if (hotspot.thresholds.type === 'binary') {
      return data.value ? 'FAULT' : 'OK';
    }
    
    return `${data.value}${hotspot.unit}`;
  };

  return (
    <Card className="p-3 w-64 shadow-lg border bg-background/95 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-foreground">{hotspot.label}</h4>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">{formatValue()}</span>
          <Badge variant={getBadgeVariant()}>{alertLevel}</Badge>
        </div>
        
        {hotspot.thresholds.type !== 'binary' && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Warn: {hotspot.thresholds.warn}{hotspot.unit}</div>
            <div>Alarm: {hotspot.thresholds.alarm}{hotspot.unit}</div>
            {hotspot.thresholds.band && (
              <div>Range: {hotspot.thresholds.band[0]} - {hotspot.thresholds.band[1]}{hotspot.unit}</div>
            )}
          </div>
        )}
        
        {age > 0 && (
          <div className="text-xs text-muted-foreground">
            Age: +{age}s
          </div>
        )}
        
        {data?.trend && (
          <div className="text-xs text-muted-foreground">
            Trend: {data.trend > 0 ? '↗' : data.trend < 0 ? '↘' : '→'} {Math.abs(data.trend).toFixed(1)}/min
          </div>
        )}
      </div>
    </Card>
  );
};