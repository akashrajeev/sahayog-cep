import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDisaster } from '@/context/DisasterContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const Report = () => {
  const { t } = useTranslation();
  const { addIncident } = useDisaster();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    lat: 22.5726,
    lng: 88.3639,
  });

  const disasterTypes = ['flood', 'fire', 'earthquake', 'cyclone', 'landslide'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.description || !formData.location) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    addIncident({
      type: formData.type,
      description: formData.description,
      location: {
        lat: formData.lat,
        lng: formData.lng,
        address: formData.location,
      },
    });

    toast({
      title: t('report.success'),
      description: 'Emergency services have been notified',
    });

    setFormData({
      type: '',
      description: '',
      location: '',
      lat: 22.5726,
      lng: 88.3639,
    });

    setTimeout(() => {
      navigate('/map');
    }, 1500);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          });
          toast({
            title: 'Location Updated',
            description: 'Your current location has been set',
          });
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: 'Could not get your location. Please enter manually.',
            variant: 'destructive',
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{t('report.title')}</CardTitle>
            <CardDescription className="text-base">{t('report.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">{t('report.disasterType')}</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('report.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {disasterTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`alerts.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  {t('report.description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('report.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  {t('report.location')}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder={t('report.locationPlaceholder')}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={getCurrentLocation}>
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
                {formData.lat && formData.lng && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordinates: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" size="lg">
                {t('report.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Report;
