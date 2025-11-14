// src/App.jsx
import React, { useMemo, useState } from "react";

// ===== Visualization Components =====
function PortfolioDropChart({ dropPercent = 25 }) {
  const width = 320, height = 160;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baseY = padding.top + chartHeight;
  
  // Generate smooth decline curve - line goes DOWN (loss increases downward)
  const points = Array.from({ length: 13 }, (_, i) => {
    const x = padding.left + (i / 12) * chartWidth;
    const progress = i / 12;
    // Smooth decline accelerating at the end - loss increases as we go down
    const dropFactor = progress < 0.7 ? progress * 0.5 : 0.35 + (progress - 0.7) * 2.17;
    const y = padding.top + (dropFactor * chartHeight * 0.8);
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg width={width} height={height} style={{ display: "block", margin: "8px auto" }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = padding.top + ratio * chartHeight;
        return (
          <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} 
                stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
        );
      })}
      
      {/* Y-axis */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={baseY} stroke="#374151" strokeWidth="1.5" />
      {/* X-axis */}
      <line x1={padding.left} y1={baseY} x2={width - padding.right} y2={baseY} stroke="#374151" strokeWidth="1.5" />
      
      {/* Y-axis labels - Loss increases downward */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = padding.top + ratio * chartHeight;
        const value = Math.round(ratio * dropPercent);
        return (
          <g key={i}>
            <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#374151" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
              {value}%
            </text>
          </g>
        );
      })}
      
      {/* Y-axis title */}
      <text x="15" y={height / 2} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="600" transform={`rotate(-90, 15, ${height / 2})`}>
        Loss
      </text>
      
      {/* X-axis labels */}
      <text x={padding.left + chartWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#6b7280">
        Time
      </text>
      
      {/* Chart line */}
      <polyline points={points} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Title */}
      <text x={width / 2} y={12} textAnchor="middle" fontSize="11" fill="#111" fontWeight="600">
        Portfolio Loss Over Time
      </text>
    </svg>
  );
}

function VolatilityChart({ type = "volatile" }) {
  const width = 320, height = 160;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baseY = padding.top + chartHeight / 2;
  
  const pseudoRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const numPoints = 28;
  let lastY = baseY;
  const yValues = [];
  
  if (type === "volatile") {
    // More realistic volatile market with clusters of volatility
    for (let i = 0; i < numPoints; i++) {
      const x = padding.left + (i / (numPoints - 1)) * chartWidth;
      const progress = i / (numPoints - 1);
      
      // Create volatility clusters (like real market stress periods)
      const cluster1 = progress > 0.2 && progress < 0.35 ? 1.2 : 1.0;
      const cluster2 = progress > 0.6 && progress < 0.75 ? 1.3 : 1.0;
      const volatilityMultiplier = cluster1 * cluster2;
      
      // Multiple frequency components for realistic market behavior
      const wave1 = Math.sin(i * 0.4) * 0.4;
      const wave2 = Math.sin(i * 0.9) * 0.25;
      const wave3 = Math.sin(i * 1.6) * 0.15;
      const random = (pseudoRandom(i) - 0.5) * 0.3;
      
      // Momentum effect - current movement influenced by previous
      const momentum = (lastY - baseY) / (chartHeight * 0.4) * 0.15;
      
      const fluctuation = (wave1 + wave2 + wave3 + random + momentum) * volatilityMultiplier;
      const y = baseY - fluctuation * (chartHeight * 0.4);
      lastY = y;
      yValues.push({ x, y });
    }
  } else {
    // Stable market with gentle upward trend and minimal volatility
    for (let i = 0; i < numPoints; i++) {
      const x = padding.left + (i / (numPoints - 1)) * chartWidth;
      const progress = i / (numPoints - 1);
      
      // Gentle upward trend
      const trend = progress * 0.4;
      // Very small fluctuations
      const wave = Math.sin(i * 0.3) * 0.08;
      const random = (pseudoRandom(i) - 0.5) * 0.05;
      
      const y = baseY - (trend + wave + random) * (chartHeight * 0.4);
      lastY = y;
      yValues.push({ x, y });
    }
  }
  
  const points = yValues.map(p => `${p.x},${p.y}`).join(" ");
  const color = type === "volatile" ? "#f59e0b" : "#22c55e";
  
  return (
    <svg width={width} height={height} style={{ display: "block", margin: "8px auto" }}>
      {/* Grid lines */}
      {[-1, -0.5, 0, 0.5, 1].map((ratio, i) => {
        const y = baseY - ratio * (chartHeight * 0.4);
        return (
          <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} 
                stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
        );
      })}
      
      {/* Y-axis */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#374151" strokeWidth="1.5" />
      {/* X-axis */}
      <line x1={padding.left} y1={baseY} x2={width - padding.right} y2={baseY} stroke="#374151" strokeWidth="1.5" />
      
      {/* Y-axis labels with percentage values */}
      {[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = baseY - ratio * (chartHeight * 0.4);
        const value = Math.round(ratio * 100);
        if (Math.abs(value) % 25 === 0 || value === 0) { // Show 0, ±25%, ±50%, ±75%, ±100%
          return (
            <g key={i}>
              <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#374151" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
                {value > 0 ? `+${value}%` : `${value}%`}
              </text>
            </g>
          );
        }
        return null;
      })}
      
      {/* X-axis label */}
      <text x={padding.left + chartWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#6b7280">
        Time
      </text>
      
      {/* Chart line */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Title */}
      <text x={width / 2} y={12} textAnchor="middle" fontSize="11" fill="#111" fontWeight="600">
        {type === "volatile" ? "High Volatility Market" : "Stable Market"}
      </text>
    </svg>
  );
}

