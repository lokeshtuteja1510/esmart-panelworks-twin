import { useState } from "react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { AssetData } from "@/lib/mockData";
import { Card } from "./ui/card";

interface FloorplanTwinProps {
  assets: AssetData[];
  onAssetClick?: (asset: AssetData) => void;
}

interface Area {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number; width: number; height: number };
}

const AREAS: Area[] = [
  {
    id: 'sheet-metal',
    name: 'Sheet Metal',
    color: 'bg-blue-50 border-blue-200',
    position: { x: 0, y: 0, width: 300, height: 200 }
  },
  {
    id: 'busbar',
    name: 'Busbar Shop', 
    color: 'bg-green-50 border-green-200',
    position: { x: 320, y: 0, width: 200, height: 200 }
  },
  {
    id: 'coating',
    name: 'Powder Coating',
    color: 'bg-purple-50 border-purple-200',
    position: { x: 540, y: 0, width: 300, height: 120 }
  },
  {
    id: 'assembly',
    name: 'Assembly',
    color: 'bg-orange-50 border-orange-200',
    position: { x: 0, y: 220, width: 400, height: 200 }
  },
  {
    id: 'testing',
    name: 'Testing',
    color: 'bg-red-50 border-red-200',
    position: { x: 420, y: 220, width: 200, height: 200 }
  },
  {
    id: 'utilities',
    name: 'Utilities',
    color: 'bg-gray-50 border-gray-200',
    position: { x: 640, y: 140, width: 200, height: 280 }
  }
];

export function FloorplanTwin({ assets, onAssetClick }: FloorplanTwinProps) {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  
  const getAssetPosition = (assetId: string, area: string) => {
    const areaConfig = AREAS.find(a => a.name === area);
    if (!areaConfig) return { x: 0, y: 0 };
    
    // Position assets within their area
    const assetsInArea = assets.filter(a => a.area === area);
    const index = assetsInArea.findIndex(a => a.id === assetId);
    const cols = Math.ceil(Math.sqrt(assetsInArea.length));
    
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    const assetWidth = (areaConfig.position.width - 40) / cols;
    const assetHeight = (areaConfig.position.height - 60) / Math.ceil(assetsInArea.length / cols);
    
    return {
      x: areaConfig.position.x + 20 + col * assetWidth,
      y: areaConfig.position.y + 40 + row * assetHeight,
      width: Math.max(assetWidth - 10, 80),
      height: Math.max(assetHeight - 10, 40)
    };
  };
  
  const handleAssetClick = (asset: AssetData) => {
    setSelectedAsset(asset.id === selectedAsset ? null : asset.id);
    onAssetClick?.(asset);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Live Factory Floorplan</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="px-2 py-1 text-xs border rounded hover:bg-muted"
          >
            −
          </button>
          <span className="text-xs text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="px-2 py-1 text-xs border rounded hover:bg-muted"
          >
            +
          </button>
        </div>
      </div>
      
      <div className="relative overflow-auto border rounded-lg bg-muted/10">
        <svg
          width={860 * zoom}
          height={440 * zoom}
          viewBox="0 0 860 440"
          className="min-w-full"
        >
          {/* Area backgrounds */}
          {AREAS.map(area => (
            <g key={area.id}>
              <rect
                x={area.position.x}
                y={area.position.y}
                width={area.position.width}
                height={area.position.height}
                className="fill-muted/20 stroke-border stroke-2"
                rx="8"
              />
              <text
                x={area.position.x + 10}
                y={area.position.y + 20}
                className="fill-muted-foreground text-sm font-medium"
              >
                {area.name}
              </text>
            </g>
          ))}
          
          {/* Asset indicators */}
          {assets.map(asset => {
            const pos = getAssetPosition(asset.id, asset.area);
            const isSelected = selectedAsset === asset.id;
            
            return (
              <g key={asset.id}>
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.width}
                  height={pos.height}
                  className={cn(
                    "stroke-2 rounded cursor-pointer transition-all duration-200",
                    {
                      'fill-status-running/10 stroke-status-running': asset.state === 'running',
                      'fill-status-idle/10 stroke-status-idle': asset.state === 'idle',
                      'fill-status-down/10 stroke-status-down': asset.state === 'down',
                      'fill-status-setup/10 stroke-status-setup': asset.state === 'setup',
                      'fill-status-changeover/10 stroke-status-changeover': asset.state === 'changeover',
                      'fill-status-qa-hold/10 stroke-status-qa-hold': asset.state === 'qa-hold',
                    },
                    isSelected && "stroke-primary stroke-4"
                  )}
                  rx="4"
                  onClick={() => handleAssetClick(asset)}
                />
                
                {/* Asset name and status */}
                <text
                  x={pos.x + 5}
                  y={pos.y + 15}
                  className="fill-foreground text-xs font-medium pointer-events-none"
                >
                  {asset.name.length > 15 ? asset.name.substring(0, 15) + '...' : asset.name}
                </text>
                
                <text
                  x={pos.x + 5}
                  y={pos.y + 28}
                  className="fill-muted-foreground text-xs pointer-events-none"
                >
                  OEE: {asset.oee}%
                </text>
                
                {/* State indicator dot */}
                <circle
                  cx={pos.x + pos.width - 8}
                  cy={pos.y + 8}
                  r="4"
                  className={cn(
                    "transition-all duration-200",
                    {
                      'fill-status-running': asset.state === 'running',
                      'fill-status-idle': asset.state === 'idle', 
                      'fill-status-down': asset.state === 'down',
                      'fill-status-setup': asset.state === 'setup',
                      'fill-status-changeover': asset.state === 'changeover',
                      'fill-status-qa-hold': asset.state === 'qa-hold',
                    }
                  )}
                >
                  {(asset.state === 'running' || asset.state === 'down') && (
                    <animate
                      attributeName="opacity"
                      values="0.5;1;0.5"
                      dur={asset.state === 'running' ? "2s" : "1s"}
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Asset details panel */}
      {selectedAsset && (
        <div className="mt-4 p-4 border rounded-lg bg-card">
          {(() => {
            const asset = assets.find(a => a.id === selectedAsset);
            if (!asset) return null;
            
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{asset.name}</h4>
                  <StatusBadge status={asset.state} />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">OEE</div>
                    <div className="font-medium">{asset.oee}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Current Job</div>
                    <div className="font-medium">{asset.currentJob}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Operator</div>
                    <div className="font-medium">{asset.operator}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ETA</div>
                    <div className="font-medium">{asset.eta}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Cycle Time</div>
                    <div className="font-medium">{asset.cycleTime}s</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Good Count</div>
                    <div className="font-medium">{asset.goodCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Count</div>
                    <div className="font-medium">{asset.totalCount}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </Card>
  );
}