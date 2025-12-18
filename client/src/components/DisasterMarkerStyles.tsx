import { Style, Icon, Circle as CircleStyle, Fill, Stroke, RegularShape } from 'ol/style';

// Disaster type to emoji mapping
export const DISASTER_ICONS: { [key: string]: string } = {
  fire: '🔥',
  flood: '🌊', 
  earthquake: '⚡',
  cyclone: '🌀',
  storm: '⛈️',
  landslide: '🏔️',
  heatwave: '☀️',
  drought: '🏜️',
  tsunami: '🌊',
  volcano: '🌋',
  tornado: '🌪️',
  avalanche: '❄️',
  wildfire: '🔥',
  typhoon: '🌀',
  hurricane: '🌀'
};

// Severity levels
export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high', 
  MEDIUM: 'medium',
  LOW: 'low'
};

// Color schemes
export const MARKER_COLORS = {
  // Source-based colors
  INDIAN_RSS: '#FF6B35',      // Orange for Indian RSS
  INTERNATIONAL_RSS: '#8B5CF6', // Purple for International RSS
  MANUAL: '#F59E0B',          // Yellow for Manual incidents
  
  // Severity colors
  CRITICAL: '#DC2626',        // Red
  HIGH: '#EF4444',           // Light Red
  MEDIUM: '#F59E0B',         // Orange
  LOW: '#10B981',            // Green
  
  // Other markers
  HOSPITAL: '#10B981',       // Green
  USER: '#3B82F6',          // Blue
  ALERT: '#DC2626'          // Red
};

/**
 * Creates a triangular marker for high severity incidents
 */
const createTriangleMarker = (color: string, size: number = 8) => {
  return new Style({
    image: new RegularShape({
      fill: new Fill({ color }),
      stroke: new Stroke({ color: 'white', width: 2 }),
      points: 3,
      radius: size,
      angle: 0
    })
  });
};

/**
 * Creates a circular marker for medium/low severity incidents
 */
const createCircleMarker = (color: string, size: number = 6, filled: boolean = true) => {
  return new Style({
    image: new CircleStyle({
      radius: size,
      fill: filled ? new Fill({ color }) : undefined,
      stroke: new Stroke({ 
        color: filled ? 'white' : color, 
        width: filled ? 2 : 3 
      })
    })
  });
};

/**
 * Creates marker style based on incident properties
 */
export const createIncidentMarkerStyle = (incident: any) => {
  const isRSSIncident = incident.source === 'RSS';
  const hasRegions = incident.affectedRegions && incident.affectedRegions.length > 0;
  
  // Determine base color by source
  let baseColor = MARKER_COLORS.MANUAL;
  if (isRSSIncident) {
    baseColor = incident.country === 'India' 
      ? MARKER_COLORS.INDIAN_RSS 
      : MARKER_COLORS.INTERNATIONAL_RSS;
  }
  
  // Override color if severity is available
  let finalColor = baseColor;
  let markerSize = 6;
  let useTriangle = false;
  
  if (incident.severity) {
    const severity = incident.severity.toLowerCase();
    switch (severity) {
      case 'critical':
      case 'extreme':
        finalColor = MARKER_COLORS.CRITICAL;
        markerSize = 10;
        useTriangle = true;
        break;
      case 'high':
      case 'severe':
        finalColor = MARKER_COLORS.HIGH;
        markerSize = 8;
        useTriangle = true;
        break;
      case 'medium':
      case 'moderate':
        finalColor = MARKER_COLORS.MEDIUM;
        markerSize = 7;
        break;
      case 'low':
      case 'minor':
        finalColor = MARKER_COLORS.LOW;
        markerSize = 5;
        break;
    }
  }
  
  // Increase size if has regions
  if (hasRegions) {
    markerSize += 2;
  }
  
  // Create appropriate marker shape
  if (useTriangle) {
    return createTriangleMarker(finalColor, markerSize);
  } else {
    const isFilled = incident.severity !== 'low';
    return createCircleMarker(finalColor, markerSize, isFilled);
  }
};

/**
 * Creates animated marker styles for active disasters
 */
export const createAnimatedMarkerStyle = (incident: any) => {
  const baseStyle = createIncidentMarkerStyle(incident);
  
  // Add animation class based on disaster type
  const disasterType = incident.type.toLowerCase();
  let animationClass = '';
  
  if (disasterType.includes('fire') || disasterType.includes('wildfire')) {
    animationClass = 'marker-flicker';
  } else if (disasterType.includes('flood') || disasterType.includes('tsunami')) {
    animationClass = 'marker-ripple';
  } else if (disasterType.includes('earthquake')) {
    animationClass = 'marker-pulse';
  } else if (disasterType.includes('storm') || disasterType.includes('cyclone')) {
    animationClass = 'marker-spin';
  }
  
  // Note: Animation will be handled via CSS classes
  // The style object doesn't directly support animations
  return baseStyle;
};

/**
 * Creates styles for other marker types
 */
export const createHospitalMarkerStyle = () => {
  return new Style({
    image: new RegularShape({
      fill: new Fill({ color: MARKER_COLORS.HOSPITAL }),
      stroke: new Stroke({ color: 'white', width: 2 }),
      points: 4,
      radius: 8,
      angle: Math.PI / 4 // 45 degree rotation to make diamond/cross shape
    })
  });
};

export const createUserLocationStyle = () => {
  return new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: MARKER_COLORS.USER }),
      stroke: new Stroke({ color: 'white', width: 3 })
    })
  });
};

export const createAlertMarkerStyle = (alert: any) => {
  let color = MARKER_COLORS.ALERT;
  let size = 8;
  
  switch (alert.severity) {
    case 'critical':
      size = 12;
      break;
    case 'high':
      size = 10;
      break;
    case 'medium':
      size = 8;
      break;
    case 'low':
      size = 6;
      break;
  }
  
  return createTriangleMarker(color, size);
};