function ComparisonCharts({ type = "steady" }) {
  const width = 150, height = 120;
  const padding = { top: 25, right: 10, bottom: 30, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baseY = padding.top + chartHeight;
  
  const pseudoRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  if (type === "steady") {
    // Steady growth with small, realistic fluctuations
    const numPoints = 16;
    let lastY = baseY;
    const yValues = [];
    
    for (let i = 0; i < numPoints; i++) {
      const x = padding.left + (i / (numPoints - 1)) * chartWidth;
      const progress = i / (numPoints - 1);
      
      // Steady upward trend
      const trend = progress * 0.65;
      // Small realistic fluctuations
      const wave = Math.sin(i * 0.4) * 0.08;
      const random = (pseudoRandom(i) - 0.5) * 0.06;
      // Smooth momentum
      const momentum = (lastY - baseY) / (chartHeight * 0.7) * 0.1;
      
      const y = baseY - (trend + wave + random + momentum) * (chartHeight * 0.7);
      lastY = y;
      yValues.push({ x, y });
    }
    
    const points = yValues.map(p => `${p.x},${p.y}`).join(" ");
    
    return (
      <svg width={width} height={height} style={{ display: "block", margin: "4px auto" }}>
        {/* Grid */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight;
          return (
            <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} 
                  stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
          );
        })}
        
        {/* Axes */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={baseY} stroke="#374151" strokeWidth="1.5" />
        <line x1={padding.left} y1={baseY} x2={width - padding.right} y2={baseY} stroke="#374151" strokeWidth="1.5" />
        
        {/* Chart line */}
        <polyline points={points} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Y-axis labels with percentage */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight;
          const value = Math.round(ratio * 100);
          return (
            <g key={i}>
              <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#374151" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
                +{value}%
              </text>
            </g>
          );
        })}
        
        {/* Labels */}
        <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="9" fill="#6b7280">Time</text>
        <text x={width / 2} y={12} textAnchor="middle" fontSize="10" fill="#111" fontWeight="600">Steady Growth</text>
      </svg>
    );
  } else {
    // High volatility with dramatic swings
    const numPoints = 16;
    let lastY = baseY;
    const yValues = [];
    
    for (let i = 0; i < numPoints; i++) {
      const x = padding.left + (i / (numPoints - 1)) * chartWidth;
      const progress = i / (numPoints - 1);
      
      // Multiple volatility waves
      const wave1 = Math.sin(i * 0.7) * 0.4;
      const wave2 = Math.sin(i * 1.3) * 0.25;
      const wave3 = Math.sin(i * 2.1) * 0.15;
      const random = (pseudoRandom(i) - 0.5) * 0.25;
      
      // Strong momentum effects (overshooting)
      const momentum = (lastY - baseY) / (chartHeight * 0.6) * 0.2;
      
      // Overall slight upward bias but with huge swings
      const slightTrend = progress * 0.15;
      
      const fluctuation = wave1 + wave2 + wave3 + random + momentum + slightTrend;
      const y = baseY - fluctuation * (chartHeight * 0.6);
      lastY = y;
      yValues.push({ x, y });
    }
    
    const points = yValues.map(p => `${p.x},${p.y}`).join(" ");
    
    return (
      <svg width={width} height={height} style={{ display: "block", margin: "4px auto" }}>
        {/* Grid */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight;
          return (
            <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} 
                  stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
          );
        })}
        
        {/* Axes */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={baseY} stroke="#374151" strokeWidth="1.5" />
        <line x1={padding.left} y1={baseY} x2={width - padding.right} y2={baseY} stroke="#374151" strokeWidth="1.5" />
        
        {/* Chart line */}
        <polyline points={points} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Y-axis labels with percentage */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight;
          const value = Math.round((ratio - 0.5) * 200); // -100% to +100%
          return (
            <g key={i}>
              <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#374151" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
                {value > 0 ? `+${value}%` : `${value}%`}
              </text>
            </g>
          );
        })}
        
        {/* Labels */}
        <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="9" fill="#6b7280">Time</text>
        <text x={width / 2} y={12} textAnchor="middle" fontSize="10" fill="#111" fontWeight="600">High Volatility</text>
      </svg>
    );
  }
}

function ProbabilityDiagram({ frame = "gain", option = "A" }) {
  const width = 160, height = 120;
  
  if (option === "A") {
    // Sure thing
    const value = frame === "gain" ? "+4%" : "-4%";
    const color = frame === "gain" ? "#22c55e" : "#ef4444";
    return (
      <svg width={width} height={height} style={{ display: "block", margin: "4px auto" }}>
        <rect x="20" y="30" width="120" height="50" fill={color} opacity="0.15" stroke={color} strokeWidth="2.5" rx="6" />
        <text x={width / 2} y={height / 2 + 3} textAnchor="middle" fontSize="20" fill={color} fontWeight="700">
          {value}
        </text>
        <text x={width / 2} y={height / 2 + 22} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">
          Certain Outcome
        </text>
        <text x={width / 2} y={height / 2 + 35} textAnchor="middle" fontSize="10" fill="#9ca3af">
          100% Probability
        </text>
      </svg>
    );
  } else {
    // 50/50 chance
    const high = frame === "gain" ? "+10%" : "-10%";
    const low = "0%";
    const highColor = frame === "gain" ? "#22c55e" : "#ef4444";
    return (
      <svg width={width} height={height} style={{ display: "block", margin: "4px auto" }}>
        <rect x="10" y="25" width="65" height="45" fill={highColor} opacity="0.15" stroke={highColor} strokeWidth="2.5" rx="6" />
        <rect x="85" y="25" width="65" height="45" fill="#94a3b8" opacity="0.15" stroke="#94a3b8" strokeWidth="2.5" rx="6" />
        <text x="42.5" y="52" textAnchor="middle" fontSize="16" fill={highColor} fontWeight="700">{high}</text>
        <text x="117.5" y="52" textAnchor="middle" fontSize="16" fill="#6b7280" fontWeight="700">{low}</text>
        <text x="42.5" y="68" textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">50%</text>
        <text x="117.5" y="68" textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">50%</text>
        <text x={width / 2} y="88" textAnchor="middle" fontSize="10" fill="#9ca3af">
          Uncertain Outcome
        </text>
      </svg>
    );
  }
}

function InvestmentTrendChart({ trend = "up" }) {
  const width = 150, height = 120;
  const padding = { top: 25, right: 10, bottom: 30, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baseY = padding.top + chartHeight;
  
  const pseudoRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  if (trend === "up") {
    const points = Array.from({ length: 12 }, (_, i) => {
      const x = padding.left + (i / 11) * chartWidth;
      const progress = i / 11;
      const smooth = progress + (pseudoRandom(i) - 0.5) * 0.1;
      const y = baseY - (smooth * chartHeight * 0.75);
      return `${x},${y}`;
    }).join(" ");
    return (
      <svg width={width} height={height} style={{ display: "block", margin: "4px auto" }}>
        {/* Grid */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight;
          return (
            <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} 
                  stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
          );
        })}
        
        {/* Axes */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={baseY} stroke="#374151" strokeWidth="1.5" />
        <line x1={padding.left} y1={baseY} x2={width - padding.right} y2={baseY} stroke="#374151" strokeWidth="1.5" />
        
        {/* Chart line */}
        <polyline points={points} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Y-axis labels with percentage */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight;
          const value = Math.round(ratio * 100);
          return (
            <g key={i}>
              <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#374151" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
                +{value}%
              </text>
            </g>
          );
        })}
        
        {/* Labels */}
        <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="9" fill="#6b7280">Time</text>
        <text x={width / 2} y={12} textAnchor="middle" fontSize="10" fill="#111" fontWeight="600">Upward Trend</text>
      </svg>
    );
  } else {
    const points = Array.from({ length: 12 }, (_, i) => {
      const x = padding.left + (i / 11) * chartWidth;
      const progress = i / 11;
      const smooth = progress + (pseudoRandom(i) - 0.5) * 0.1;
      const y = padding.top + (smooth * chartHeight * 0.75);
      return `${x},${y}`;
    }).join(" ");
    return (
      <svg width={width} height={height} style={{ display: "block", margin: "4px auto" }}>
        {/* Grid */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight;
          return (
            <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} 
                  stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
          );
        })}
        
        {/* Axes */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={baseY} stroke="#374151" strokeWidth="1.5" />
        <line x1={padding.left} y1={baseY} x2={width - padding.right} y2={baseY} stroke="#374151" strokeWidth="1.5" />
        
        {/* Chart line */}
        <polyline points={points} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Y-axis labels with percentage */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight;
          const value = Math.round((1 - ratio) * 100); // 100% to 0%
          return (
            <g key={i}>
              <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#374151" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
                {value}%
              </text>
            </g>
          );
        })}
        
        {/* Labels */}
        <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="9" fill="#6b7280">Time</text>
        <text x={width / 2} y={12} textAnchor="middle" fontSize="10" fill="#111" fontWeight="600">Downward Trend</text>
      </svg>
    );
  }
}

