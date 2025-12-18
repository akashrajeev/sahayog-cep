import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import './FloatingChatbot.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X,
  Minimize2,
  AlertCircle, 
  Shield, 
  Zap,
  BookOpen
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Initialize with welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'bot',
        content: `🚨 **Emergency AI Assistant Ready!**

I can help you with:
• Emergency safety guidelines  
• Disaster dos and don'ts
• Evacuation procedures
• Preparedness advice

**Quick Emergency Numbers:**
🚨 All Emergencies: **112**
🚒 Fire: **101** | 👮 Police: **100**
🚑 Ambulance: **108**

Ask me anything about disaster safety!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
    setIsMinimized(false);
  };

  const minimizeChatbot = () => {
    setIsMinimized(true);
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

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
        
        // Show notification if chat is closed
        if (!isOpen) {
          setHasNewMessage(true);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '🚨 **Emergency Info Available Offline**\n\nFor immediate emergencies:\n• Call 112 (All emergencies)\n• Move to safety\n• Follow local instructions\n\nI\'ll be back online shortly!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (actionType: string, message: string) => {
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div
          className={`fixed bottom-20 right-6 z-50 cursor-pointer transition-all duration-300 hover:scale-110 ${
            hasNewMessage ? 'animate-bounce' : ''
          }`}
          onClick={toggleChatbot}
        >
          <div className={`relative w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            hasNewMessage ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}>
            <MessageCircle className="w-8 h-8 text-white" />
            {hasNewMessage && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
              </div>
            )}
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 pointer-events-none transition-opacity duration-300 hover:opacity-100 whitespace-nowrap">
            Emergency AI Assistant
            <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className={`fixed bottom-20 right-6 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80' : 'w-96'
        }`}>
          <Card className={`shadow-2xl border-2 border-blue-200 ${
            isMinimized ? 'h-16' : 'h-[520px]'
          } flex flex-col transition-all duration-300`}>
            {/* Header */}
            <CardHeader className="pb-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Emergency AI</CardTitle>
                    <CardDescription className="text-xs text-blue-100">
                      Disaster Response Assistant
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={minimizeChatbot}
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChatbot}
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            {!isMinimized && (
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Quick Actions */}
                <div className="p-3 border-b bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('earthquake', 'Earthquake safety dos and don\'ts')}
                      className="text-xs h-8 flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      Earthquake
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('flood', 'Flood safety guidelines and evacuation')}
                      className="text-xs h-8 flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      Flood
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('fire', 'Fire safety and escape procedures')}
                      className="text-xs h-8 flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      Fire
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('kit', 'Emergency kit essentials checklist')}
                      className="text-xs h-8 flex items-center gap-1"
                    >
                      <BookOpen className="h-3 w-3" />
                      Kit
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-hidden bg-gray-50">
                  <div className="floating-chatbot-messages-container">
                    <div className="p-3 space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                              message.type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 border'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {message.type === 'bot' && (
                                <Bot className="h-3 w-3 mt-1 flex-shrink-0 text-blue-600" />
                              )}
                              <div className="flex-1">
                                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                                  {message.content}
                                </pre>
                                <div className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border rounded-lg px-3 py-2 flex items-center gap-2">
                            <Bot className="h-3 w-3 text-blue-600" />
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 border-t bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about emergency procedures..."
                      disabled={isLoading}
                      className="flex-1 text-sm"
                    />
                    <Button 
                      onClick={() => sendMessage(inputMessage)} 
                      disabled={isLoading || !inputMessage.trim()}
                      size="sm"
                      className="px-3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;