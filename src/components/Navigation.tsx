import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Factory, 
  Shield, 
  Settings, 
  Zap, 
  TrendingUp,
  Users,
  AlertTriangle,
  FileText,
  Search,
  Clock,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  shiftInfo?: {
    current: string;
    startTime: string;
    endTime: string;
  };
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'production', label: 'Production', icon: Factory },
  { id: 'quality', label: 'Quality', icon: Shield },
  { id: 'maintenance', label: 'Maintenance', icon: Settings },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'supply-chain', label: 'Supply Chain', icon: TrendingUp },
  { id: 'safety', label: 'Safety', icon: Users },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export function Navigation({ currentView, onViewChange, shiftInfo }: NavigationProps) {
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col h-screen bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Factory className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground">eSmart PanelWorks</h1>
            <p className="text-xs text-sidebar-foreground/60">Digital Twin</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidebar-foreground/60" />
          <Input
            placeholder="Search assets, KPIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60"
          />
        </div>
      </div>

      {/* Time and Shift Info */}
      <div className="p-4 border-b border-sidebar-border bg-sidebar-accent/50">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-sidebar-foreground/60" />
          <div className="text-xs text-sidebar-foreground">
            <div className="font-medium">{currentTime}</div>
            <div className="text-sidebar-foreground/60">{currentDate}</div>
          </div>
        </div>
        
        {shiftInfo && (
          <div className="mt-2 p-2 rounded-md bg-primary/10 border border-primary/20">
            <div className="text-xs">
              <div className="font-medium text-primary">Shift {shiftInfo.current}</div>
              <div className="text-sidebar-foreground/60">
                {shiftInfo.startTime} - {shiftInfo.endTime}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
              {item.id === 'alerts' && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                  3
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>
    </div>
  );
}