function MarketSwingChart() {
  const width = 320, height = 160;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baseY = padding.top + chartHeight / 2;
  
  const pseudoRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Create dramatic market swings with realistic behavior
  const numPoints = 30;
  let lastY = baseY;
  const yValues = [];
  
  for (let i = 0; i < numPoints; i++) {
    const x = padding.left + (i / (numPoints - 1)) * chartWidth;
    const progress = i / (numPoints - 1);
    
    // Create periods of high volatility (like news events or panic selling)
    const volatilityPeriod1 = progress > 0.15 && progress < 0.3 ? 1.4 : 1.0;
    const volatilityPeriod2 = progress > 0.55 && progress < 0.7 ? 1.5 : 1.0;
    const volatilityMultiplier = volatilityPeriod1 * volatilityPeriod2;
    
    // Multiple frequency components for sharp swings
    const swing1 = Math.sin(i * 0.5) * 0.5;
    const swing2 = Math.sin(i * 0.9) * 0.35;
    const swing3 = Math.sin(i * 1.4) * 0.2;
    const random = (pseudoRandom(i) - 0.5) * 0.25;
    
    // Strong momentum - markets overshoot then correct
    const momentum = (lastY - baseY) / (chartHeight * 0.45) * 0.25;
    
    // Occasional sharp spikes (flash crashes or rallies)
    const spike = progress > 0.4 && progress < 0.45 ? (pseudoRandom(i) - 0.5) * 0.4 : 0;
    
    const fluctuation = (swing1 + swing2 + swing3 + random + momentum + spike) * volatilityMultiplier;
    const y = baseY - fluctuation * (chartHeight * 0.45);
    lastY = y;
    yValues.push({ x, y });
  }
  
  const points = yValues.map(p => `${p.x},${p.y}`).join(" ");
  
  return (
    <svg width={width} height={height} style={{ display: "block", margin: "8px auto" }}>
      {/* Grid lines */}
      {[-1, -0.5, 0, 0.5, 1].map((ratio, i) => {
        const y = baseY - ratio * (chartHeight * 0.45);
        return (
          <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} 
                stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
        );
      })}
      
      {/* Y-axis */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#374151" strokeWidth="1.5" />
      {/* X-axis */}
      <line x1={padding.left} y1={baseY} x2={width - padding.right} y2={baseY} stroke="#374151" strokeWidth="1.5" />
      
      {/* Y-axis labels with percentage values */}
      {[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = baseY - ratio * (chartHeight * 0.45);
        const value = Math.round(ratio * 100);
        if (Math.abs(value) % 25 === 0 || value === 0) { // Show 0, ±25%, ±50%, ±75%, ±100%
          return (
            <g key={i}>
              <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#374151" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
                {value > 0 ? `+${value}%` : `${value}%`}
              </text>
            </g>
          );
        }
        return null;
      })}
      
      {/* X-axis label */}
      <text x={padding.left + chartWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#6b7280">
        Time
      </text>
      
      {/* Chart line */}
      <polyline points={points} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Title */}
      <text x={width / 2} y={12} textAnchor="middle" fontSize="11" fill="#111" fontWeight="600">
        Market Volatility
      </text>
    </svg>
  );
}

function ProfitablePeriodChart() {
  const width = 320, height = 160;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baseY = padding.top + chartHeight / 2;
  
  const pseudoRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Generate realistic stock price with no clear trend for first 3/4, then upward trend in last 1/4
  const numPoints = 32;
  const transitionPoint = Math.floor(numPoints * 0.75);
  
  // Calculate Y values for all points
  const yValues = [];
  let lastY = baseY; // Track last Y position for smooth transition
  
  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    let y;
    
    if (i < transitionPoint) {
      // First 3/4: realistic fluctuations with no clear trend
      // Use multiple sine waves for realistic market behavior
      const wave1 = Math.sin(i * 0.25) * 0.12;
      const wave2 = Math.sin(i * 0.6) * 0.08;
      const wave3 = Math.sin(i * 1.1) * 0.05;
      const random = (pseudoRandom(i) - 0.5) * 0.15;
      // Very slight overall drift (almost flat)
      const drift = (progress - 0.375) * 0.05;
      const fluctuation = wave1 + wave2 + wave3 + random + drift;
      y = baseY - fluctuation * (chartHeight * 0.3);
      lastY = y; // Update for smooth transition
    } else {
      // Last 1/4: clear upward trend
      const upwardProgress = (i - transitionPoint) / (numPoints - 1 - transitionPoint); // 0 to 1 in last quarter
      // Strong upward movement with easing
      const upwardTrend = upwardProgress * upwardProgress * 0.7; // Easing for more natural look
      // Some volatility but decreasing as trend continues
      const volatility = Math.sin(i * 0.8) * 0.08 * (1 - upwardProgress * 0.6);
      const random = (pseudoRandom(i) - 0.5) * 0.1 * (1 - upwardProgress * 0.5);
      // Start from last position and add upward movement
      y = lastY - (upwardTrend + volatility + random) * (chartHeight * 0.45);
    }
    
    yValues.push(y);
  }
  
  // Generate points string
  const points = yValues.map((y, i) => {
    const x = padding.left + (i / (numPoints - 1)) * chartWidth;
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg width={width} height={height} style={{ display: "block", margin: "8px auto" }}>
      {/* Grid lines */}
      {[-1, -0.5, 0, 0.5, 1].map((ratio, i) => {
        const y = baseY - ratio * (chartHeight * 0.4);
        return (
          <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} 
                stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
        );
      })}
      
      {/* Y-axis */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#374151" strokeWidth="1.5" />
      {/* X-axis */}
      <line x1={padding.left} y1={baseY} x2={width - padding.right} y2={baseY} stroke="#374151" strokeWidth="1.5" />
      
      {/* Mark the transition point (75%) - subtle indicator */}
      <line x1={padding.left + 0.75 * chartWidth} y1={padding.top} 
            x2={padding.left + 0.75 * chartWidth} y2={padding.top + chartHeight} 
            stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      
      {/* Y-axis labels with percentage values */}
      {[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = baseY - ratio * (chartHeight * 0.4);
        const value = Math.round(ratio * 100);
        if (Math.abs(value) % 25 === 0 || value === 0) { // Show 0, ±25%, ±50%, ±75%, ±100%
          return (
            <g key={i}>
              <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#374151" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
                {value > 0 ? `+${value}%` : `${value}%`}
              </text>
            </g>
          );
        }
        return null;
      })}
      
      {/* X-axis label */}
      <text x={padding.left + chartWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#6b7280">
        Time
      </text>
      
      {/* Chart line */}
      <polyline points={points} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Title */}
      <text x={width / 2} y={12} textAnchor="middle" fontSize="11" fill="#111" fontWeight="600">
        Stock Price Movement
      </text>
    </svg>
  );
}

