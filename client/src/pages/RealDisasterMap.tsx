import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDisaster } from '@/context/DisasterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  MapPin, 
  Hospital, 
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import RegionHighlight from '@/components/RegionHighlight';
import DisasterMapLegend from '@/components/DisasterMapLegend';
import { 
  createIncidentMarkerStyle, 
  createHospitalMarkerStyle, 
  createUserLocationStyle, 
  createAlertMarkerStyle,
  DISASTER_ICONS
} from '@/components/DisasterMarkerStyles';
import '@/components/MarkerAnimations.css';
import 'ol/ol.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Helper function to determine animation type based on disaster type
const getAnimationType = (disasterType: string) => {
  const type = disasterType.toLowerCase();
  if (type.includes('fire') || type.includes('wildfire')) return 'flicker';
  if (type.includes('flood') || type.includes('tsunami')) return 'ripple';
  if (type.includes('earthquake')) return 'pulse';
  if (type.includes('storm') || type.includes('cyclone') || type.includes('hurricane')) return 'spin';
  return 'bounce'; // default animation
};

const RealDisasterMap = () => {
  const { t } = useTranslation();
  const { incidents, hospitals, alerts } = useDisaster();
  const { toast } = useToast();
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [hoveredIncident, setHoveredIncident] = useState<any>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const vectorSource = useRef<VectorSource>(new VectorSource());

  // Calculate incident counts for legend
  const incidentCounts = {
    indianRSS: incidents.filter(i => i.source === 'RSS' && i.country === 'India').length,
    internationalRSS: incidents.filter(i => i.source === 'RSS' && i.country !== 'India').length,
    manual: incidents.filter(i => i.source === 'manual' || i.source !== 'RSS').length,
    critical: incidents.filter(i => i.severity && ['critical', 'extreme'].includes(i.severity.toLowerCase())).length,
    high: incidents.filter(i => i.severity && ['high', 'severe'].includes(i.severity.toLowerCase())).length,
    medium: incidents.filter(i => i.severity && ['medium', 'moderate'].includes(i.severity.toLowerCase())).length,
    low: incidents.filter(i => i.severity && ['low', 'minor'].includes(i.severity.toLowerCase())).length
  };

  // Add hover functionality
  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;
    
    const handlePointerMove = (evt: any) => {
      const pixel = mapInstance.getEventPixel(evt.originalEvent);
      const feature = mapInstance.forEachFeatureAtPixel(pixel, (feature) => feature);
      
      if (feature && feature.get('type') === 'incident') {
        const incident = feature.get('incident');
        if (incident && incident.affectedRegions && incident.affectedRegions.length > 0) {
          setHoveredIncident(incident);
          setHoverPosition({ 
            x: evt.originalEvent.clientX, 
            y: evt.originalEvent.clientY 
          });
          mapInstance.getTargetElement().style.cursor = 'pointer';
        } else {
          setHoveredIncident(null);
          setHoverPosition(null);
          mapInstance.getTargetElement().style.cursor = 'default';
        }
      } else {
        setHoveredIncident(null);
        setHoverPosition(null);
        mapInstance.getTargetElement().style.cursor = 'default';
      }
    };

    mapInstance.on('pointermove', handlePointerMove);

    return () => {
      mapInstance.un('pointermove', handlePointerMove);
    };
  }, [mapLoaded]);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Create vector layer for markers
    const vectorLayer = new VectorLayer({
      source: vectorSource.current,
    });

    // Create map with OpenStreetMap tiles (free, no API key needed)
    map.current = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new OSM(), // Free OpenStreetMap tiles
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([77.5946, 20.5937]), // Center of India
        zoom: 6,
      }),
    });

    setMapLoaded(true);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(userCoords);
          addUserLocationMarker(userCoords);
        },
        (error) => console.log('Location access denied:', error)
      );
    }

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
      }
    };
  }, []);

  // Add user location marker
  const addUserLocationMarker = (coords: [number, number]) => {
    if (!map.current) return;

    const userFeature = new Feature({
      geometry: new Point(fromLonLat(coords)),
      type: 'user',
      name: 'Your Location'
    });

    userFeature.setStyle(createUserLocationStyle());
    vectorSource.current.addFeature(userFeature);
  };

  // Add data to map when available
  const addDataToMap = () => {
    if (!map.current || !mapLoaded) return;

    // Clear existing features except user location
    const features = vectorSource.current.getFeatures();
    features.forEach(feature => {
      if (feature.get('type') !== 'user') {
        vectorSource.current.removeFeature(feature);
      }
    });

    // Add alerts
    alerts.forEach((alert) => {
      if (alert.location && alert.isActive !== false) {
        const alertFeature = new Feature({
          geometry: new Point(fromLonLat([alert.location.lng, alert.location.lat])),
          type: 'alert',
          alert: alert
        });

        alertFeature.setStyle(createAlertMarkerStyle(alert));
        vectorSource.current.addFeature(alertFeature);
      }
    });

    // Add hospitals
    console.log('🏥 Adding hospitals to map:', hospitals.length);
    hospitals.forEach((hospital, index) => {
      console.log(`Adding hospital ${index + 1}:`, hospital.name, `at [${hospital.lng}, ${hospital.lat}]`);
      const hospitalFeature = new Feature({
        geometry: new Point(fromLonLat([hospital.lng, hospital.lat])),
        type: 'hospital',
        hospital: hospital
      });

      hospitalFeature.setStyle(createHospitalMarkerStyle());
      vectorSource.current.addFeature(hospitalFeature);
    });

    // Add incidents with enhanced markers
    incidents.forEach((incident) => {
      const incidentFeature = new Feature({
        geometry: new Point(fromLonLat([incident.location.lng, incident.location.lat])),
        type: 'incident',
        incident: incident
      });

      // Use enhanced marker styling with severity-based shapes and animations
      incidentFeature.setStyle(createIncidentMarkerStyle(incident));
      
      // Add animation class for active disasters
      const element = incidentFeature.getGeometry();
      if (element && incident.severity && ['critical', 'high'].includes(incident.severity.toLowerCase())) {
        // Animation will be handled via CSS classes in the DOM
        incidentFeature.set('animated', true);
        incidentFeature.set('animationType', getAnimationType(incident.type));
      }

      vectorSource.current.addFeature(incidentFeature);
    });
  };

  // Update markers when data changes
  useEffect(() => {
    if (mapLoaded) {
      addDataToMap();
    }
  }, [alerts, hospitals, incidents, mapLoaded]);

  const handleSOS = async () => {
    if (!userLocation) {
      toast({
        title: 'Location Required',
        description: 'Please enable location services to send SOS request',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userLocation: { lat: userLocation[1], lng: userLocation[0] }
        }),
      });
      
      if (response.ok) {
        toast({
          title: 'SOS Request Sent',
          description: 'Emergency services have been notified of your location',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send SOS request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Add click interaction
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    map.current.on('click', (evt) => {
      const feature = map.current!.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      
      if (feature) {
        const featureType = feature.get('type');
        
        if (featureType === 'alert') {
          const alert = feature.get('alert');
          const alertIcon = DISASTER_ICONS[alert.type.toLowerCase()] || '⚠️';
          const severityColors = {
            critical: '🔴',
            high: '🟡', 
            medium: '🟠',
            low: '🟢'
          };
          const severityIcon = severityColors[alert.severity as keyof typeof severityColors] || '⚪';
          
          toast({
            title: `${alertIcon} ${alert.type.toUpperCase()} Alert ${severityIcon}`,
            description: `${alert.severity?.toUpperCase()} severity in ${alert.region}`,
          });
        } else if (featureType === 'hospital') {
          const hospital = feature.get('hospital');
          toast({
            title: `🏥 ${hospital.name}`,
            description: `📞 ${hospital.contact} • Emergency Services Available`,
          });
        } else if (featureType === 'incident') {
          const incident = feature.get('incident');
          const incidentIcon = DISASTER_ICONS[incident.type.toLowerCase()] || '📍';
          const sourceInfo = incident.source === 'RSS' 
            ? `${incident.country === 'India' ? '🇮🇳' : '🌍'} RSS Feed` 
            : '👤 Manual Report';
          const severityInfo = incident.severity 
            ? ` • ${incident.severity.toUpperCase()} severity`
            : '';
          
          toast({
            title: `${incidentIcon} ${incident.type.toUpperCase()} Incident`,
            description: `${sourceInfo}${severityInfo}\n${incident.description.substring(0, 100)}${incident.description.length > 100 ? '...' : ''}`,
          });
        }
      }
    });

    map.current.getViewport().style.cursor = 'default';
    map.current.on('pointermove', (evt) => {
      const feature = map.current!.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      map.current!.getViewport().style.cursor = feature ? 'pointer' : 'default';
    });
  }, [mapLoaded, toast]);

  const centerOnUser = () => {
    if (userLocation && map.current) {
      map.current.getView().animate({
        center: fromLonLat(userLocation),
        zoom: 12,
        duration: 1000
      });
      toast({
        title: '📍 Centered on your location',
        description: 'Map focused on your current position',
      });
    } else {
      toast({
        title: 'Location not available',
        description: 'Please enable location services',
        variant: 'destructive',
      });
    }
  };

  const centerOnIndia = () => {
    if (map.current) {
      map.current.getView().animate({
        center: fromLonLat([77.5946, 20.5937]),
        zoom: 6,
        duration: 1000
      });
      toast({
        title: '🗺️ Map Reset',
        description: 'View reset to India overview',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center space-x-2">
                  <span>🗺️ Real-Time Disaster Map</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">Live</Badge>
                </CardTitle>
                <p className="text-muted-foreground">
                  Interactive satellite map with real locations and live disaster data
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSOS} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Emergency SOS
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
              </div>
              <p className="text-sm text-red-700">Critical Alerts</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{incidents.length}</div>
              <p className="text-sm text-orange-700">Active Incidents</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-green-600">{hospitals.length}</div>
              <p className="text-sm text-green-700">Hospitals Available</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {alerts.filter(a => a.isActive !== false).length}
              </div>
              <p className="text-sm text-blue-700">Active Alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Map Container */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Interactive Disaster Map</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button onClick={centerOnUser} size="sm" variant="outline">
                  <Navigation className="w-4 h-4 mr-1" />
                  My Location
                </Button>
                <Button onClick={centerOnIndia} size="sm" variant="outline">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <div 
                ref={mapContainer} 
                className="w-full h-[600px]"
                style={{ minHeight: '600px' }}
              />
              
              {/* Enhanced Interactive Legend */}
              <DisasterMapLegend 
                incidentCounts={incidentCounts}
                className="transition-all duration-300 hover:shadow-2xl"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .ol-zoom {
          top: 0.5em;
          right: 0.5em;
          left: auto;
        }
        .ol-control {
          background-color: rgba(255,255,255,0.8);
          border-radius: 4px;
        }
        .ol-control button {
          background-color: rgba(255,255,255,0.8);
          border: none;
          color: #333;
          font-size: 1.14em;
          font-weight: bold;
          text-decoration: none;
          padding: 0.25em;
          border-radius: 2px;
        }
        .ol-control button:hover {
          background-color: rgba(255,255,255,1);
        }
      `}</style>
      
      {/* Region Highlight Popup */}
      {hoveredIncident && hoverPosition && hoveredIncident.affectedRegions && (
        <div 
          style={{
            position: 'fixed',
            left: hoverPosition.x + 10,
            top: hoverPosition.y - 10,
            zIndex: 1000,
            pointerEvents: 'none',
            maxWidth: '300px'
          }}
        >
          <RegionHighlight
            regions={hoveredIncident.affectedRegions}
            country={hoveredIncident.country}
            severity={hoveredIncident.severity}
            source={hoveredIncident.source}
          />
        </div>
      )}
    </div>
  );
};

export default RealDisasterMap;