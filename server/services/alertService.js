import Alert from '../models/Alert.js';
import Incident from '../models/Incident.js';

/**
 * Service to automatically create alerts from high-severity incidents
 */

// Mapping from incident types to alert types
const INCIDENT_TO_ALERT_TYPE_MAP = {
  'earthquake': 'earthquake',
  'flood': 'flood',
  'fire': 'fire',
  'wildfire': 'fire',
  'cyclone': 'cyclone',
  'hurricane': 'cyclone',
  'typhoon': 'cyclone',
  'storm': 'storm',
  'landslide': 'landslide',
  'heatwave': 'heatwave',
  'drought': 'heatwave',
  'tsunami': 'flood',
  'volcano': 'fire'
};

// Mapping severity levels
const SEVERITY_MAP = {
  'extreme': 'critical',
  'critical': 'critical',
  'severe': 'high',
  'high': 'high',
  'moderate': 'medium',
  'medium': 'medium',
  'minor': 'low',
  'low': 'low'
};

/**
 * Convert incident severity to alert severity
 */
const mapSeverity = (incidentSeverity) => {
  if (!incidentSeverity) return 'medium';
  const severity = incidentSeverity.toLowerCase();
  return SEVERITY_MAP[severity] || 'medium';
};

/**
 * Convert incident type to alert type
 */
const mapIncidentType = (incidentType) => {
  if (!incidentType) return 'fire';
  const type = incidentType.toLowerCase();
  
  // Check for partial matches
  for (const [key, value] of Object.entries(INCIDENT_TO_ALERT_TYPE_MAP)) {
    if (type.includes(key)) {
      return value;
    }
  }
  
  return 'fire'; // default fallback
};

/**
 * Generate region name from incident
 */
const generateRegionName = (incident) => {
  if (incident.affectedRegions && incident.affectedRegions.length > 0) {
    return incident.affectedRegions.join(', ');
  }
  
  if (incident.country) {
    return incident.country;
  }
  
  return 'Unknown Region';
};

/**
 * Calculate alert expiry time based on disaster type and severity
 */
const calculateExpiryTime = (alertType, severity) => {
  const now = new Date();
  let hoursToAdd = 24; // default 24 hours
  
  // Adjust based on disaster type
  switch (alertType) {
    case 'earthquake':
      hoursToAdd = 48; // Earthquakes can have aftershocks
      break;
    case 'flood':
      hoursToAdd = 72; // Floods can last for days
      break;
    case 'cyclone':
      hoursToAdd = 96; // Cyclones are long-duration events
      break;
    case 'fire':
      hoursToAdd = 48; // Fires can spread and reignite
      break;
    case 'heatwave':
      hoursToAdd = 120; // Heatwaves last for days
      break;
    default:
      hoursToAdd = 24;
  }
  
  // Adjust based on severity
  if (severity === 'critical') {
    hoursToAdd *= 1.5; // Critical alerts last longer
  } else if (severity === 'low') {
    hoursToAdd *= 0.5; // Low severity alerts expire faster
  }
  
  return new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
};

/**
 * Create alert from high-severity incident
 */
