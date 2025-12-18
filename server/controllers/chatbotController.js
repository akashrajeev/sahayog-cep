import { 
  getDisasterGuidance, 
  getQuickGuidance, 
  getContextualGuidance,
  resetChatSession 
} from '../services/geminiService.js';
import Incident from '../models/Incident.js';

// Main chat endpoint
export const chatWithBot = async (req, res) => {
  try {
    const { message, userLocation } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get nearby incidents for context if location is provided
    let nearbyIncidents = [];
    if (userLocation && userLocation.lat && userLocation.lng) {
      // Find incidents within 50km radius
      nearbyIncidents = await Incident.find({
        'location.lat': {
          $gte: userLocation.lat - 0.5,
          $lte: userLocation.lat + 0.5
        },
        'location.lng': {
          $gte: userLocation.lng - 0.5,
          $lte: userLocation.lng + 0.5
        },
        timestamp: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }).limit(10);
    }

    const response = await getContextualGuidance(
      message, 
      userLocation ? `${userLocation.lat}, ${userLocation.lng}` : null,
      nearbyIncidents
    );

    res.json({
      success: true,
      response: response,
      context: {
        nearbyIncidents: nearbyIncidents.length,
        location: userLocation ? 'provided' : 'not provided'
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get response from disaster management AI',
      message: error.message
    });
  }
};

// Quick guidance for specific disaster types
export const getQuickDisasterGuidance = async (req, res) => {
  try {
    const { disasterType } = req.params;

    if (!disasterType) {
      return res.status(400).json({
        success: false,
        error: 'Disaster type is required'
      });
    }

    const guidance = await getQuickGuidance(disasterType);

    res.json({
      success: true,
      disasterType: disasterType,
      guidance: guidance
    });

  } catch (error) {
    console.error('Quick guidance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get disaster guidance',
      message: error.message
    });
  }
};

// Emergency guidance - prioritized response
export const getEmergencyGuidance = async (req, res) => {
  try {
    const { emergencyType, location, description } = req.body;

    const emergencyMessage = `EMERGENCY SITUATION: ${emergencyType}
Location: ${location || 'Unknown'}
Description: ${description || 'No additional details'}

I need immediate safety instructions and emergency response guidance.`;

    const response = await getDisasterGuidance(emergencyMessage);

    res.json({
      success: true,
      emergencyType: emergencyType,
      response: response,
      priority: 'HIGH',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Emergency guidance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get emergency guidance',
      message: error.message
    });
  }
};

// Get preparedness checklist
export const getPreparednessChecklist = async (req, res) => {
  try {
    const { region, disasterTypes } = req.query;
    
    let message = 'Provide a comprehensive disaster preparedness checklist';
    
    if (region) {
      message += ` for ${region} region`;
    }
    
    if (disasterTypes) {
      message += ` focusing on ${disasterTypes} disasters`;
    }
    
    message += '. Include emergency kit items, family emergency plan, and communication strategies.';

    const response = await getDisasterGuidance(message);

    res.json({
      success: true,
      checklist: response,
      region: region || 'general',
      disasterTypes: disasterTypes ? disasterTypes.split(',') : 'all'
    });

  } catch (error) {
    console.error('Preparedness checklist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get preparedness checklist',
      message: error.message
    });
  }
};

// Reset chat context
export const resetChat = async (req, res) => {
  try {
    resetChatSession();
    
    res.json({
      success: true,
      message: 'Chat context has been reset'
    });

  } catch (error) {
    console.error('Reset chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset chat context'
    });
  }
};

// Get available disaster guidance topics
export const getAvailableTopics = async (req, res) => {
  const topics = {
    disasters: [
      { type: 'earthquake', name: 'Earthquake', description: 'Seismic activity safety' },
      { type: 'flood', name: 'Flood', description: 'Water-related emergency guidance' },
      { type: 'fire', name: 'Fire', description: 'Fire safety and evacuation' },
      { type: 'cyclone', name: 'Cyclone/Hurricane', description: 'Storm preparation and safety' },
      { type: 'tsunami', name: 'Tsunami', description: 'Coastal evacuation procedures' },
      { type: 'landslide', name: 'Landslide', description: 'Slope failure emergency response' },
      { type: 'heat_wave', name: 'Heat Wave', description: 'Extreme heat safety measures' },
      { type: 'cold_wave', name: 'Cold Wave', description: 'Extreme cold protection' },
      { type: 'chemical_spill', name: 'Chemical Emergency', description: 'Hazardous material incidents' },
      { type: 'building_collapse', name: 'Building Collapse', description: 'Structural failure response' }
    ],
    topics: [
      'Emergency preparedness',
      'Evacuation procedures', 
      'Emergency kit essentials',
      'Family emergency planning',
      'Communication during disasters',
      'Post-disaster recovery',
      'Mental health during crises',
      'Community disaster response',
      'Insurance and documentation',
      'Vulnerable population assistance'
    ]
  };

  res.json({
    success: true,
    topics: topics
  });
};