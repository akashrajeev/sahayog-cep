import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface Alert {
  id: string;
  type: 'flood' | 'fire' | 'earthquake' | 'cyclone' | 'landslide' | 'heatwave' | 'storm';
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  affectedRadius?: number;
  evacuationRequired?: boolean;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    role: string;
  }>;
  timestamp: Date;
  isActive?: boolean;
}

export interface Incident {
  id: string;
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: Date;
  source?: string;
  affectedRegions?: string[];
  country?: string;
  severity?: string;
  sourceUrl?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  contact: string;
  lat: number;
  lng: number;
  distance?: number;
}

export interface NGO {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  services: string[];
  area: string;
  logo?: string;
}

interface DisasterContextType {
  alerts: Alert[];
  incidents: Incident[];
  hospitals: Hospital[];
  ngos: NGO[];
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp'>) => void;
  addNGO: (ngo: Omit<NGO, 'id'>) => void;
  getNearbyHospitals: (lat: number, lng: number, maxDistance?: number) => Hospital[];
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

// Transform API response to match our Alert interface
const transformAlert = (apiAlert: any): Alert => ({
  id: apiAlert._id || apiAlert.id.toString(),
  type: apiAlert.type.toLowerCase(),
  severity: apiAlert.severity.toLowerCase(),
  region: apiAlert.region,
  description: apiAlert.description || apiAlert.message,
  location: {
    lat: apiAlert.location?.lat || 0,
    lng: apiAlert.location?.lng || 0,
    address: apiAlert.location?.address || apiAlert.region,
  },
  affectedRadius: apiAlert.affectedRadius,
  evacuationRequired: apiAlert.evacuationRequired,
  emergencyContacts: apiAlert.emergencyContacts,
  timestamp: new Date(apiAlert.createdAt || apiAlert.timestamp || Date.now()),
  isActive: apiAlert.isActive !== false,
});

// Transform API incident to match our Incident interface
const transformIncident = (apiIncident: any): Incident => ({
  id: apiIncident._id || apiIncident.id,
  type: apiIncident.type,
  description: apiIncident.description,
  location: {
    lat: apiIncident.location.lat,
    lng: apiIncident.location.lng,
    address: apiIncident.location.address || '',
  },
  timestamp: new Date(apiIncident.timestamp || apiIncident.createdAt),
  source: apiIncident.source,
  affectedRegions: apiIncident.affectedRegions,
  country: apiIncident.country,
  severity: apiIncident.severity,
  sourceUrl: apiIncident.sourceUrl,
});

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'flood',
    severity: 'high',
    region: 'Kolkata, West Bengal',
    description: 'Severe flooding in low-lying areas due to heavy rainfall',
    location: { lat: 22.5726, lng: 88.3639, address: 'Kolkata, West Bengal' },
    affectedRadius: 8000,
    evacuationRequired: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '2',
    type: 'cyclone',
    severity: 'high',
    region: 'Odisha Coast',
    description: 'Cyclonic storm approaching coastal districts',
    location: { lat: 20.2961, lng: 85.8245, address: 'Bhubaneswar, Odisha' },
    affectedRadius: 15000,
    evacuationRequired: true,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '3',
    type: 'landslide',
    severity: 'medium',
    region: 'Darjeeling Hills',
    description: 'Landslide risk due to continuous rainfall in hill areas',
    location: { lat: 27.0238, lng: 88.2663, address: 'Darjeeling, West Bengal' },
    affectedRadius: 5000,
    evacuationRequired: false,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '4',
    type: 'heatwave',
    severity: 'medium',
    region: 'Delhi NCR',
    description: 'Extreme heat conditions, stay hydrated and avoid outdoor activities',
    location: { lat: 28.6139, lng: 77.2090, address: 'New Delhi' },
    affectedRadius: 25000,
    evacuationRequired: false,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isActive: true,
  },
];

const mockHospitals: Hospital[] = [
  // Pune Hospitals (Primary for your location)
  {
    id: '1',
    name: 'Ruby Hall Clinic',
    address: '40, Sassoon Road, Pune - 411001',
    contact: '+91-20-2613-5555',
    lat: 18.5089,
    lng: 73.8553,
  },
  {
    id: '2',
    name: 'Jehangir Hospital',
    address: '32, Sassoon Road, Pune - 411001',
    contact: '+91-20-2605-5000',
    lat: 18.5065,
    lng: 73.8530,
  },
  {
    id: '3',
    name: 'KEM Hospital',
    address: 'Rasta Peth, Pune - 411011',
    contact: '+91-20-2612-9801',
    lat: 18.5157,
    lng: 73.8507,
  },
  {
    id: '4',
    name: 'Deenanath Mangeshkar Hospital',
    address: 'Erandwane, Pune - 411004',
    contact: '+91-20-2560-3000',
    lat: 18.5089,
    lng: 73.8361,
  },
  {
    id: '5',
    name: 'Sancheti Hospital',
    address: 'Thube Park, Shivajinagar, Pune - 411005',
    contact: '+91-20-2553-3333',
    lat: 18.5314,
    lng: 73.8479,
  },
];

