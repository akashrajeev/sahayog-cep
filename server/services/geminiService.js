import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyA4ycsRTnW2dZin7obF-iJD7krRd63qhjA';
const genAI = new GoogleGenerativeAI(API_KEY);

// Disaster management system prompt
const DISASTER_SYSTEM_PROMPT = `You are an expert disaster management AI assistant for an Integrated Disaster Management and Response System (IDMRS). Your role is to provide accurate, actionable guidance for disaster preparedness, response, and recovery.

CORE RESPONSIBILITIES:
1. Provide dos and don'ts for various disaster situations
2. Offer emergency preparedness advice
3. Give immediate response instructions during disasters
4. Provide safety guidance and evacuation procedures
5. Share post-disaster recovery information

GUIDELINES:
- Always prioritize safety and life preservation
- Provide clear, step-by-step instructions
- Be concise but comprehensive
- Use simple, understandable language
- Include emergency contact reminders when relevant
- Differentiate between immediate actions and long-term preparations
- Consider Indian context and local conditions when relevant

DISASTER TYPES TO COVER:
- Natural disasters: Earthquakes, floods, cyclones, tsunamis, landslides, droughts, fires
- Weather events: Heat waves, cold waves, storms, heavy rainfall
- Human-made emergencies: Chemical spills, building collapses, explosions

FORMAT YOUR RESPONSES WITH:
✅ DO: [Positive actions to take]
❌ DON'T: [Actions to avoid]
🚨 IMMEDIATE: [Urgent actions if disaster is happening now]
📋 PREPARE: [Preparedness measures]
📞 EMERGENCY: [When to call emergency services]

Always end with: "For immediate emergencies, call your local emergency services: India - 112, Fire - 101, Police - 100, Ambulance - 108"`;

// Initialize Gemini model with system instruction
const model = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash",
  generationConfig: {
    temperature: 0.3, // Lower temperature for more factual, consistent responses
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024,
  }
});

// Enhanced chat session with disaster context
let chatSession = null;

const initializeChatSession = () => {
  chatSession = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: DISASTER_SYSTEM_PROMPT }]
      },
      {
        role: "model", 
        parts: [{ text: "I understand. I'm now ready to assist as your disaster management AI expert. I'll provide clear, actionable guidance on disaster preparedness, response, and recovery with proper dos and don'ts formatting. I prioritize safety and will give step-by-step instructions tailored for emergency situations. How can I help you with disaster-related guidance today?" }]
      }
    ],
  });
};

// Get disaster guidance from Gemini
export const getDisasterGuidance = async (userMessage, disasterContext = null) => {
  try {
    // Initialize chat if not already done
    if (!chatSession) {
      initializeChatSession();
    }

    // Enhance user message with context if available
    let enhancedMessage = userMessage;
    
    if (disasterContext) {
      enhancedMessage = `Context: User is in ${disasterContext.location || 'unknown location'} and there are active ${disasterContext.incidentTypes ? disasterContext.incidentTypes.join(', ') : 'disasters'} nearby. 

User Query: ${userMessage}`;
    }

    const result = await chatSession.sendMessage(enhancedMessage);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback response for API failures
    return `I'm temporarily unable to access the AI guidance system. For immediate disasters:

🚨 IMMEDIATE SAFETY:
- Move to a safe location away from danger
- Follow local emergency instructions
- Stay calm and help others if safely possible

📞 EMERGENCY CONTACTS:
- All Emergencies: 112
- Fire: 101
- Police: 100  
- Ambulance: 108
- Disaster Helpline: 1078

Please try again in a moment or contact emergency services directly if this is urgent.`;
  }
};

// Get disaster-specific quick guidance
export const getQuickGuidance = async (disasterType) => {
  const quickPrompts = {
    earthquake: "Provide immediate earthquake dos and don'ts and safety measures",
    flood: "Give flood safety guidance and evacuation procedures",
    fire: "Provide fire safety dos and don'ts and escape procedures", 
    cyclone: "Give cyclone preparation and safety measures",
    tsunami: "Provide tsunami warning response and evacuation guidance",
    landslide: "Give landslide safety measures and evacuation procedures",
    heat_wave: "Provide heat wave safety dos and don'ts",
    cold_wave: "Give cold wave safety measures and health protection",
    chemical_spill: "Provide chemical emergency safety procedures",
    building_collapse: "Give building collapse emergency response guidance"
  };

  const prompt = quickPrompts[disasterType.toLowerCase()] || 
                  `Provide emergency safety guidance for ${disasterType} disaster`;

  return await getDisasterGuidance(prompt);
};

// Analyze user location and provide contextual guidance
export const getContextualGuidance = async (userQuery, userLocation, nearbyIncidents = []) => {
  const context = {
    location: userLocation,
    incidentTypes: nearbyIncidents.map(incident => incident.type)
  };

  return await getDisasterGuidance(userQuery, context);
};

// Reset chat session (useful for clearing context)
export const resetChatSession = () => {
  chatSession = null;
  initializeChatSession();
};