function ProfitLossChart({ scenario = "profit" }) {
  const width = 150, height = 120;
  const padding = { top: 25, right: 10, bottom: 30, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baseY = padding.top + chartHeight;
  
  const pseudoRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  if (scenario === "profit") {
    // Stock rises after selling - more realistic with fluctuations
    const sellPoint = 0.45;
    const numPoints = 18;
    let lastY = baseY;
    const yValues = [];
    
    for (let i = 0; i < numPoints; i++) {
      const x = padding.left + (i / (numPoints - 1)) * chartWidth;
      const progress = i / (numPoints - 1);
      const beforeSell = progress < sellPoint;
      
      let y;
      if (beforeSell) {
        // Before selling: gradual rise with small fluctuations
        const trend = progress * 0.35;
        const wave = Math.sin(i * 0.4) * 0.06;
        const random = (pseudoRandom(i) - 0.5) * 0.05;
        const momentum = (lastY - baseY) / (chartHeight * 0.4) * 0.08;
        y = baseY - (trend + wave + random + momentum) * (chartHeight * 0.4);
      } else {
        // After selling: continues rising with more volatility (regret scenario)
        const upwardProgress = (progress - sellPoint) / (1 - sellPoint);
        const upwardTrend = upwardProgress * upwardProgress * 0.5; // Easing upward
        const volatility = Math.sin(i * 0.6) * 0.1;
        const random = (pseudoRandom(i) - 0.5) * 0.08;
        // Start from where we were at sell point
        const sellY = baseY - (sellPoint * 0.35 + Math.sin(sellPoint * numPoints * 0.4) * 0.06) * (chartHeight * 0.4);
        y = sellY - (upwardTrend + volatility + random) * (chartHeight * 0.5);
      }
      
      lastY = y;
      yValues.push({ x, y });
    }
    
    const points = yValues.map(p => `${p.x},${p.y}`).join(" ");
    return (
      <svg width={width} height={height} style={{ display: "block", margin: "4px auto" }}>
        {/* Grid */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight;
          return (
            <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} 
                  stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
          );
        })}
        
        {/* Axes */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={baseY} stroke="#374151" strokeWidth="1.5" />
        <line x1={padding.left} y1={baseY} x2={width - padding.right} y2={baseY} stroke="#374151" strokeWidth="1.5" />
        
        {/* Y-axis labels with percentage */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = baseY - ratio * (chartHeight * 0.5);
          const value = Math.round(ratio * 50); // 0% to +50%
          return (
            <g key={i}>
              <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#374151" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
                +{value}%
              </text>
            </g>
          );
        })}
        
        {/* Sell point marker */}
        <line x1={padding.left + sellPoint * chartWidth} y1={padding.top} 
              x2={padding.left + sellPoint * chartWidth} y2={baseY} 
              stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" />
        
        {/* Chart line */}
        <polyline points={points} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Labels */}
        <text x={padding.left + sellPoint * chartWidth} y={height - 8} textAnchor="middle" fontSize="8" fill="#ef4444" fontWeight="600">Sell</text>
        <text x={width / 2} y={12} textAnchor="middle" fontSize="10" fill="#111" fontWeight="600">Continues Rising</text>
      </svg>
    );
  } else {
    // Loss scenario - realistic declining pattern (loss increases downward)
    const numPoints = 18;
    const maxLoss = 30; // Maximum loss percentage
    let lastY = padding.top; // Start at top (0% loss)
    const yValues = [];
    
    for (let i = 0; i < numPoints; i++) {
      const x = padding.left + (i / (numPoints - 1)) * chartWidth;
      const progress = i / (numPoints - 1);
      
      // Loss increases as we go down
      const lossPercent = progress * maxLoss;
      const wave = Math.sin(i * 0.5) * 2; // Small volatility in loss
      const random = (pseudoRandom(i) - 0.5) * 1.5;
      const momentum = (lastY - padding.top) / chartHeight * 2;
      
      // Occasional small bounces (dead cat bounce) - temporary reduction in loss
      const bounce = progress > 0.3 && progress < 0.35 ? -1.5 : 0;
      
      const totalLoss = lossPercent + wave + random + momentum + bounce;
      // Loss increases downward, so y increases as loss increases
      const y = padding.top + (totalLoss / maxLoss) * chartHeight * 0.75;
      lastY = y;
      yValues.push({ x, y });
    }
    
    const points = yValues.map(p => `${p.x},${p.y}`).join(" ");
    return (
      <svg width={width} height={height} style={{ display: "block", margin: "4px auto" }}>
        {/* Grid */}
        {[0, 0.33, 0.67, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight * 0.75;
          return (
            <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} 
                  stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
          );
        })}
        
        {/* Axes */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight * 0.75} stroke="#374151" strokeWidth="1.5" />
        <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} stroke="#374151" strokeWidth="1.5" />
        
        {/* Y-axis labels - Loss increases downward */}
        {[0, 0.33, 0.67, 1].map((ratio, i) => {
          const y = padding.top + ratio * chartHeight * 0.75;
          const lossValue = Math.round(ratio * maxLoss);
          return (
            <g key={i}>
              <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#374151" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
                {lossValue}%
              </text>
            </g>
          );
        })}
        
        {/* Y-axis title */}
        <text x="15" y={padding.top + chartHeight * 0.375} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600" transform={`rotate(-90, 15, ${padding.top + chartHeight * 0.375})`}>
          Loss
        </text>
        
        {/* Chart line */}
        <polyline points={points} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Labels */}
        <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="9" fill="#6b7280">Time</text>
        <text x={width / 2} y={12} textAnchor="middle" fontSize="10" fill="#111" fontWeight="600">Continues Falling</text>
      </svg>
    );
  }
}

function RiskReturnComparison() {
  const width = 320, height = 180;
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const originX = padding.left;
  const originY = padding.top + chartHeight;
  
  return (
    <svg width={width} height={height} style={{ display: "block", margin: "8px auto" }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const x = originX + ratio * chartWidth;
        const y = originY - ratio * chartHeight;
        return (
          <g key={i}>
            <line x1={x} y1={originY} x2={x} y2={padding.top} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
            <line x1={originX} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
          </g>
        );
      })}
      
      {/* Axes */}
      <line x1={originX} y1={originY} x2={width - padding.right} y2={originY} stroke="#374151" strokeWidth="2" />
      <line x1={originX} y1={originY} x2={originX} y2={padding.top} stroke="#374151" strokeWidth="2" />
      
      {/* Y-axis labels with percentage values */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = originY - ratio * chartHeight;
        const returnValue = Math.round(ratio * 100);
        return (
          <g key={`y-${i}`}>
            <line x1={originX - 5} y1={y} x2={originX} y2={y} stroke="#374151" strokeWidth="1" />
            <text x={originX - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">
              {returnValue}%
            </text>
          </g>
        );
      })}
      
      {/* X-axis labels with percentage values */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const x = originX + ratio * chartWidth;
        const riskValue = Math.round(ratio * 100);
        return (
          <g key={`x-${i}`}>
            <line x1={x} y1={originY} x2={x} y2={originY + 5} stroke="#374151" strokeWidth="1" />
            <text x={x} y={originY + 18} textAnchor="middle" fontSize="9" fill="#6b7280">
              {riskValue}%
            </text>
          </g>
        );
      })}
      
      {/* Y-axis label */}
      <text x="15" y={height / 2} textAnchor="middle" fontSize="11" fill="#374151" fontWeight="600" transform={`rotate(-90, 15, ${height / 2})`}>
        Return (%)
      </text>
      
      {/* X-axis label */}
      <text x={width / 2} y={height - 12} textAnchor="middle" fontSize="11" fill="#374151" fontWeight="600">
        Risk (%)
      </text>
      
      {/* High risk/return line */}
      <line x1={originX} y1={originY} x2={width - padding.right} y2={padding.top} 
            stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={width - padding.right} cy={padding.top} r="5" fill="#22c55e" />
      <text x={width - padding.right} y={padding.top - 8} textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="600">
        High Risk/Return
      </text>
      
      {/* Low risk/return line */}
      <line x1={originX} y1={originY} x2={originX + chartWidth * 0.6} y2={originY - chartHeight * 0.2} 
            stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={originX + chartWidth * 0.6} cy={originY - chartHeight * 0.2} r="5" fill="#94a3b8" />
      <text x={originX + chartWidth * 0.6} y={originY - chartHeight * 0.2 - 8} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
        Low Risk/Return
      </text>
      
      {/* Title */}
      <text x={width / 2} y={12} textAnchor="middle" fontSize="11" fill="#111" fontWeight="600">
        Risk vs Return Trade-off
      </text>
    </svg>
  );
}

/**
 * Scoring:
 * - Key item: right-pole = 80, left-pole = 20
 * - Standard item: right-pole = 70, left-pole = 30
 * - Dimension thresholds: >=60 → right pole; <40 → left pole; 40–59 → use key-mean tiebreaker; else default left
 * Capacity flags (ability guardrails) will temper Risk Willingness B → S if any flag triggers.
 *
 * This version:
 * - Age input (not scored)
 * - Section 5: Age & Change now only 5.1–5.3 (ChangeIndex only)
 * - Former 5.4/5.5 moved to Section 2 as 2.5/2.6 (Risk Willingness + ChangeIndex)
 * - ChangeIndex (0–5) & direction (↑/→/↓)
 */

