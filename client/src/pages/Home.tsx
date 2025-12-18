import { useTranslation } from 'react-i18next';
import { useDisaster } from '@/context/DisasterContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AlertCard from '@/components/AlertCard';
import { AlertCircle, FileText, Hospital, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Home = () => {
  const { t } = useTranslation();
  const { alerts, hospitals, incidents } = useDisaster();
  const navigate = useNavigate();
  const [sosOpen, setSosOpen] = useState(false);
  const [nearestHospital, setNearestHospital] = useState(hospitals[0]);

  // Combine system alerts with reported incidents
  const allAlerts = [
    ...alerts,
    ...incidents.map((incident) => ({
      id: `incident-${incident.id}`,
      type: incident.type,
      severity: 'high' as const,
      region: `${incident.location.lat.toFixed(2)}, ${incident.location.lng.toFixed(2)}`,
      description: incident.description,
      timestamp: incident.timestamp,
    })),
  ];

  const handleSOS = () => {
    // Simulate getting user location and finding nearest hospital
    const nearest = hospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0))[0];
    setNearestHospital(nearest);
    setSosOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('home.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {t('home.subtitle')}
          </p>
          <Button
            size="lg"
            onClick={handleSOS}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all animate-pulse"
          >
            <AlertCircle className="w-6 h-6 mr-2" />
            {t('home.sosButton')}
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {t('home.quickActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/report')}>
              <CardHeader>
                <FileText className="w-10 h-10 text-primary mb-2" />
                <CardTitle>{t('home.reportIncident')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Report disasters in your area to help emergency response teams.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/hospitals')}>
              <CardHeader>
                <Hospital className="w-10 h-10 text-secondary mb-2" />
                <CardTitle>{t('home.findHospital')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Locate nearby hospitals and relief centers in emergency situations.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/ngos')}>
              <CardHeader>
                <Users className="w-10 h-10 text-accent mb-2" />
                <CardTitle>{t('home.contactNGO')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connect with NGOs providing disaster relief and support services.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Active Alerts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {t('home.alerts')}
            </h2>
            <Link to="/map">
              <Button variant="outline">{t('home.viewAll')}</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allAlerts.slice(0, 4).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      </div>

      {/* SOS Dialog */}
      <Dialog open={sosOpen} onOpenChange={setSosOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center space-x-2">
              <AlertCircle className="w-6 h-6" />
              <span>{t('sos.title')}</span>
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p className="text-base">
                {t('sos.message')} <strong>{nearestHospital.name}</strong>
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">{nearestHospital.name}</p>
                <p className="text-sm text-muted-foreground">{nearestHospital.address}</p>
                <p className="text-sm text-muted-foreground">{nearestHospital.contact}</p>
                <p className="text-sm font-semibold text-primary mt-2">
                  {t('sos.eta')}: {nearestHospital.distance ? Math.ceil(nearestHospital.distance * 2) : 5} {t('sos.minutes')}
                </p>
              </div>
              <p className="text-sm text-muted-foreground italic">
                {t('sos.locationSent')}
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
