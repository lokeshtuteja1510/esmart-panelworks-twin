import { cn } from "@/lib/utils";
import type { MachineState } from "@/lib/mockData";
import { 
  Play, 
  Pause, 
  RefreshCw, 
  AlertTriangle, 
  Settings, 
  Shield 
} from "lucide-react";

interface StatusBadgeProps {
  status: MachineState;
  className?: string;
  showIcon?: boolean;
  size?: 'small' | 'medium';
}

const statusConfig: Record<MachineState, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  running: {
    label: "Running",
    icon: Play,
    className: "status-running"
  },
  idle: {
    label: "Idle", 
    icon: Pause,
    className: "status-idle"
  },
  changeover: {
    label: "Changeover",
    icon: RefreshCw,
    className: "status-changeover"
  },
  down: {
    label: "Down",
    icon: AlertTriangle,
    className: "status-down"
  },
  setup: {
    label: "Setup",
    icon: Settings,
    className: "status-setup"
  },
  'qa-hold': {
    label: "QA Hold",
    icon: Shield,
    className: "status-qa-hold"
  }
};

export function StatusBadge({ 
  status, 
  className, 
  showIcon = true,
  size = 'medium'
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-2.5 py-1 text-xs"
  };
  
  return (
    <div className={cn(
      "status-badge", 
      config.className,
      sizeClasses[size],
      className
    )}>
      {showIcon && <Icon className="w-3 h-3 mr-1.5" />}
      <span className="font-medium">{config.label}</span>
    </div>
  );
}