// ===== 16 archetype descriptions =====
const ARCHETYPE_DESCRIPTIONS = {
  "MSED":
    "The Steady Builder — Disciplined and dependable, this investor treats markets like a marathon, not a sprint. They plan carefully, trust process over emotion, and prefer gradual progress to sudden leaps. Years of experience have shaped their calm, rational approach to uncertainty. They appreciate structure — asset allocation models, diversification, and quarterly check-ins give them confidence. They aren’t swayed by headlines, preferring fundamentals and consistency. To them, wealth is the outcome of prudence, patience, and purpose.",
  "MSEC":
    "The Anxious Veteran — Highly motivated yet easily rattled, this investor has seen market cycles and knows both gains and pain. Despite their experience, they remain emotionally engaged — quick to check performance, quick to worry. They value their advisor’s reassurance and crave clarity when volatility strikes. They want their money to work hard, but they also need to feel safe. With consistent communication and data-driven reassurance, they can turn anxiety into confidence and keep long-term goals in focus.",
  "MBED":
    "The Confident Strategist — A decisive and analytical thinker, the Confident Strategist thrives on market insights. They see investing as a game of positioning — knowing when to take calculated risks and when to hold firm. Experience has sharpened their instincts; they understand drawdowns are part of the journey. They like bold ideas backed by evidence, and they expect advisors to bring intellectual rigor, not salesmanship. Challenge engages them; data convinces them. With the right partner, they can be visionary.",
  "MBEC":
    "The Overconfident Trader — Decades of wins — and a few spectacular losses — haven’t dulled this investor’s competitive streak. They enjoy the thrill of decision-making and tend to trust their gut, sometimes too much. They might trade too frequently or second-guess advice that contradicts their intuition. They believe markets reward conviction, but often underestimate risk. The right guidance channels their energy toward strategic, not reactive, moves — keeping boldness, but adding discipline.",
  "MSFD":
    "The Aspiring Learner — Curious, cautious, and eager to improve, this investor approaches markets like a student. They’re proactive about reading, asking questions, and learning how risk and return fit together. Though early in their journey, they value thoughtful structure and advisor mentorship. They don’t want to gamble — they want to grow wisely. They appreciate clarity and education, not jargon. When guided patiently, they can evolve into the kind of investor who succeeds quietly, through steady learning and good habits.",
  "MSFC":
    "The Cautious Beginner — Ambitious but nervous, this investor wants to make the “right” decisions yet fears making the wrong one. They tend to over-monitor performance and react to dips with worry. They appreciate reassurance and clear next steps. They benefit from simple, goal-based plans — automatic contributions, clear diversification, and regular touchpoints. Over time, their confidence grows with experience and consistent guidance, helping them replace hesitation with understanding.",
  "MBFD":
    "The Ambitious Upstart — Energetic, self-assured, and quick to act, this investor views opportunity as something to be seized, not studied. They’re learning fast and often take inspiration from successful peers. While they grasp risk in theory, they sometimes underestimate its emotional impact. Advisors can best support them by reinforcing frameworks, not rules — giving them flexibility while teaching patience. When balanced with discipline, their drive and curiosity can yield exceptional growth over time.",
  "MBFC":
    "The Thrill-Seeking Novice — This type thrives on excitement. Markets feel like a challenge — an arena where insight meets instinct. They enjoy trading, news, and trends, but often mistake noise for opportunity. Their enthusiasm is contagious but needs structure. Without it, impulsive decisions can erode returns. The right advisor doesn’t dampen their spirit but helps turn curiosity into informed conviction — channeling adrenaline into awareness.",
  "LSED":
    "The Relaxed Veteran — Financially comfortable and emotionally steady, this investor prizes peace of mind. They’ve built enough wealth to focus on preservation rather than chasing returns. They favor stability, income, and legacy planning. They don’t fear volatility — they simply prefer not to waste energy on it. Their trust is earned through quiet competence and respect for simplicity. They want a partner who listens first, then acts with purpose.",
  "LSEC":
    "The Hesitant Saver — Prudent to a fault, the Hesitant Saver has weathered many market turns and often regrets not acting sooner. They understand diversification and long-term compounding but still hesitate when it’s time to deploy capital. Fear of loss sometimes overshadows potential gain. The best approach is empathetic reassurance — highlighting data that reinforces prudence without paralysis. They value understanding more than persuasion.",
  "LBED":
    "The Opportunistic Veteran — Measured, discerning, and shrewd, this investor moves only when the odds feel right. They’ve learned patience from experience and act with confidence when they see genuine mispricing or value. They don’t chase trends; they wait for conviction. Advisors who respect their independence and bring differentiated insights will earn their engagement. They value dialogue grounded in logic, not enthusiasm.",
  "LBEC":
    "The Restless Veteran — Once deeply engaged with markets, they now trade partly for stimulation — to stay sharp, to stay interested. They know enough to succeed, but their motivation is emotional as much as financial. Market movement feels personal. A collaborative advisor can redirect this energy toward purposeful strategies: income harvesting, philanthropy, or impact investing. When focus returns, wisdom becomes their greatest edge.",
  "LSFD":
    "The Cautious Passive Investor — This investor appreciates simplicity. Index funds, balanced portfolios, and long-term compounding feel right to them. They prefer structure that runs quietly in the background while they focus on other aspects of life. They trust the process more than daily updates and value advisors who minimize stress. They want clarity without drama — thoughtful planning, low turnover, and calm professionalism.",
  "LSFC":
    "The Nervous Newbie — They’ve entered investing cautiously, often encouraged by family or peers. They want safety, but also feel left behind when markets move. Volatility unsettles them, so communication and education are crucial. Advisors who emphasize reassurance and progress — not perfection — help them stay invested through cycles. Their journey is about emotional comfort as much as financial return.",
  "LBFD":
    "The Curious Explorer — Adventurous yet observant, this investor enjoys exploring new opportunities — technology funds, global ideas, or thematic ETFs. They learn by doing and see investing as a way to stay intellectually engaged. While open to risk, they still value structure and explanation. Advisors who bring insights, stories, and perspective help them grow from curiosity to conviction — transforming experimentation into wisdom.",
  "LBFC":
    "The Casual Speculator — Markets are a hobby, not a mission. They enjoy reading financial news, trying ideas, and sometimes following tips — but without a deep plan. They see investing as part intuition, part entertainment. Advisors who keep things light yet educational can gradually build trust and structure around their behavior. Left unguided, they drift with trends; guided well, they mature into balanced investors who enjoy both the process and the purpose.",
};