const mockNGOs: NGO[] = [
  {
    id: '1',
    name: 'Disaster Relief Foundation',
    contactPerson: 'Rajesh Kumar',
    phone: '+91-98765-43210',
    services: ['Food', 'Shelter', 'Medical'],
    area: 'West Bengal, Odisha',
  },
  {
    id: '2',
    name: 'Hope Rescue Team',
    contactPerson: 'Priya Sharma',
    phone: '+91-98765-43211',
    services: ['Rescue', 'Medical', 'Mental Health'],
    area: 'Pan India',
  },
  {
    id: '3',
    name: 'Community Care Initiative',
    contactPerson: 'Amit Patel',
    phone: '+91-98765-43212',
    services: ['Food', 'Shelter'],
    area: 'Eastern India',
  },
];

export const DisasterProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals);
  const [ngos, setNgos] = useState<NGO[]>(mockNGOs);

  // Fetch alerts on mount
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/alerts`)
      .then((res) => {
        const transformed = res.data.map(transformAlert);
        setAlerts(transformed.length ? transformed : mockAlerts);
      })
      .catch(() => {
        // Keep mock data on error
      });
  }, []);

  // Fetch incidents on mount
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/incidents`)
      .then((res) => {
        const transformed = res.data.map(transformIncident);
        setIncidents(transformed);
      })
      .catch(() => {
        // Keep empty on error
      });
  }, []);

  // Fetch hospitals on mount
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/hospitals`)
      .then((res) => {
        const transformed = res.data.map((item: any) => ({
          id: item._id || item.id,
          name: item.name,
          address: item.address,
          contact: item.contact,
          lat: item.lat,
          lng: item.lng,
        }));
        console.log('✅ Fetched hospitals from API:', transformed.length);
        console.log('Hospital data:', transformed);
        if (transformed.length > 0) {
          setHospitals(transformed);
        } else {
          console.log('⚠️ No hospitals from API, using mock data');
        }
      })
      .catch((error) => {
        console.error('Failed to fetch hospitals:', error);
        // Keep mock hospitals on error
      });
  }, []);

  // Fetch NGOs on mount
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/ngos`)
      .then((res) => {
        const transformed = res.data.map((item: any) => ({
          id: item._id,
          name: item.name,
          contactPerson: item.contactPerson,
          phone: item.phone,
          services: item.services,
          area: item.area,
        }));
        if (transformed.length) {
          setNgos(transformed);
        }
      })
      .catch(() => {});
  }, []);

  const addIncident = async (incident: Omit<Incident, 'id' | 'timestamp'>) => {
    try {
      const payload = {
        type: incident.type,
        description: incident.description,
        location: {
          lat: incident.location.lat,
          lng: incident.location.lng,
        },
      };
      const res = await axios.post(`${API_BASE}/api/incidents`, payload);
      const newIncident = transformIncident(res.data);
      setIncidents((prev) => [newIncident, ...prev]);
    } catch (err) {
      console.error('Failed to add incident:', err);
      // Fallback to local state
      const newIncident: Incident = {
        ...incident,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      setIncidents((prev) => [newIncident, ...prev]);
    }
  };

  const addNGO = async (ngo: Omit<NGO, 'id'>) => {
    try {
      const payload = {
        name: ngo.name,
        contactPerson: ngo.contactPerson,
        phone: ngo.phone,
        services: ngo.services,
        area: ngo.area,
      };
      const res = await axios.post(`${API_BASE}/api/ngos`, payload);
      const newNGO: NGO = {
        id: res.data._id || res.data.id,
        name: res.data.name,
        contactPerson: res.data.contactPerson,
        phone: res.data.phone,
        services: res.data.services,
        area: res.data.area,
      };
      setNgos((prev) => [newNGO, ...prev]);
      return;
    } catch (err) {
      console.error('Failed to add NGO:', err);
    }
    // Fallback to local state
    const newNGO: NGO = {
      ...ngo,
      id: Date.now().toString(),
    };
    setNgos((prev) => [newNGO, ...prev]);
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get nearby hospitals sorted by distance with intelligent filtering
  const getNearbyHospitals = (lat: number, lng: number, maxDistance: number = 100): Hospital[] => {
    const hospitalsWithDistance = hospitals.map(hospital => ({
      ...hospital,
      distance: calculateDistance(lat, lng, hospital.lat, hospital.lng)
    }));

    // Sort by distance
    const sortedByDistance = hospitalsWithDistance.sort((a, b) => a.distance - b.distance);

    // For Pune area (lat ~18.5, lng ~73.8), prioritize Pune hospitals
    if (lat >= 18.0 && lat <= 19.0 && lng >= 73.0 && lng <= 74.5) {
      console.log('📍 Pune location detected - prioritizing local hospitals');
      
      // Get Pune hospitals (within 50km) first, then others within maxDistance
      const puneHospitals = sortedByDistance.filter(h => h.distance <= 50);
      const otherNearbyHospitals = sortedByDistance.filter(h => h.distance > 50 && h.distance <= maxDistance);
      
      return [...puneHospitals, ...otherNearbyHospitals].slice(0, 10); // Limit to 10 hospitals
    }

    // For other locations, just return closest hospitals within maxDistance
    return sortedByDistance.filter(hospital => hospital.distance <= maxDistance).slice(0, 10);
  };

  return (
    <DisasterContext.Provider
      value={{
        alerts,
        incidents,
        hospitals,
        ngos,
        addIncident,
        addNGO,
        getNearbyHospitals,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within DisasterProvider');
  }
  return context;
};
