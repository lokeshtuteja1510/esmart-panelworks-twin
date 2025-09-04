// Industrial IoT Mock Data Generator for eSmart PanelWorks
// Generates realistic time-series data with proper correlations and noise

export type MachineState = 'running' | 'idle' | 'changeover' | 'down' | 'setup' | 'qa-hold';

export interface AssetData {
  id: string;
  name: string;
  area: string;
  line: string;
  state: MachineState;
  oee: number;
  currentJob: string;
  operator: string;
  eta: string;
  cycleTime: number;
  idealCycleTime: number;
  goodCount: number;
  totalCount: number;
  downtime: number;
  lastUpdate: Date;
}

export interface KPIData {
  plantOEE: number;
  throughput: number;
  wip: number;
  taktVsCycle: number;
  energyIntensity: number;
  fpy: number;
  otd: number;
  safetyDays: number;
  trend: number[];
}

export interface EnergyData {
  timestamp: Date;
  kw: number;
  kwh: number;
  pf: number;
  thd: number;
}

export interface QualityData {
  station: string;
  passRate: number;
  defectRate: number;
  reworkRate: number;
  topDefects: { type: string; count: number }[];
}

// Asset definitions for the panel manufacturing plant
const ASSETS: Omit<AssetData, 'state' | 'oee' | 'currentJob' | 'operator' | 'eta' | 'cycleTime' | 'idealCycleTime' | 'goodCount' | 'totalCount' | 'downtime' | 'lastUpdate'>[] = [
  // Sheet Metal Area
  { id: 'laser_01', name: 'Laser Cutting 01', area: 'Sheet Metal', line: 'Line A' },
  { id: 'laser_02', name: 'Laser Cutting 02', area: 'Sheet Metal', line: 'Line A' },
  { id: 'pressbrake_01', name: 'Press Brake 01', area: 'Sheet Metal', line: 'Line A' },
  { id: 'pressbrake_02', name: 'Press Brake 02', area: 'Sheet Metal', line: 'Line B' },
  
  // Busbar Shop
  { id: 'busbar_cut_01', name: 'Busbar Cutting', area: 'Busbar Shop', line: 'Line C' },
  { id: 'busbar_bend_01', name: 'Busbar Bending', area: 'Busbar Shop', line: 'Line C' },
  
  // Powder Coating
  { id: 'booth_01', name: 'Paint Booth 01', area: 'Powder Coating', line: 'Line D' },
  { id: 'booth_02', name: 'Paint Booth 02', area: 'Powder Coating', line: 'Line D' },
  { id: 'oven_01', name: 'Cure Oven 01', area: 'Powder Coating', line: 'Line D' },
  
  // Assembly
  { id: 'assembly_stn_01', name: 'Assembly Station 01', area: 'Assembly', line: 'Line E' },
  { id: 'assembly_stn_02', name: 'Assembly Station 02', area: 'Assembly', line: 'Line E' },
  { id: 'assembly_stn_03', name: 'Assembly Station 03', area: 'Assembly', line: 'Line F' },
  { id: 'assembly_stn_04', name: 'Assembly Station 04', area: 'Assembly', line: 'Line F' },
  
  // Testing
  { id: 'fat_01', name: 'FAT Station 01', area: 'Testing', line: 'Line G' },
  { id: 'fat_02', name: 'FAT Station 02', area: 'Testing', line: 'Line G' },
  
  // Utilities
  { id: 'compressor_01', name: 'Air Compressor 01', area: 'Utilities', line: 'Support' },
  { id: 'chiller_01', name: 'Chiller 01', area: 'Utilities', line: 'Support' },
  { id: 'main_feeder_A', name: 'Main Feeder A', area: 'Utilities', line: 'Electrical' },
  { id: 'main_feeder_B', name: 'Main Feeder B', area: 'Utilities', line: 'Electrical' },
];

const JOB_TYPES = ['Panel-LT-100A', 'Panel-MV-630A', 'Panel-HT-1600A', 'DB-415V', 'PCC-LT'];
const OPERATORS = ['Raj Kumar', 'Priya Singh', 'Amit Sharma', 'Neha Patel', 'Suresh Yadav'];

// Weighted state probabilities for realistic distribution
const STATE_PROBABILITIES: Record<MachineState, number> = {
  running: 0.65,    // 65% running
  idle: 0.15,       // 15% idle
  changeover: 0.08, // 8% changeover
  down: 0.05,       // 5% down
  setup: 0.05,      // 5% setup
  'qa-hold': 0.02   // 2% QA hold
};

function getRandomState(): MachineState {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [state, prob] of Object.entries(STATE_PROBABILITIES)) {
    cumulative += prob;
    if (rand <= cumulative) {
      return state as MachineState;
    }
  }
  return 'running';
}

function generateOEE(state: MachineState, baseOEE: number = 75): number {
  const stateModifiers = {
    running: 0,
    idle: -10,
    changeover: -30,
    down: -75,
    setup: -50,
    'qa-hold': -20
  };
  
  const modified = baseOEE + stateModifiers[state];
  const noise = (Math.random() - 0.5) * 10; // ±5% noise
  return Math.max(0, Math.min(100, modified + noise));
}