// ===== Questions (Sections 1–4; Section 5 only has 5.1–5.3 now) =====
const QUESTIONS = [
  // ===== 1. Situation & Goals =====
  { code: "1.1", section: "Situation & Goals",
    text: "Imagine you plan to withdraw money from your investments in the near future. Would you rather begin withdrawals within the next few years or wait more than 10 years?",
    A: "Begin within a few years", B: "Wait over 10 years",
    dimension: "Motivation", isKey: true, weight: 1, high: "B" },
  { code: "1.2", section: "Situation & Goals",
    text: "Once withdrawals begin, would you prefer to draw funds over a short period (less than 5 years) or plan for a longer duration?",
    A: "Short period", B: "Long duration",
    dimension: "CapacityConstraint",
    cap: (opt)=>({ Short_Horizon_Flag: opt==="A" }) },
  { code: "1.3", section: "Situation & Goals",
    text: "If you had to choose an investment horizon, would you focus on the short term or long-term growth potential?",
    A: "Short term", B: "Long term",
    dimension: "Motivation", isKey: true, weight: 1, high: "B" },
  { code: "1.4", section: "Situation & Goals",
    text: "Suppose your main objective is to grow your wealth. Would you prefer to protect capital first or prioritize growth?",
    A: "Protect capital", B: "Prioritize growth",
    dimension: "Motivation", isKey: true, weight: 1, high: "B" },
  { code: "1.5", section: "Situation & Goals",
    text: "If you could choose between steady income today and long-term growth tomorrow, which would you prefer?",
    A: "Steady income", B: "Long-term growth",
    dimension: "Motivation", isKey: true, weight: 1, high: "B" },
  { code: "1.6", section: "Situation & Goals",
    text: "Imagine an investment that offers higher return potential but with larger losses possible in a given year. Would you accept it or prefer a safer alternative?",
    A: "Accept higher potential losses", B: "Choose safer option",
    dimension: "CapacityConstraint",
    cap: (opt)=>({ ConsistencyCheck: opt==="A" ? "Aggressive":"Conservative" }),
    visual: { type: "RiskReturnComparison", props: {} } },
  { code: "1.7", section: "Situation & Goals",
    text: "Suppose your annual income and net worth are limited. Would you still invest aggressively or remain conservative?",
    A: "Invest aggressively", B: "Remain conservative",
    dimension: "CapacityConstraint",
    cap: (opt)=>({ LowCapacity_Aggressive: opt==="A" }) },
  { code: "1.8", section: "Situation & Goals",
    text: "If a large share of your total liquid assets would be invested in one account, would you be comfortable concentrating or prefer spreading risk?",
    A: "Concentrate investment", B: "Spread risk",
    dimension: "CapacityConstraint",
    cap: (opt)=>({ Concentration_Flag: opt==="A" }) },
  { code: "1.9", section: "Situation & Goals",
    text: "Imagine you face an emergency expense. Would you rely on your portfolio or your separate emergency reserves?",
    A: "Use portfolio", B: "Use emergency reserves",
    dimension: "CapacityConstraint",
    cap: (opt)=>({ No_Emergency_Fund: opt==="A" }) },
  { code: "1.10", section: "Situation & Goals",
    text: "If you rely on this account for living expenses, would you draw regularly or preserve it for future use?",
    A: "Draw regularly", B: "Preserve for future",
    dimension: "Motivation", isKey:false, weight:1, high:"B" },

  // ===== 2. Risk Tolerance =====
  { code: "2.1", section: "Risk Tolerance",
    text: "If your portfolio dropped 25% in three months, would you sell part to reduce losses or hold through volatility?",
    A: "Sell part", B: "Hold through volatility",
    dimension: "RiskTolerance_Willingness", isKey:true, weight:1, high:"B",
    visual: { type: "PortfolioDropChart", props: { dropPercent: 25 } } },
  { code: "2.2", section: "Risk Tolerance",
    text: "If markets became volatile but with potential for higher returns, would you stay invested or reduce exposure?",
    A: "Stay invested", B: "Reduce exposure",
    dimension: "RiskTolerance_Willingness", isKey:false, weight:1, high:"A",
    visual: { type: "VolatilityChart", props: { type: "volatile" } } },
  { code: "2.3", section: "Risk Tolerance",
    text: "Imagine choosing between an investment with small steady gains and one with higher ups and downs. Which would you choose?",
    A: "Small steady gains", B: "Higher ups and downs",
    dimension: "RiskTolerance_Willingness", isKey:true, weight:1, high:"B",
    visualComparison: { A: { type: "ComparisonCharts", props: { type: "steady" } }, B: { type: "ComparisonCharts", props: { type: "volatile" } } } },
  { code: "2.4", section: "Risk Tolerance",
    text: "Would you feel comfortable with returns that differ greatly from the market index, or prefer to track the index closely?",
    A: "Comfortable with deviations", B: "Track the index closely",
    dimension: "RiskTolerance_Willingness", isKey:false, weight:1, high:"A" },

  // <-- moved from 5.4 / 5.5 to here -->
  { code: "2.5", section: "Risk Tolerance",
    text: "Gain frame: choose between a sure +4% or a 50% chance of +10% and 50% of 0%.",
    A: "Sure +4%", B: "50% chance +10% / 50% 0%",
    dimension: "RiskTolerance_Willingness", isKey: false, weight: 1, high: "B",
    visualComparison: { A: { type: "ProbabilityDiagram", props: { frame: "gain", option: "A" } }, B: { type: "ProbabilityDiagram", props: { frame: "gain", option: "B" } } } },
  { code: "2.6", section: "Risk Tolerance",
    text: "Loss frame: choose between a sure −4% or a 50% chance of −10% and 50% of 0%.",
    A: "Sure −4%", B: "50% chance −10% / 50% 0%",
    dimension: "RiskTolerance_Willingness", isKey: false, weight: 1, high: "B",
    visualComparison: { A: { type: "ProbabilityDiagram", props: { frame: "loss", option: "A" } }, B: { type: "ProbabilityDiagram", props: { frame: "loss", option: "B" } } } },

  // ===== 3. Age & Experience =====
  { code: "3.1", section: "Age & Experience",
    text: "When markets swing sharply, do you usually stay calm or feel anxious about potential losses?",
    A: "Stay calm", B: "Feel anxious",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"A",
    visual: { type: "MarketSwingChart", props: {} } },
  { code: "3.2", section: "Age & Experience",
    text: "Would you describe yourself as having long investing experience or being relatively new to it?",
    A: "Experienced", B: "New",
    dimension: "Experience", isKey:true, weight:1, high:"A" },
  { code: "3.3", section: "Age & Experience",
    text: "Have you personally experienced a major market downturn before?",
    A: "Yes", B: "No",
    dimension: "Experience", isKey:true, weight:1, high:"A" },
  { code: "3.4", section: "Age & Experience",
    text: "When hearing about a new investment product, would you assess it yourself or rely on professional advice?",
    A: "Assess myself", B: "Rely on advice",
    dimension: "Experience", isKey:false, weight:1, high:"A" },
  { code: "3.5", section: "Age & Experience",
    text: "Would you prefer to analyze data independently or depend on your advisor’s recommendations?",
    A: "Analyze independently", B: "Follow advisor recommendations",
    dimension: "Experience", isKey:false, weight:1, high:"A" },

  // ===== 4. Behavioral & Psychological =====
  { code: "4.1", section: "Behavioral & Psychological",
    text: "When markets drop suddenly, do you check your investments frequently or avoid looking for a while?",
    A: "Check frequently", B: "Avoid looking",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B",
    visual: { type: "PortfolioDropChart", props: { dropPercent: 20 } } },
  { code: "4.2", section: "Behavioral & Psychological",
    text: "If you sell a stock and it rises afterward, do you tend to regret the decision or move on quickly?",
    A: "Regret", B: "Move on quickly",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B",
    visual: { type: "ProfitLossChart", props: { scenario: "profit" } } },
  { code: "4.3", section: "Behavioral & Psychological",
    text: "Would you describe yourself as enjoying trading activity or preferring a long-term hands-off approach?",
    A: "Enjoy trading", B: "Hands-off approach",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },
  { code: "4.4", section: "Behavioral & Psychological",
    text: "When a friend makes quick profits, do you feel tempted to copy them or stick to your own plan?",
    A: "Copy them", B: "Stick to my plan",
    dimension: "BehavioralControl", isKey:true, weight:1, high:"B" },
  { code: "4.5", section: "Behavioral & Psychological",
    text: "If faced with uncertainty, do you prefer to make a quick decision or wait for more information?",
    A: "Make quick decision", B: "Wait for information",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },
  { code: "4.6", section: "Behavioral & Psychological",
    text: "After a profitable period, would you rather take profits quickly or let winners run longer?",
    A: "Take profits quickly", B: "Let winners run",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B",
    visual: { type: "ProfitablePeriodChart", props: {} } },
  { code: "4.7", section: "Behavioral & Psychological",
    text: "After losses, would you prefer to hold losers or sell quickly to move on?",
    A: "Hold losers", B: "Sell quickly",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B",
    visual: { type: "ProfitLossChart", props: { scenario: "loss" } } },
  { code: "4.8", section: "Behavioral & Psychological",
    text: "What is the largest one-year loss you could tolerate before reconsidering your plan — small or large?",
    A: "Small loss tolerance", B: "Large loss tolerance",
    dimension: "RiskTolerance_Willingness", isKey:true, weight:1, high:"B" },
  { code: "4.9", section: "Behavioral & Psychological",
    text: "During stressful markets, do you follow your rebalancing plan strictly or adjust emotionally?",
    A: "Follow plan", B: "Adjust emotionally",
    dimension: "BehavioralControl", isKey:true, weight:1, high:"A" },
  { code: "4.10", section: "Behavioral & Psychological",
    text: "In stressful times, would you prefer your advisor to reduce risk proactively or stay the course per plan?",
    A: "Reduce risk", B: "Stay the course",
    dimension: "RiskTolerance_Willingness", isKey:true, weight:1, high:"B" },

  // ===== 5. Age & Change (ChangeOnly) =====
  { code: "5.1", section: "Age & Change",
    text: "Compared to three years ago, when facing a 15% drawdown, are you now more likely to hold and rebalance or to de-risk?",
    A: "Hold & rebalance (more comfortable now)", B: "De-risk or sell (more cautious now)",
    dimension: "ChangeOnly", isKey: false },
  { code: "5.2", section: "Age & Change",
    text: "Compared to three years ago, your comfort with deviating from the index (tracking error) is:",
    A: "Higher now (more comfortable)", B: "Lower or the same (more cautious)",
    dimension: "ChangeOnly", isKey: false },
  { code: "5.3", section: "Age & Change",
    text: "Compared to three years ago, your tolerance for annual ups and downs is:",
    A: "Higher now", B: "Lower now",
    dimension: "ChangeOnly", isKey: false },
];

