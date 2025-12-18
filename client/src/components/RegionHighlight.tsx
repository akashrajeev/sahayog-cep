import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe } from 'lucide-react';

interface RegionHighlightProps {
  regions: string[];
  country?: string;
  severity?: string;
  source?: string;
}

const RegionHighlight: React.FC<RegionHighlightProps> = ({ 
  regions, 
  country, 
  severity, 
  source 
}) => {
  if (!regions || regions.length === 0) return null;

  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'bg-gray-100 text-gray-800';
    
    switch (severity.toLowerCase()) {
      case 'extreme':
      case 'severe':
        return 'bg-red-100 text-red-800';
      case 'moderate':
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-2 p-3 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-sm">Affected Areas</span>
        {country && (
          <Badge variant="outline" className="text-xs">
            {country}
          </Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1">
        {regions.map((region, index) => (
          <Badge 
            key={index} 
            className={`text-xs ${getSeverityColor(severity)}`}
            variant="secondary"
          >
            <MapPin className="h-3 w-3 mr-1" />
            {region}
          </Badge>
        ))}
      </div>
      
      {source === 'RSS' && (
        <div className="text-xs text-gray-500 mt-1">
          Live data from RSS feed
        </div>
      )}
      
      {severity && (
        <div className="text-xs">
          <span className="text-gray-500">Severity: </span>
          <span className={`font-medium ${
            severity.toLowerCase().includes('severe') || severity.toLowerCase().includes('extreme')
              ? 'text-red-600' 
              : severity.toLowerCase().includes('moderate')
              ? 'text-orange-600'
              : 'text-blue-600'
          }`}>
            {severity}
          </span>
        </div>
      )}
    </div>
  );
};

export default RegionHighlight;