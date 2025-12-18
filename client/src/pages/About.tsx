import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Map, Heart, Phone, Mail } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About IDMRS
          </h1>
          <p className="text-lg text-muted-foreground">
            Integrated Disaster Management and Response System
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary" />
                <span>Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The Integrated Disaster Management and Response System (IDMRS) is designed to
                enhance disaster preparedness, response, and recovery through real-time
                information sharing, citizen engagement, and coordinated relief efforts. Our
                platform connects citizens, emergency services, hospitals, and NGOs to create a
                comprehensive disaster management ecosystem.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Map className="w-6 h-6 text-secondary" />
                  <span>Real-Time Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor disaster-prone zones, track active incidents, and locate emergency
                  services in real-time through our interactive mapping system.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-accent" />
                  <span>Community Engagement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Empower citizens to report incidents, access emergency services, and stay
                  informed about disasters in their area.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-6 h-6 text-primary" />
                  <span>NGO Collaboration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connect with disaster relief organizations providing food, shelter, medical
                  aid, rescue operations, and mental health support.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-secondary" />
                  <span>Emergency SOS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Quick access to emergency services with location sharing and nearest hospital
                  identification for immediate response.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Emergency Hotline</p>
                  <p className="text-sm text-muted-foreground">1800-XXX-XXXX (24/7)</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@idmrs.gov.in</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="py-8">
              <blockquote className="text-center">
                <p className="text-lg italic text-foreground mb-2">
                  "Together, we build resilient communities prepared to face any disaster."
                </p>
                <footer className="text-sm text-muted-foreground">
                  — IDMRS Team
                </footer>
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