// === Polarity & defaults ===
const RIGHT_LEFT = {
  Motivation: ["M","L"],
  RiskTolerance_Willingness: ["B","S"],
  Experience: ["E","F"],
  BehavioralControl: ["D","C"],
};
const DEFAULT_GRAY = { Motivation:"L", RiskTolerance_Willingness:"S", Experience:"F", BehavioralControl:"D" };

function computeScores(answers){
  const capacity = { Short_Horizon_Flag:false, Concentration_Flag:false, No_Emergency_Fund:false, LowCapacity_Aggressive:false };
  const perDim = { Motivation:[], RiskTolerance_Willingness:[], Experience:[], BehavioralControl:[] };
  const stdLow=30,stdHigh=70,keyLow=20,keyHigh=80; const R=60,L=40;

  for(const q of QUESTIONS){
    const opt=answers[q.code]; if(!opt) continue;

    // capacity guardrails
    if(q.dimension==="CapacityConstraint" && q.cap){
      Object.assign(capacity, q.cap(opt));
      continue;
    }

    // only score the four core dimensions
    if(!(q.dimension in perDim)) continue;

    const towardRight = (opt === (q.high || "B"));
    const s = towardRight ? (q.isKey?keyHigh:stdHigh) : (q.isKey?keyLow:stdLow);
    perDim[q.dimension].push({ score:s, w:q.weight||1, isKey:!!q.isKey });
  }

  // dimension averages
  const dimScores={};
  for(const d of Object.keys(perDim)){
    const arr=perDim[d];
    if(!arr.length){ dimScores[d]=null; continue; }
    const w=arr.reduce((s,a)=>s+(a.w||1),0);
    const tot=arr.reduce((s,a)=>s+(a.score||0)*(a.w||1),0);
    dimScores[d]=Math.round((tot/w)*100)/100;
  }

  // polarity with thresholds + key tie-break
  const polarities={};
  for(const d of Object.keys(RIGHT_LEFT)){
    const sc=dimScores[d], [r,l]=RIGHT_LEFT[d];
    if(sc==null) { polarities[d]=DEFAULT_GRAY[d]; continue; }
    if(sc>=R) { polarities[d]=r; continue; }
    if(sc<L)  { polarities[d]=l; continue; }
    const keys=perDim[d].filter(a=>a.isKey);
    const km=keys.length?keys.reduce((s,a)=>s+a.score,0)/keys.length:NaN;
    if(!isNaN(km)&&km>=R) polarities[d]=r;
    else if(!isNaN(km)&&km<=L) polarities[d]=l;
    else polarities[d]=DEFAULT_GRAY[d];
  }

  // capacity tempering (B → S)
  const hard = capacity.Short_Horizon_Flag||capacity.Concentration_Flag||capacity.No_Emergency_Fund||capacity.LowCapacity_Aggressive;
  let riskLetter = polarities.RiskTolerance_Willingness||"S", capacityAdjusted=false;
  if(hard && riskLetter==="B"){ riskLetter="S"; capacityAdjusted=true; }

  const code = `${polarities.Motivation||"L"}${riskLetter}${polarities.Experience||"F"}${polarities.BehavioralControl||"D"}`;
  return { dimScores, polarities:{...polarities,RiskTolerance_Willingness:riskLetter}, archetype:code, capacity, capacityAdjusted };
}

// ChangeIndex: 5.1–5.3 A=“more daring”；2.5–2.6 B=“more daring”
function computeChangeIndex(ans){
  const more = ["5.1","5.2","5.3"].reduce((s,c)=> s + (ans[c]==="A" ? 1 : 0), 0);
  const extra = ["2.5","2.6"].reduce((s,c)=> s + (ans[c]==="B" ? 1 : 0), 0);
  const score = more + extra;   // 0–5
  let dir = "→";                // no clear change
  if (score >= 4) dir = "↑";    // more daring now
  else if (score <= 1) dir = "↓"; // more cautious now
  return { score, direction: dir };
}

