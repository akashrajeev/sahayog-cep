import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { DISASTER_ICONS, MARKER_COLORS } from './DisasterMarkerStyles';

interface DisasterMapLegendProps {
  incidentCounts?: {
    indianRSS: number;
    internationalRSS: number;
    manual: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  className?: string;
}

const DisasterMapLegend: React.FC<DisasterMapLegendProps> = ({ 
  incidentCounts, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const MarkerDisplay = ({ 
    color, 
    shape = 'circle', 
    size = 'medium', 
    animated = false,
    icon = ''
  }: {
    color: string;
    shape?: 'circle' | 'triangle' | 'diamond' | 'hollow';
    size?: 'small' | 'medium' | 'large';
    animated?: boolean;
    icon?: string;
  }) => {
    const sizeMap = { small: 8, medium: 12, large: 16 };
    const markerSize = sizeMap[size];
    
    let markerStyle: React.CSSProperties = {
      width: markerSize,
      height: markerSize,
      backgroundColor: shape === 'hollow' ? 'transparent' : color,
      border: shape === 'hollow' ? `2px solid ${color}` : '2px solid white',
      display: 'inline-block',
      position: 'relative'
    };

    if (shape === 'circle' || shape === 'hollow') {
      markerStyle.borderRadius = '50%';
    } else if (shape === 'triangle') {
      markerStyle = {
        ...markerStyle,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderLeft: `${markerSize/2}px solid transparent`,
        borderRight: `${markerSize/2}px solid transparent`,
        borderBottom: `${markerSize}px solid ${color}`,
        border: 'none'
      };
    } else if (shape === 'diamond') {
      markerStyle.transform = 'rotate(45deg)';
    }

    if (animated) {
      markerStyle.animation = 'pulse 2s ease-in-out infinite';
    }

    return (
      <div style={markerStyle} className={animated ? 'marker-pulse' : ''}>
        {icon && (
          <span 
            style={{
              position: 'absolute',
              fontSize: '8px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              lineHeight: 1
            }}
          >
            {icon}
          </span>
        )}
      </div>
    );
  };

  const legendSections = [
    {
      id: 'sources',
      title: 'Data Sources',
      items: [
        {
          marker: <MarkerDisplay color={MARKER_COLORS.INDIAN_RSS} />,
          label: 'Indian RSS Feeds',
          description: 'National Disaster Management Authority (NDMA)',
          count: incidentCounts?.indianRSS
        },
        {
          marker: <MarkerDisplay color={MARKER_COLORS.INTERNATIONAL_RSS} />,
          label: 'International RSS',
          description: 'USGS, GDACS, ReliefWeb, NOAA',
          count: incidentCounts?.internationalRSS
        },
        {
          marker: <MarkerDisplay color={MARKER_COLORS.MANUAL} />,
          label: 'Manual Reports',
          description: 'User-submitted incident reports',
          count: incidentCounts?.manual
        }
      ]
    },
    {
      id: 'severity',
      title: 'Severity Levels',
      items: [
        {
          marker: <MarkerDisplay color={MARKER_COLORS.CRITICAL} shape="triangle" size="large" animated />,
          label: 'Critical',
          description: 'Immediate danger to life and property',
          count: incidentCounts?.critical
        },
        {
          marker: <MarkerDisplay color={MARKER_COLORS.HIGH} shape="triangle" />,
          label: 'High',
          description: 'Significant threat requiring urgent action',
          count: incidentCounts?.high
        },
        {
          marker: <MarkerDisplay color={MARKER_COLORS.MEDIUM} />,
          label: 'Medium',
          description: 'Moderate impact, monitor closely',
          count: incidentCounts?.medium
        },
        {
          marker: <MarkerDisplay color={MARKER_COLORS.LOW} shape="hollow" size="small" />,
          label: 'Low',
          description: 'Minor impact, general awareness',
          count: incidentCounts?.low
        }
      ]
    },
    {
      id: 'disasters',
      title: 'Disaster Types',
      items: [
        { marker: <MarkerDisplay color={MARKER_COLORS.CRITICAL} animated icon="🔥" />, label: 'Fire/Wildfire', description: 'Flickering animation' },
        { marker: <MarkerDisplay color={MARKER_COLORS.INTERNATIONAL_RSS} animated icon="🌊" />, label: 'Flood/Tsunami', description: 'Ripple effect' },
        { marker: <MarkerDisplay color={MARKER_COLORS.HIGH} animated icon="⚡" />, label: 'Earthquake', description: 'Pulsing movement' },
        { marker: <MarkerDisplay color={MARKER_COLORS.MEDIUM} animated icon="🌀" />, label: 'Cyclone/Storm', description: 'Spinning rotation' },
        { marker: <MarkerDisplay color={MARKER_COLORS.INDIAN_RSS} icon="🏔️" />, label: 'Landslide', description: 'Mountain regions' },
        { marker: <MarkerDisplay color={MARKER_COLORS.HIGH} icon="☀️" />, label: 'Heatwave', description: 'Temperature alerts' }
      ]
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure',
      items: [
        {
          marker: <MarkerDisplay color={MARKER_COLORS.HOSPITAL} shape="diamond" />,
          label: 'Hospitals',
          description: 'Healthcare facilities with emergency services'
        },
        {
          marker: <MarkerDisplay color={MARKER_COLORS.USER} />,
          label: 'Your Location',
          description: 'Current GPS position'
        },
        {
          marker: <MarkerDisplay color={MARKER_COLORS.ALERT} shape="triangle" animated />,
          label: 'Emergency Alerts',
          description: 'Active disaster warnings'
        }
      ]
    }
  ];

  return (
    <Card className={`absolute bottom-4 left-4 max-w-sm z-20 shadow-2xl legend-enter ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />
            Map Legend
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {legendSections.map((section) => (
              <div key={section.id} className="space-y-2">
                <h4 
                  className="font-semibold text-sm text-gray-700 cursor-pointer flex items-center gap-1"
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                >
                  {section.title}
                  <ChevronDown className={`w-3 h-3 transition-transform ${activeSection === section.id ? 'rotate-180' : ''}`} />
                </h4>
                
                {(activeSection === section.id || activeSection === null) && (
                  <div className="space-y-1.5">
                    {section.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 text-xs">
                        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                          {item.marker}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{item.label}</span>
                            {item.count !== undefined && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                {item.count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs truncate">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-2 border-t text-xs text-gray-400 space-y-1">
              <div>🔺 Triangle = High/Critical severity</div>
              <div>⬤ Circle = Medium/Normal severity</div>
              <div>◯ Hollow = Low severity</div>
              <div>💫 Animated = Active disaster</div>
            </div>
            
            <div className="pt-1 text-xs text-gray-400 text-center border-t">
              Real-time data • Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DisasterMapLegend;