function generateCycleTime(idealTime: number, state: MachineState): number {
  const stateMultipliers = {
    running: 1.0,
    idle: 0,
    changeover: 2.5,
    down: 0,
    setup: 1.8,
    'qa-hold': 1.2
  };
  
  if (state === 'idle' || state === 'down') return 0;
  
  const baseTime = idealTime * stateMultipliers[state];
  const variation = baseTime * 0.1 * (Math.random() - 0.5); // ±10% variation
  return baseTime + variation;
}

export function generateAssetData(): AssetData[] {
  return ASSETS.map(asset => {
    const state = getRandomState();
    const idealCycleTime = 120 + Math.random() * 240; // 2-6 minutes
    const oee = generateOEE(state);
    const cycleTime = generateCycleTime(idealCycleTime, state);
    
    // Generate production counts based on state
    const shiftHours = 8;
    const theoreticalCount = (shiftHours * 3600) / idealCycleTime;
    const efficiency = oee / 100;
    const totalCount = Math.floor(theoreticalCount * efficiency * (0.8 + Math.random() * 0.4));
    const qualityRate = 0.92 + Math.random() * 0.07; // 92-99% quality
    const goodCount = Math.floor(totalCount * qualityRate);
    
    return {
      ...asset,
      state,
      oee: Math.round(oee * 10) / 10,
      currentJob: JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)],
      operator: OPERATORS[Math.floor(Math.random() * OPERATORS.length)],
      eta: state === 'running' ? `${Math.floor(Math.random() * 120 + 30)}min` : '-',
      cycleTime: Math.round(cycleTime),
      idealCycleTime: Math.round(idealCycleTime),
      goodCount,
      totalCount,
      downtime: state === 'down' ? Math.floor(Math.random() * 180 + 10) : 0,
      lastUpdate: new Date()
    };
  });
}

export function generateKPIData(): KPIData {
  const assetData = generateAssetData();
  
  // Calculate plant-wide OEE
  const totalOEE = assetData.reduce((sum, asset) => sum + asset.oee, 0);
  const plantOEE = totalOEE / assetData.length;
  
  // Calculate throughput (panels/hour)
  const totalGoodCount = assetData.reduce((sum, asset) => sum + asset.goodCount, 0);
  const throughput = Math.round(totalGoodCount / 8 * 10) / 10; // per hour
  
  // Generate trend data (last 24 points)
  const trend = Array.from({ length: 24 }, () => 
    plantOEE + (Math.random() - 0.5) * 20
  );
  
  return {
    plantOEE: Math.round(plantOEE * 10) / 10,
    throughput,
    wip: Math.floor(Math.random() * 50 + 120), // 120-170 units
    taktVsCycle: Math.round((0.85 + Math.random() * 0.3) * 1000) / 10, // 85-115%
    energyIntensity: Math.round((12 + Math.random() * 4) * 10) / 10, // 12-16 kWh/panel
    fpy: Math.round((0.92 + Math.random() * 0.07) * 1000) / 10, // 92-99%
    otd: Math.round((0.88 + Math.random() * 0.1) * 1000) / 10, // 88-98%
    safetyDays: Math.floor(Math.random() * 100 + 45), // 45-145 days
    trend
  };
}

export function generateEnergyData(): EnergyData[] {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    const baseLoad = 850; // Base load in kW
    const variation = Math.sin(i * Math.PI / 12) * 200; // Daily pattern
    const noise = (Math.random() - 0.5) * 100;
    const kw = baseLoad + variation + noise;
    
    return {
      timestamp,
      kw: Math.round(kw),
      kwh: Math.round(kw * 1), // 1 hour intervals
      pf: Math.round((0.85 + Math.random() * 0.1) * 100) / 100, // 0.85-0.95
      thd: Math.round((2 + Math.random() * 3) * 10) / 10 // 2-5% THD
    };
  });
}

export function generateQualityData(): QualityData[] {
  const stations = ['Laser Cut QC', 'Bend QC', 'Paint QC', 'Assembly QC', 'Final Test'];
  const defectTypes = ['Dimension', 'Surface', 'Electrical', 'Mechanical', 'Visual'];
  
  return stations.map(station => ({
    station,
    passRate: Math.round((0.92 + Math.random() * 0.07) * 1000) / 10,
    defectRate: Math.round((0.01 + Math.random() * 0.06) * 1000) / 10,
    reworkRate: Math.round((0.02 + Math.random() * 0.04) * 1000) / 10,
    topDefects: defectTypes.map(type => ({
      type,
      count: Math.floor(Math.random() * 15 + 1)
    })).sort((a, b) => b.count - a.count).slice(0, 3)
  }));
}

// Real-time data simulation with WebSocket-like updates
export class DataSimulator {
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: ((data: any) => void)[] = [];
  
  start() {
    this.updateInterval = setInterval(() => {
      const data = {
        assets: generateAssetData(),
        kpis: generateKPIData(),
        energy: generateEnergyData(),
        quality: generateQualityData(),
        timestamp: new Date()
      };
      
      this.subscribers.forEach(callback => callback(data));
    }, 1000); // Update every second for real-time feel
  }
  
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
}

export const dataSimulator = new DataSimulator();