export const createAlertFromIncident = async (incident) => {
  try {
    const alertType = mapIncidentType(incident.type);
    const severity = mapSeverity(incident.severity);
    
    // Only create alerts for medium severity and above
    if (severity === 'low') {
      console.log(`⏭️  Skipping alert creation for low severity incident: ${incident.type}`);
      return null;
    }
    
    // Check if alert already exists for this incident
    const existingAlert = await Alert.findOne({
      'location.lat': incident.location.lat,
      'location.lng': incident.location.lng,
      type: alertType,
      isActive: true
    });
    
    if (existingAlert) {
      console.log(`⚠️  Alert already exists for incident at [${incident.location.lat}, ${incident.location.lng}]`);
      return existingAlert;
    }
    
    const region = generateRegionName(incident);
    const expiresAt = calculateExpiryTime(alertType, severity);
    
    // Calculate affected radius based on severity
    let affectedRadius = 5000; // 5km default
    switch (severity) {
      case 'critical':
        affectedRadius = 25000; // 25km
        break;
      case 'high':
        affectedRadius = 15000; // 15km
        break;
      case 'medium':
        affectedRadius = 10000; // 10km
        break;
      default:
        affectedRadius = 5000;
    }
    
    const alertData = {
      type: alertType,
      severity: severity,
      region: region,
      description: `${alertType.toUpperCase()} Alert: ${incident.description}`,
      location: {
        lat: incident.location.lat,
        lng: incident.location.lng,
        address: incident.location.address || region
      },
      isActive: true,
      expiresAt: expiresAt,
      affectedRadius: affectedRadius,
      evacuationRequired: severity === 'critical' || (severity === 'high' && ['flood', 'cyclone', 'fire'].includes(alertType)),
      emergencyContacts: generateEmergencyContacts(incident.country, alertType)
    };
    
    const newAlert = new Alert(alertData);
    const savedAlert = await newAlert.save();
    
    console.log(`🚨 Created new alert: ${alertType.toUpperCase()} (${severity}) in ${region}`);
    return savedAlert;
    
  } catch (error) {
    console.error('Error creating alert from incident:', error);
    return null;
  }
};

/**
 * Generate emergency contacts based on country and disaster type
 */
const generateEmergencyContacts = (country, alertType) => {
  const contacts = [];
  
  if (country === 'India') {
    contacts.push({
      name: 'National Emergency Response',
      phone: '112',
      role: 'Emergency Coordinator'
    });
    
    switch (alertType) {
      case 'fire':
        contacts.push({
          name: 'Fire Brigade',
          phone: '101',
          role: 'Fire Department'
        });
        break;
      case 'flood':
        contacts.push({
          name: 'Flood Control Room',
          phone: '1070',
          role: 'Flood Management'
        });
        break;
      case 'earthquake':
        contacts.push({
          name: 'NDMA Emergency',
          phone: '011-2674-2432',
          role: 'Disaster Management'
        });
        break;
      default:
        contacts.push({
          name: 'State Emergency Services',
          phone: '108',
          role: 'Emergency Response'
        });
    }
  } else {
    // International emergency contacts
    contacts.push({
      name: 'Local Emergency Services',
      phone: 'Check local emergency number',
      role: 'Emergency Coordinator'
    });
  }
  
  return contacts;
};

/**
 * Process all recent incidents and create alerts
 */
export const processIncidentsForAlerts = async () => {
  try {
    console.log('🔄 Processing incidents for alert creation...');
    
    // Get incidents from the last 24 hours that don't have corresponding alerts
    const recentIncidents = await Incident.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      severity: { $exists: true, $ne: null }
    });
    
    console.log(`📊 Found ${recentIncidents.length} recent incidents to process`);
    
    let alertsCreated = 0;
    for (const incident of recentIncidents) {
      const alert = await createAlertFromIncident(incident);
      if (alert) {
        alertsCreated++;
      }
    }
    
    console.log(`✅ Created ${alertsCreated} new alerts from incidents`);
    return alertsCreated;
    
  } catch (error) {
    console.error('Error processing incidents for alerts:', error);
    return 0;
  }
};

/**
 * Clean up expired alerts
 */
export const cleanupExpiredAlerts = async () => {
  try {
    console.log('🧹 Cleaning up expired alerts...');
    
    const result = await Alert.updateMany(
      {
        isActive: true,
        expiresAt: { $lte: new Date() }
      },
      {
        $set: { isActive: false }
      }
    );
    
    console.log(`✅ Deactivated ${result.modifiedCount} expired alerts`);
    return result.modifiedCount;
    
  } catch (error) {
    console.error('Error cleaning up expired alerts:', error);
    return 0;
  }
};