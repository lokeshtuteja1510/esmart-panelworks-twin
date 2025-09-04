import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { KPICard } from "@/components/KPICard";
import { FloorplanTwin } from "@/components/FloorplanTwin";
import { StatusBadge } from "@/components/StatusBadge";
import { dataSimulator, type AssetData, type KPIData } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, User } from "lucide-react";

interface DashboardData {
  assets: AssetData[];
  kpis: KPIData;
  timestamp: Date;
}

const Index = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Start the data simulator
    dataSimulator.start();
    
    const unsubscribe = dataSimulator.subscribe((data) => {
      setDashboardData(data);
      setLastUpdate(new Date());
    });

    return () => {
      unsubscribe();
      dataSimulator.stop();
    };
  }, []);

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold mb-2">Connecting to Factory Systems...</h1>
            <p className="text-muted-foreground">Initializing real-time data feeds</p>
          </div>
        </div>
      </div>
    );
  }

  const { assets, kpis } = dashboardData;

  // Calculate running assets count
  const runningAssets = assets.filter(a => a.state === 'running').length;
  const downAssets = assets.filter(a => a.state === 'down');
  const criticalAlerts = downAssets.length + assets.filter(a => a.oee < 60).length;

  // Get shift information
  const shiftInfo = {
    current: "A",
    startTime: "06:00",
    endTime: "14:00"
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <KPICard
          title="Plant OEE"
          value={kpis.plantOEE}
          unit="%"
          delta={2.3}
          trend={kpis.trend}
          className="lg:col-span-2"
          size="large"
        />
        <KPICard
          title="Throughput"
          value={kpis.throughput}
          unit="panels/h"
          delta={-1.2}
          className="lg:col-span-2"
        />
        <KPICard
          title="WIP"
          value={kpis.wip}
          unit="units"
          delta={0.8}
          className="lg:col-span-2"
        />
        <KPICard
          title="Energy Intensity"
          value={kpis.energyIntensity}
          unit="kWh/panel"
          delta={-3.1}
          className="lg:col-span-2"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="First Pass Yield"
          value={kpis.fpy}
          unit="%"
          delta={1.5}
        />
        <KPICard
          title="On-Time Delivery"
          value={kpis.otd}
          unit="%"
          delta={2.1}
        />
        <KPICard
          title="Takt vs Cycle"
          value={kpis.taktVsCycle}
          unit="%"
          delta={-0.7}
        />
        <KPICard
          title="Safety Days"
          value={kpis.safetyDays}
          unit="days"
          delta={1}
        />
      </div>

      {/* Live Floorplan */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <FloorplanTwin assets={assets} />
        </div>
        
        {/* Live Alerts & Status Panel */}
        <div className="space-y-4">
          {/* Factory Status Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Live Factory Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Assets Running</span>
                <Badge variant="secondary">{runningAssets}/{assets.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Critical Alerts</span>
                <Badge variant={criticalAlerts > 0 ? "destructive" : "secondary"}>
                  {criticalAlerts}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Update</span>
                <span className="text-xs text-muted-foreground">
                  {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Recent Alerts */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Active Alerts
            </h3>
            <div className="space-y-3">
              {downAssets.slice(0, 3).map((asset) => (
                <div key={asset.id} className="flex items-start gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{asset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Machine down • {asset.downtime}min elapsed
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs">{asset.operator}</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span className="text-xs">{asset.lastUpdate.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {downAssets.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <div className="text-sm">No critical alerts</div>
                  <div className="text-xs">All systems operational</div>
                </div>
              )}
            </div>
          </Card>

          {/* Asset Status Distribution */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Asset Status Distribution</h3>
            <div className="space-y-2">
              {Object.entries(
                assets.reduce((acc, asset) => {
                  acc[asset.state] = (acc[asset.state] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([state, count]) => (
                <div key={state} className="flex items-center justify-between">
                  <StatusBadge status={state as any} size="small" />
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        shiftInfo={shiftInfo}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {currentView === 'overview' && 'Plant Overview'}
                  {currentView === 'production' && 'Production Dashboard'}
                  {currentView === 'quality' && 'Quality Management'}
                  {currentView === 'maintenance' && 'Maintenance & PdM'}
                  {currentView === 'energy' && 'Energy & Utilities'}
                  {currentView === 'supply-chain' && 'Supply Chain'}
                  {currentView === 'safety' && 'Safety & EHS'}
                  {currentView === 'alerts' && 'Alerts & Automations'}
                  {currentView === 'reports' && 'Reports & Analytics'}
                </h1>
                <p className="text-muted-foreground">
                  Real-time digital twin of panel manufacturing operations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
            </div>
          </div>

          {/* View Content */}
          {currentView === 'overview' && renderOverview()}
          {currentView !== 'overview' && (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Dashboard
              </h3>
              <p className="text-muted-foreground">
                Detailed {currentView} analytics and controls coming soon...
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
