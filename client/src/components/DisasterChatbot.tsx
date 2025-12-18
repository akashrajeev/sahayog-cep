import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  AlertCircle, 
  Shield, 
  MapPin,
  RotateCcw,
  Zap,
  BookOpen
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
}

interface QuickAction {
  label: string;
  type: string;
  icon: React.ReactNode;
  color: string;
}

const DisasterChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick action buttons
  const quickActions: QuickAction[] = [
    { label: 'Earthquake Safety', type: 'earthquake', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
    { label: 'Flood Guidelines', type: 'flood', icon: <Shield className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    { label: 'Fire Safety', type: 'fire', icon: <Zap className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
    { label: 'Emergency Kit', type: 'preparedness', icon: <BookOpen className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'bot',
      content: `🤖 Hello! I'm your Disaster Management AI Assistant. I can help you with:

✅ Emergency safety guidelines
✅ Disaster preparedness advice  
✅ Dos and don'ts for various disasters
✅ Evacuation procedures
✅ Emergency contact information

Ask me anything about disaster safety, or use the quick actions below!

📞 **Emergency Numbers**: India - 112, Fire - 101, Police - 100, Ambulance - 108`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async (message: string, isQuickAction = false) => {
    if ((!message.trim() && !isQuickAction) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          userLocation: userLocation
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I\'m having trouble connecting right now. For immediate emergencies, please call 112 (India) or your local emergency services.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (actionType: string) => {
    if (actionType === 'preparedness') {
      await sendMessage('Give me a comprehensive emergency preparedness checklist with essential items and family planning steps', true);
    } else {
      try {
        const response = await fetch(`${API_BASE}/api/chatbot/guidance/${actionType}`);
        const data = await response.json();
        
        if (data.success) {
          const botMessage: Message = {
            id: Date.now().toString(),
            type: 'bot',
            content: data.guidance,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        }
      } catch (error) {
        console.error('Quick action error:', error);
      }
    }
  };

  const resetChat = async () => {
    try {
      await fetch(`${API_BASE}/api/chatbot/reset`, { method: 'POST' });
      setMessages(messages.slice(0, 1)); // Keep welcome message
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Disaster Management AI Assistant
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Get expert guidance for disaster preparedness and response</span>
          <div className="flex items-center gap-2">
            {userLocation && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location enabled
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={resetChat}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.type)}
              className="flex items-center gap-2 h-auto p-2 text-xs"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'bot' && (
                      <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-blue-600" />
                    )}
                    {message.type === 'user' && (
                      <User className="h-4 w-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {message.content}
                      </pre>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about disaster safety, emergency procedures..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={() => sendMessage(inputMessage)} 
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisasterChatbot;