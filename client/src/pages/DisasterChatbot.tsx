import React from 'react';
import DisasterChatbotComponent from '@/components/DisasterChatbot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Shield, AlertTriangle, BookOpen } from 'lucide-react';

const DisasterChatbotPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            AI Disaster Assistant
          </h1>
          <p className="text-gray-600 mt-2">
            Get expert guidance on disaster preparedness, emergency response, and safety measures
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
          <Shield className="h-4 w-4 text-green-600" />
          Powered by Gemini AI
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chatbot Interface */}
        <div className="lg:col-span-2">
          <DisasterChatbotComponent />
        </div>

        {/* Information Panel */}
        <div className="space-y-4">
          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                What I Can Help With
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Emergency Response</div>
                    <div className="text-sm text-gray-600">Immediate actions during disasters</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Safety Guidelines</div>
                    <div className="text-sm text-gray-600">Dos and don'ts for various disasters</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Preparedness Planning</div>
                    <div className="text-sm text-gray-600">Emergency kits and family plans</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Recovery Guidance</div>
                    <div className="text-sm text-gray-600">Post-disaster recovery steps</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>
                For immediate emergencies, call these numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="font-bold text-red-800">All Emergencies</div>
                  <div className="text-2xl font-bold text-red-600">112</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="font-bold text-orange-800">Fire</div>
                  <div className="text-2xl font-bold text-orange-600">101</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="font-bold text-blue-800">Police</div>
                  <div className="text-2xl font-bold text-blue-600">100</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="font-bold text-green-800">Ambulance</div>
                  <div className="text-2xl font-bold text-green-600">108</div>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 mt-2">
                <div className="font-bold text-purple-800">Disaster Helpline</div>
                <div className="text-xl font-bold text-purple-600">1078</div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sample Questions</CardTitle>
              <CardDescription>
                Try asking these questions to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm bg-gray-50 p-2 rounded border">
                  "What should I do during an earthquake?"
                </div>
                <div className="text-sm bg-gray-50 p-2 rounded border">
                  "How do I prepare for a flood?"
                </div>
                <div className="text-sm bg-gray-50 p-2 rounded border">
                  "What items should be in my emergency kit?"
                </div>
                <div className="text-sm bg-gray-50 p-2 rounded border">
                  "How to create a family emergency plan?"
                </div>
                <div className="text-sm bg-gray-50 p-2 rounded border">
                  "What to do during a cyclone?"
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DisasterChatbotPage;