// ===== Minimal, clean UI (no Tailwind) =====
const theme = {
  bg: "#fafafa", text: "#111", subtext: "#666", border: "#e6e6e6",
  card: "#fff", primary: "#111", muted: "#f2f2f2", green: "#22c55e"
};
const S = {
  page: { fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, Arial", background: theme.bg, color: theme.text, minHeight:"100vh" },
  wrap: { maxWidth: 980, margin: "0 auto", padding: "24px" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:12, marginBottom:16 },
  h1: { fontSize: 24, fontWeight: 800, margin: 0 },
  hint: { fontSize: 13, color: theme.subtext },
  progressBox: { width: 180 },
  progressBar: { height:8, background: theme.muted, borderRadius:999, overflow:"hidden" },
  progressInner: (w)=>({ width: w+"%", height:"100%", background: theme.primary, transition:"width .25s ease" }),
  grid: { display:"grid", gap:12 },
  card: { background: theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:16, boxShadow:"0 2px 8px rgba(0,0,0,.04)" },
  code: { fontSize:12, color: theme.subtext, marginBottom:6 },
  qtext: { fontWeight:600, marginBottom:10, lineHeight:1.35 },
  twoCols: { display:"grid", gap:10, gridTemplateColumns:"1fr 1fr" },
  radio: (active)=>({
    display:"flex", gap:10, alignItems:"flex-start",
    border:`1px solid ${active? theme.primary: theme.border}`,
    borderRadius:12, padding:"10px 12px", cursor:"pointer",
    background: "#fff",
    boxShadow: active? "0 2px 10px rgba(0,0,0,.06)" : "none",
    transition:"all .15s ease"
  }),
  small: { fontSize:12, color: theme.subtext },
  btnRow: { display:"flex", gap:10, marginTop:16 },
  btnPrimary: { background: theme.primary, color:"#fff", padding:"10px 16px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:600 },
  btnOutline: { background:"#fff", color:theme.text, padding:"10px 16px", borderRadius:14, border:`1px solid ${theme.border}`, cursor:"pointer", fontWeight:600 },
  result: { marginTop:16, border:`2px solid ${theme.text}`, borderRadius:16, padding:16 },
  resultHead: { display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:10 },
  badge: { border:`1px solid ${theme.border}`, padding:"4px 10px", borderRadius:999, fontSize:14 },
  stats: { display:"grid", gap:10, gridTemplateColumns:"repeat(4,minmax(0,1fr))" },
  statCard: { border:`1px solid ${theme.border}`, borderRadius:12, padding:12 },
  statTitle: { fontSize:12, color: theme.subtext },
  statScore: { fontSize:20, fontWeight:800 },
  statPol: { fontSize:13 },
  note: { marginTop:8, fontSize:13, color:theme.subtext },
  desc: { marginTop:14, padding:14, border:`1px dashed ${theme.border}`, borderRadius:12, background:"#fff" },
  descTitle: { fontSize:16, fontWeight:700, marginBottom:6 },
  descText: { fontSize:14, lineHeight:1.5, color: theme.text },
};

// Helper function to render visual components
function renderVisual(config) {
  if (!config) return null;
  const { type, props = {} } = config;
  const components = {
    PortfolioDropChart,
    VolatilityChart,
    ComparisonCharts,
    ProbabilityDiagram,
    InvestmentTrendChart,
    MarketSwingChart,
    ProfitLossChart,
    RiskReturnComparison,
    ProfitablePeriodChart,
  };
  const Component = components[type];
  return Component ? <Component {...props} /> : null;
}

function Radio({name,label,checked,onChange,desc,visual}) {
  return (
    <label style={S.radio(checked===label)}>
      <input type="radio" name={name} value={label} checked={checked===label} onChange={(e)=>onChange(e.target.value)} style={{marginTop:2}} />
      <div style={{width:"100%"}}>
        <div style={S.small}>Option {label}</div>
        <div style={{fontSize:14, lineHeight:1.35}}>{desc}</div>
        {visual && <div style={{marginTop:8}}>{renderVisual(visual)}</div>}
      </div>
    </label>
  );
}

function QuestionCard({q, value, set}) {
  return (
    <div style={S.card}>
      <div style={S.code}>{q.section} · {q.code} · {q.dimension}{q.isKey ? " · Key": ""}</div>
      <div style={S.qtext}>{q.text}</div>
      {q.visual && <div style={{marginBottom:12}}>{renderVisual(q.visual)}</div>}
      <div style={S.twoCols}>
        <Radio 
          name={q.code} 
          label="A" 
          checked={value} 
          onChange={(v)=>set(q.code,v)} 
          desc={q.A}
          visual={q.visualComparison?.A}
        />
        <Radio 
          name={q.code} 
          label="B" 
          checked={value} 
          onChange={(v)=>set(q.code,v)} 
          desc={q.B}
          visual={q.visualComparison?.B}
        />
      </div>
    </div>
  );
}

function Stat({title, score, pol}){
  return (
    <div style={S.statCard}>
      <div style={S.statTitle}>{title}</div>
      <div style={S.statScore}>{score ?? "-"}</div>
      <div style={S.statPol}>{pol || "-"}</div>
    </div>
  );
}

export default function App(){
  const [answers,setAnswers]=useState({});
  const [show,setShow]=useState(false);
  const [age, setAge] = useState("");

  const done = Object.keys(answers).filter(k=>answers[k]).length;
  const progress = Math.round((done/QUESTIONS.length)*100);

  const result = useMemo(()=>computeScores(answers),[answers]);
  const change = useMemo(()=>computeChangeIndex(answers), [answers]);
  const desc = ARCHETYPE_DESCRIPTIONS[result.archetype] || "No description available for this code.";

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* header */}
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>Plaza Financial Archetype — Questionnaire</h1>
            <p style={S.hint}>Choose A/B for each question. You can submit with partial answers.</p>
            {/* Age input */}
            <div style={{ display:"flex", gap:12, alignItems:"center", marginTop:8 }}>
              <label style={{ fontSize:13, color:"#666" }}>
                Age:&nbsp;
                <input
                  type="number" min="18" max="99" value={age}
                  onChange={(e)=>setAge(e.target.value)}
                  style={{ width:80, padding:"6px 8px", border:"1px solid #e6e6e6", borderRadius:8 }}
                />
              </label>
            </div>
          </div>
          <div>
            <div style={S.progressBox}>
              <div style={{textAlign:"right", fontSize:12, color:theme.subtext, marginBottom:4}}>{progress}%</div>
              <div style={S.progressBar}><div style={S.progressInner(progress)}/></div>
            </div>
          </div>
        </div>

        {/* questions */}
        <div style={S.grid}>
          {QUESTIONS.map(q=>(
            <QuestionCard key={q.code} q={q} value={answers[q.code]} set={(code,val)=>setAnswers(p=>({...p,[code]:val}))}/>
          ))}
        </div>

        {/* actions */}
        <div style={S.btnRow}>
          <button style={S.btnPrimary} onClick={()=>setShow(true)}>Compute Archetype</button>
          <button style={S.btnOutline} onClick={()=>{ setAnswers({}); setShow(false); setAge(""); }}>Reset</button>
        </div>

        {/* results */}
        {show && (
          <div style={S.result}>
            <div style={S.resultHead}>
              <div style={{fontSize:18, fontWeight:700}}>Results</div>
              <div style={S.badge}>Archetype: <b>{result.archetype}</b></div>
              <div style={S.badge}>Change vs 3y: <b>{change.direction}</b> <span style={{color:"#666"}}>({change.score}/5)</span></div>
              {age && <div style={S.badge}>Age: <b>{age}</b></div>}
              {result.capacityAdjusted && <div style={{...S.badge, borderColor: theme.green, color: theme.green}}>Capacity triggered → Risk set to S</div>}
            </div>

            <div style={S.stats}>
              <Stat title="Motivation"  score={result.dimScores?.Motivation}                 pol={result.polarities?.Motivation}/>
              <Stat title="RiskTol"     score={result.dimScores?.RiskTolerance_Willingness}  pol={result.polarities?.RiskTolerance_Willingness}/>
              <Stat title="Experience"  score={result.dimScores?.Experience}                  pol={result.polarities?.Experience}/>
              <Stat title="Control"     score={result.dimScores?.BehavioralControl}           pol={result.polarities?.BehavioralControl}/>
            </div>

            <p style={S.note}>
              Scoring bands: Standard 30/70; Key 20/80. Thresholds ≥60 → right pole (M/B/E/D); &lt;40 → left pole (L/S/F/C); gray zone uses key-item mean; conservative default. Capacity flags temper Risk Willingness (B → S) when triggered. Age and ChangeIndex are supplementary.
            </p>

            {/* archetype full description */}
            <div style={S.desc}>
              <div style={S.descTitle}>Archetype Profile — {result.archetype}</div>
              <div style={S.descText}>{desc}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
