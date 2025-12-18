import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDisaster } from '@/context/DisasterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Hospital } from '@/context/DisasterContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const Hospitals = () => {
  const { t } = useTranslation();
  const { hospitals: contextHospitals, getNearbyHospitals } = useDisaster();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use context hospitals which are already fetched from the API
    setHospitals(contextHospitals);
    setLoading(false);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          
          // Get nearby hospitals using context function
          const nearbyHospitals = getNearbyHospitals(pos.coords.latitude, pos.coords.longitude, 200);
          console.log('📍 User location:', pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4));
          console.log('🏥 Nearby hospitals found:', nearbyHospitals.length);
          
          // Always show nearby hospitals if found, otherwise show all
          setHospitals(nearbyHospitals.length > 0 ? nearbyHospitals : contextHospitals);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Still show all hospitals even without location
        }
      );
    }
  }, [contextHospitals, getNearbyHospitals]);

  // Sort hospitals by distance if available, otherwise by name
  const sortedHospitals = hospitals.sort((a, b) => {
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            {t('hospitals.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('hospitals.subtitle')}
          </p>
          {userPosition && (
            <p className="text-sm text-blue-600 mt-2">
              📍 Showing hospitals near your location ({userPosition.lat.toFixed(4)}, {userPosition.lng.toFixed(4)})
              {userPosition.lat >= 18.0 && userPosition.lat <= 19.0 && userPosition.lng >= 73.0 && userPosition.lng <= 74.5 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Pune Area Detected</span>
              )}
            </p>
          )}
          {!userPosition && (
            <p className="text-sm text-orange-600 mt-2">
              🌍 Enable location services to see nearby hospitals in Pune
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading hospitals...</p>
          </div>
        ) : sortedHospitals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No hospitals found in your area.</p>
          </div>
        ) : (
        <div className="space-y-5">
          {sortedHospitals.map((hospital) => (
            <Card key={hospital.id} className="hover:shadow-lg transition-shadow border border-border">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                      <h3 className="text-xl font-bold text-foreground">
                        {hospital.name}
                      </h3>
                      {hospital.distance && (
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-medium">
                          {hospital.distance.toFixed(1)} km
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2.5 text-sm text-muted-foreground">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{hospital.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{hospital.contact}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-white"
                      size="sm"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`,
                          '_blank'
                        );
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border"
                      onClick={() => {
                        window.location.href = `tel:${hospital.contact}`;
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                    {t('hospitals.available')} 24/7
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default Hospitals;
