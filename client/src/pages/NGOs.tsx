import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDisaster } from '@/context/DisasterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, MapPin, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const NGOs = () => {
  const { t } = useTranslation();
  const { ngos, addNGO } = useDisaster();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    area: '',
    services: [] as string[],
  });

  const serviceOptions = ['Food', 'Shelter', 'Medical', 'Rescue', 'Mental Health'];

  const handleServiceToggle = (service: string) => {
    setFormData({
      ...formData,
      services: formData.services.includes(service)
        ? formData.services.filter((s) => s !== service)
        : [...formData.services, service],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contactPerson || !formData.phone || !formData.area || formData.services.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    addNGO(formData);
    
    toast({
      title: t('ngos.success'),
      description: 'Your NGO will be listed shortly',
    });

    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      area: '',
      services: [],
    });
    
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            {t('ngos.title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {t('ngos.subtitle')}
          </p>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Users className="w-5 h-5 mr-2" />
                {t('ngos.register')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('ngos.register')}</DialogTitle>
                <DialogDescription>
                  Join our network of disaster relief organizations
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('ngos.name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">{t('ngos.contactPerson')}</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('ngos.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">{t('ngos.area')}</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('ngos.services')}</Label>
                  <div className="space-y-2">
                    {serviceOptions.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={formData.services.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <label htmlFor={service} className="text-sm cursor-pointer">
                          {service}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  {t('ngos.submit')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ngos.map((ngo) => (
            <Card key={ngo.id} className="hover:shadow-lg transition-shadow border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">{ngo.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2.5 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <Users className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span>{ngo.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <span>{ngo.phone}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span>{ngo.area}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2.5 text-foreground">Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {ngo.services.map((service) => (
                      <Badge key={service} variant="secondary" className="bg-secondary text-secondary-foreground">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-border"
                  onClick={() => {
                    window.location.href = `tel:${ngo.phone}`;
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NGOs;
