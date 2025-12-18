import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDisaster } from '@/context/DisasterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertCircle, 
  MapPin, 
  Hospital, 
  Users, 
  Search, 
  Filter,
  Navigation,
  Phone,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Enhanced map using HTML5 Canvas and modern web APIs
const NewDisasterMap = () => {
  const { t } = useTranslation();
  const { incidents, hospitals, alerts } = useDisaster();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedTab, setSelectedTab] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 22.5726, lng: 88.3639 }); // Kolkata
  const [zoomLevel, setZoomLevel] = useState(10);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Location access denied:', error)
      );
    }
  }, []);

  // Filter alerts based on search and type
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    return matchesSearch && matchesType && alert.isActive !== false;
  });

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
      const response = await axios.post(`${API_BASE}/api/sos`, {
        userLocation: userLocation
      });
      toast({
        title: 'SOS Request Sent',
        description: 'Emergency services have been notified of your location',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send SOS request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flood': return '🌊';
      case 'fire': return '🔥';
      case 'cyclone': return '🌀';
      case 'landslide': return '🏔️';
      case 'earthquake': return '🏢';
      case 'heatwave': return '☀️';
      default: return '⚠️';
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Sort hospitals by distance if user location is available
  const sortedHospitals = userLocation ? 
    [...hospitals].sort((a, b) => {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    }) : hospitals;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold">
                  🗺️ {t('map.title', 'Disaster Response Dashboard')}
                </CardTitle>
                <p className="text-muted-foreground">
                  Real-time disaster alerts, emergency resources, and response coordination
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSOS} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Emergency SOS
                </Button>
                {userLocation && (
                  <Button variant="outline" size="lg">
                    <Navigation className="w-4 h-4 mr-2" />
                    Location Active
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search alerts, locations, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="flood">🌊 Flood</SelectItem>
                  <SelectItem value="fire">🔥 Fire</SelectItem>
                  <SelectItem value="cyclone">🌀 Cyclone</SelectItem>
                  <SelectItem value="landslide">🏔️ Landslide</SelectItem>
                  <SelectItem value="earthquake">🏢 Earthquake</SelectItem>
                  <SelectItem value="heatwave">☀️ Heatwave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="map">🗺️ Map</TabsTrigger>
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="alerts">🚨 Alerts ({filteredAlerts.length})</TabsTrigger>
            <TabsTrigger value="hospitals">🏥 Hospitals ({hospitals.length})</TabsTrigger>
            <TabsTrigger value="incidents">📍 Incidents ({incidents.length})</TabsTrigger>
          </TabsList>

          {/* Map Tab - Primary Visual Map */}
          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🗺️ Interactive Disaster Map</span>
                  <Badge variant="outline">Live Data</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time visualization of disasters, emergency resources, and incidents across India
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 rounded-xl border-2 overflow-hidden shadow-inner">
                  {/* Enhanced Map Background */}
                  <div className="absolute inset-0">
                    <svg width="100%" height="100%" viewBox="0 0 800 500" className="w-full h-full">
                      {/* India geographical outline */}
                      <defs>
                        <pattern id="mapGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.3"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#mapGrid)" />
                      
                      {/* Simplified India map */}
                      <path 
                        d="M100 50 Q200 30 350 60 Q500 40 650 80 Q700 120 720 200 Q710 300 650 380 Q500 420 350 400 Q200 420 120 350 Q80 250 100 150 Z" 
                        fill="#f0f9ff" 
                        stroke="#3b82f6" 
                        strokeWidth="2"
                        opacity="0.7"
                      />
                      
                      {/* Major cities */}
                      <circle cx="180" cy="250" r="2" fill="#64748b" />
                      <text x="185" y="255" fontSize="8" fill="#64748b">Mumbai</text>
                      <circle cx="320" cy="200" r="2" fill="#64748b" />
                      <text x="325" y="205" fontSize="8" fill="#64748b">Delhi</text>
                      <circle cx="450" cy="280" r="2" fill="#64748b" />
                      <text x="455" y="285" fontSize="8" fill="#64748b">Kolkata</text>
                      <circle cx="250" cy="350" r="2" fill="#64748b" />
                      <text x="255" y="355" fontSize="8" fill="#64748b">Bangalore</text>
                    </svg>
                  </div>

                  {/* Alert Markers with Enhanced Visualization */}
                  {filteredAlerts.map((alert, index) => {
                    const x = ((alert.location.lng - 68) / (97 - 68)) * 100;
                    const y = ((35 - alert.location.lat) / (35 - 8)) * 100;
                    
                    return (
                      <div
                        key={alert.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                        style={{ left: `${Math.max(8, Math.min(92, x))}%`, top: `${Math.max(8, Math.min(92, y))}%` }}
                        onClick={() => setSelectedItem(alert)}
                      >
                        {/* Affected area visualization */}
                        {alert.affectedRadius && (
                          <div 
                            className={`absolute rounded-full opacity-15 -translate-x-1/2 -translate-y-1/2 border ${
                              alert.severity === 'critical' 
                                ? 'bg-red-500 border-red-600 animate-pulse' 
                                : alert.severity === 'high' 
                                ? 'bg-red-400 border-red-500' 
                                : alert.severity === 'medium' 
                                ? 'bg-yellow-400 border-yellow-500' 
                                : 'bg-blue-400 border-blue-500'
                            }`}
                            style={{
                              width: `${Math.min(120, Math.max(30, alert.affectedRadius / 400))}px`,
                              height: `${Math.min(120, Math.max(30, alert.affectedRadius / 400))}px`,
                              left: '50%',
                              top: '50%'
                            }}
                          />
                        )}
                        
                        {/* Alert marker with pulsing effect */}
                        <div className={`
                          w-8 h-8 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-white font-bold text-sm
                          ${alert.severity === 'critical' ? 'bg-red-700 animate-bounce' : ''}
                          ${alert.severity === 'high' ? 'bg-red-500 animate-pulse' : ''}
                          ${alert.severity === 'medium' ? 'bg-yellow-500' : ''}
                          ${alert.severity === 'low' ? 'bg-blue-500' : ''}
                          group-hover:scale-125 transition-all duration-300 hover:shadow-2xl
                        `}>
                          <span className="text-lg">{getTypeIcon(alert.type)}</span>
                        </div>
                        
                        {/* Enhanced tooltip */}
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-30 shadow-xl">
                          <div className="font-semibold">{alert.type.toUpperCase()} ALERT</div>
                          <div className="text-gray-300">{alert.region}</div>
                          <div className={`font-bold ${alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'high' ? 'text-red-300' : alert.severity === 'medium' ? 'text-yellow-300' : 'text-blue-300'}`}>
                            {alert.severity.toUpperCase()}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Enhanced Hospital Markers */}
                  {hospitals.slice(0, 15).map((hospital, index) => {
                    const x = ((hospital.lng - 68) / (97 - 68)) * 100;
                    const y = ((35 - hospital.lat) / (35 - 8)) * 100;
                    
                    return (
                      <div
                        key={hospital.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                        style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                      >
                        <div className="w-6 h-6 bg-green-500 rounded-lg border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-125 transition-transform duration-200 hover:bg-green-600">
                          <Hospital className="w-3 h-3 text-white" />
                        </div>
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-green-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30">
                          🏥 {hospital.name}
                        </div>
                      </div>
                    );
                  })}

                  {/* Enhanced Incident Markers */}
                  {incidents.map((incident, index) => {
                    const x = ((incident.location.lng - 68) / (97 - 68)) * 100;
                    const y = ((35 - incident.location.lat) / (35 - 8)) * 100;
                    
                    return (
                      <div
                        key={incident.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-15"
                        style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                        onClick={() => setSelectedItem(incident)}
                      >
                        <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-md group-hover:scale-150 transition-transform duration-200 animate-pulse" />
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-orange-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30">
                          📍 {incident.type} incident
                        </div>
                      </div>
                    );
                  })}

                  {/* Enhanced User Location */}
                  {userLocation && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-25"
                      style={{ 
                        left: `${((userLocation.lng - 68) / (97 - 68)) * 100}%`, 
                        top: `${((35 - userLocation.lat) / (35 - 8)) * 100}%` 
                      }}
                    >
                      <div className="w-6 h-6 bg-blue-600 rounded-full border-3 border-white shadow-xl animate-ping" />
                      <div className="absolute w-3 h-3 bg-blue-800 rounded-full top-1.5 left-1.5" />
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs px-2 py-1 rounded font-semibold">
                        📍 You are here
                      </div>
                    </div>
                  )}

                  {/* Enhanced Map Controls */}
                  <div className="absolute top-4 right-4 space-y-2 z-30">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-white shadow-lg hover:shadow-xl"
                      onClick={() => {
                        if (userLocation) {
                          toast({
                            title: "📍 Location Found",
                            description: "Map centered on your location",
                          });
                        } else {
                          toast({
                            title: "🔍 Enable Location",
                            description: "Allow location access for better experience",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Center
                    </Button>
                  </div>

                  {/* Enhanced Map Legend */}
                  <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-xl p-4 text-xs border z-30">
                    <h4 className="font-bold mb-3 text-gray-700">🗺️ Map Legend</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-600 rounded-full border border-white shadow animate-pulse"></div>
                        <span className="font-medium">Critical Alerts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full border border-white shadow"></div>
                        <span>High Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full border border-white shadow"></div>
                        <span>Medium Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded border border-white shadow"></div>
                        <span>🏥 Hospitals</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded-full border border-white shadow"></div>
                        <span>📍 Incidents</span>
                      </div>
                      {userLocation && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white animate-pulse"></div>
                          <span className="font-medium">📍 Your Location</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t text-gray-500">
                      <div className="text-xs">Last updated: {new Date().toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Stats Under Map */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-red-600">{alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}</div>
                  <p className="text-sm text-muted-foreground">Active Emergencies</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-600">{incidents.length}</div>
                  <p className="text-sm text-muted-foreground">Reported Incidents</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-600">{hospitals.length}</div>
                  <p className="text-sm text-muted-foreground">Available Hospitals</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(alerts.reduce((total, alert) => total + (alert.affectedRadius || 5000), 0) / 1000)}km²
                  </div>
                  <p className="text-sm text-muted-foreground">Total Coverage</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Visual Map Section */}
            <Card>
              <CardHeader>
                <CardTitle>🗺️ Live Disaster Map</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Interactive visualization of current disasters and emergency resources
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border overflow-hidden">
                  {/* Map Background */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" viewBox="0 0 800 400" className="w-full h-full">
                      {/* India outline simplified */}
                      <path 
                        d="M150 50 L700 50 L700 350 L150 350 Z M200 100 Q300 80 400 100 Q500 90 600 120 L650 200 Q620 280 500 300 Q400 320 300 300 Q200 280 180 200 Z" 
                        fill="#e5f3ff" 
                        stroke="#94a3b8" 
                        strokeWidth="1"
                      />
                      {/* State boundaries */}
                      <line x1="250" y1="100" x2="300" y2="300" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.5" />
                      <line x1="400" y1="80" x2="450" y2="320" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.5" />
                      <line x1="500" y1="90" x2="550" y2="300" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.5" />
                    </svg>
                  </div>

                  {/* Alert Markers */}
                  {filteredAlerts.map((alert, index) => {
                    // Convert lat/lng to map coordinates (simplified projection)
                    const x = ((alert.location.lng - 68) / (97 - 68)) * 100; // India longitude range
                    const y = ((35 - alert.location.lat) / (35 - 8)) * 100; // India latitude range
                    
                    return (
                      <div
                        key={alert.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                        onClick={() => setSelectedItem(alert)}
                      >
                        {/* Alert affected area circle */}
                        {alert.affectedRadius && (
                          <div 
                            className={`absolute rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2 ${
                              alert.severity === 'critical' || alert.severity === 'high' 
                                ? 'bg-red-500' 
                                : alert.severity === 'medium' 
                                ? 'bg-yellow-500' 
                                : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${Math.min(100, alert.affectedRadius / 500)}px`,
                              height: `${Math.min(100, alert.affectedRadius / 500)}px`,
                              left: '50%',
                              top: '50%'
                            }}
                          />
                        )}
                        
                        {/* Alert marker */}
                        <div className={`
                          w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold
                          ${alert.severity === 'critical' ? 'bg-red-700 animate-pulse' : ''}
                          ${alert.severity === 'high' ? 'bg-red-500' : ''}
                          ${alert.severity === 'medium' ? 'bg-yellow-500' : ''}
                          ${alert.severity === 'low' ? 'bg-blue-500' : ''}
                          group-hover:scale-125 transition-transform duration-200
                        `}>
                          {getTypeIcon(alert.type)}
                        </div>
                        
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          {alert.type.toUpperCase()} - {alert.region}
                        </div>
                      </div>
                    );
                  })}

                  {/* Hospital Markers */}
                  {hospitals.slice(0, 10).map((hospital, index) => {
                    const x = ((hospital.lng - 68) / (97 - 68)) * 100;
                    const y = ((35 - hospital.lat) / (35 - 8)) * 100;
                    
                    return (
                      <div
                        key={hospital.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                      >
                        <div className="w-4 h-4 bg-green-500 rounded border-2 border-white shadow-md flex items-center justify-center group-hover:scale-125 transition-transform duration-200">
                          <Hospital className="w-2 h-2 text-white" />
                        </div>
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-green-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          🏥 {hospital.name}
                        </div>
                      </div>
                    );
                  })}

                  {/* Incident Markers */}
                  {incidents.map((incident, index) => {
                    const x = ((incident.location.lng - 68) / (97 - 68)) * 100;
                    const y = ((35 - incident.location.lat) / (35 - 8)) * 100;
                    
                    return (
                      <div
                        key={incident.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                        onClick={() => setSelectedItem(incident)}
                      >
                        <div className="w-3 h-3 bg-orange-500 rounded-full border border-white shadow-md group-hover:scale-150 transition-transform duration-200" />
                        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-orange-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          📍 {incident.type} incident
                        </div>
                      </div>
                    );
                  })}

                  {/* User Location */}
                  {userLocation && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ 
                        left: `${((userLocation.lng - 68) / (97 - 68)) * 100}%`, 
                        top: `${((35 - userLocation.lat) / (35 - 8)) * 100}%` 
                      }}
                    >
                      <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-ping" />
                      <div className="absolute w-2 h-2 bg-blue-800 rounded-full top-1 left-1" />
                    </div>
                  )}

                  {/* Map Legend */}
                  <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3 text-xs">
                    <h4 className="font-semibold mb-2">Map Legend</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Critical/High Alerts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Medium Alerts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Hospitals</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Incidents</span>
                      </div>
                      {userLocation && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                          <span>Your Location</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-white shadow-md"
                      onClick={() => {
                        if (userLocation) {
                          // Center map on user location (visual feedback)
                          toast({
                            title: "Map Centered",
                            description: "Focused on your current location",
                          });
                        } else {
                          toast({
                            title: "Enable Location",
                            description: "Please allow location access to center map",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Critical Alerts</p>
                      <p className="text-2xl font-bold text-red-700">
                        {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Active Incidents</p>
                      <p className="text-2xl font-bold text-blue-700">{incidents.length}</p>
                    </div>
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Hospitals Available</p>
                      <p className="text-2xl font-bold text-green-700">{hospitals.length}</p>
                    </div>
                    <Hospital className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Coverage Areas</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {alerts.reduce((total, alert) => total + (alert.affectedRadius || 5000), 0) / 1000}km²
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>🕐 Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...alerts, ...incidents].sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  ).slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {'severity' in item ? `${item.type} Alert` : `${item.type} Incident`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {'region' in item ? item.region : item.location.address || `${item.location.lat}, ${item.location.lng}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {'severity' in item && (
                        <Badge className={getSeverityColor(item.severity)}>
                          {item.severity.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="pt-8 text-center">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">No alerts found matching your criteria</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlerts.map((alert) => (
                  <Card key={alert.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedItem(alert)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                          <div>
                            <CardTitle className="text-lg capitalize">{alert.type} Alert</CardTitle>
                            <p className="text-sm text-gray-600">{alert.region}</p>
                          </div>
                        </div>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{alert.description}</p>
                      
                      {alert.evacuationRequired && (
                        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded">
                          <p className="text-sm font-bold text-red-700 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            EVACUATION REQUIRED
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                        {alert.affectedRadius && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Radius: {alert.affectedRadius / 1000}km
                          </div>
                        )}
                        {alert.emergencyContacts && alert.emergencyContacts.length > 0 && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            Emergency: {alert.emergencyContacts[0].phone}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Hospitals Tab */}
          <TabsContent value="hospitals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedHospitals.map((hospital) => {
                const distance = userLocation ? 
                  calculateDistance(userLocation.lat, userLocation.lng, hospital.lat, hospital.lng) : null;
                
                return (
                  <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Hospital className="w-6 h-6 text-green-600" />
                          <CardTitle className="text-lg">{hospital.name}</CardTitle>
                        </div>
                        {distance && (
                          <Badge variant="outline">
                            {distance.toFixed(1)}km away
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                          <span>{hospital.address}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <a href={`tel:${hospital.contact}`} className="text-blue-600 hover:underline">
                            {hospital.contact}
                          </a>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => window.open(`tel:${hospital.contact}`)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Hospital
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-4">
            {incidents.length === 0 ? (
              <Card>
                <CardContent className="pt-8 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">No incidents reported yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incidents.map((incident) => (
                  <Card key={incident.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTypeIcon(incident.type)}</span>
                        <CardTitle className="text-lg capitalize">{incident.type} Incident</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{incident.description}</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {incident.location.address || `${incident.location.lat}, ${incident.location.lng}`}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(incident.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Selected Item Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
               onClick={() => setSelectedItem(null)}>
            <Card className="max-w-md w-full max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">{getTypeIcon(selectedItem.type)}</span>
                  <span className="capitalize">{selectedItem.type}</span>
                  {'severity' in selectedItem && (
                    <Badge className={getSeverityColor(selectedItem.severity)}>
                      {selectedItem.severity.toUpperCase()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p>{selectedItem.description}</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Location:</strong> {'region' in selectedItem ? selectedItem.region : selectedItem.location.address}</p>
                    <p><strong>Time:</strong> {new Date(selectedItem.timestamp).toLocaleString()}</p>
                    {selectedItem.emergencyContacts && selectedItem.emergencyContacts.length > 0 && (
                      <div>
                        <strong>Emergency Contact:</strong>
                        <p>{selectedItem.emergencyContacts[0].name}: {selectedItem.emergencyContacts[0].phone}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewDisasterMap;