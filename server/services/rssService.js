import Parser from 'rss-parser';
import axios from 'axios';
import Incident from '../models/Incident.js';
import { createAlertFromIncident } from './alertService.js';

const parser = new Parser({
  customFields: {
    item: [
      ['geo:lat', 'lat'],
      ['geo:long', 'lng'],
      ['georss:point', 'geoPoint'],
      ['category', 'category'],
      ['pubDate', 'publishedDate'],
      ['cap:effective', 'effective'],
      ['cap:expires', 'expires'],
      ['cap:urgency', 'urgency'],
      ['cap:severity', 'severity'],
      ['cap:certainty', 'certainty'],
      ['cap:area', 'area'],
      ['cap:polygon', 'polygon'],
      ['cap:circle', 'circle']
    ]
  }
});

// Common RSS feeds for disaster information
export const DISASTER_RSS_FEEDS = {
  USGS_EARTHQUAKES: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.atom',
  USGS_EARTHQUAKES_DAILY: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom',
  GDACS_ALERTS: 'https://www.gdacs.org/xml/rss.xml',
  RELIEFWEB: 'https://reliefweb.int/updates/rss.xml',
  NOAA_WEATHER: 'https://alerts.weather.gov/cap/us.php?x=1',
  INDIA_NDMA: 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml'
};

// Parse geographic coordinates from different formats
const parseCoordinates = (item) => {
  let lat = null, lng = null;

  // Try direct lat/lng fields
  if (item.lat && item.lng) {
    lat = parseFloat(item.lat);
    lng = parseFloat(item.lng);
  }
  // Try georss:point format (lat lng)
  else if (item.geoPoint) {
    const coords = item.geoPoint.split(' ');
    if (coords.length === 2) {
      lat = parseFloat(coords[0]);
      lng = parseFloat(coords[1]);
    }
  }
  // Try CAP polygon format (extract center point)
  else if (item.polygon) {
    const coords = item.polygon.split(' ');
    if (coords.length >= 4) {
      // Calculate center of polygon
      let latSum = 0, lngSum = 0, count = 0;
      for (let i = 0; i < coords.length - 1; i += 2) {
        const itemLat = parseFloat(coords[i]);
        const itemLng = parseFloat(coords[i + 1]);
        if (!isNaN(itemLat) && !isNaN(itemLng)) {
          latSum += itemLat;
          lngSum += itemLng;
          count++;
        }
      }
      if (count > 0) {
        lat = latSum / count;
        lng = lngSum / count;
      }
    }
  }
  // Try CAP circle format (lat,lng radius)
  else if (item.circle) {
    const parts = item.circle.split(' ');
    if (parts.length >= 2) {
      lat = parseFloat(parts[0]);
      lng = parseFloat(parts[1]);
    }
  }
  // Try to extract from content or description
  else if (item.content || item.contentSnippet || item.description) {
    const text = (item.content || item.contentSnippet || item.description || '');
    
    // Look for various coordinate patterns
    const patterns = [
      /(\d+\.?\d*)[°\s]*N[\s,]+(\d+\.?\d*)[°\s]*E/i,
      /(\d+\.?\d*)[°\s]*N[\s,]+(\d+\.?\d*)[°\s]*W/i,
      /Lat[itude]*[\s:]*(\d+\.?\d*)[\s,]+Lon[gitude]*[\s:]*(\d+\.?\d*)/i,
      /(\d+\.\d+)[\s,]+(\d+\.\d+)/g
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
        // Adjust for Western longitude
        if (pattern.toString().includes('W') && lng > 0) {
          lng = -lng;
        }
        break;
      }
    }
  }
  
  // For Indian NDMA feeds, try to extract location from place names in title
  if ((!lat || !lng) && item.title) {
    const locationFromCity = extractIndianLocation(item.title);
    if (locationFromCity) {
      lat = locationFromCity.lat;
      lng = locationFromCity.lng;
    }
  }

  return { lat, lng };
};

// Indian cities and their approximate coordinates for NDMA feed
const INDIAN_CITIES = {
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'rajgarh': { lat: 24.0073, lng: 76.7299 },
  'ramanathapuram': { lat: 9.3636, lng: 78.8370 },
  'kanniyakumari': { lat: 8.0883, lng: 77.5385 },
  'tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'patna': { lat: 25.5941, lng: 85.1376 }
};

// Extract location from Indian place names in text
const extractIndianLocation = (text) => {
  const lowerText = text.toLowerCase();
  
  for (const [city, coords] of Object.entries(INDIAN_CITIES)) {
    if (lowerText.includes(city)) {
      return coords;
    }
  }
  
  return null;
};

// Extract affected regions/areas from NDMA RSS feed text
const extractAffectedRegions = (title, description) => {
  const text = (title + ' ' + (description || '')).toLowerCase();
  const regions = [];
  
  // Common patterns in NDMA feeds
  const patterns = [
    /over\s+([^.]+)\s+in\s+next/i,
    /places\s+over\s+([^.]+)/i,
    /districts?\s*:?\s*([^.]+)/i,
    /areas?\s*:?\s*([^.]+)/i,
    /regions?\s*:?\s*([^.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const regionText = match[1].trim();
      // Split by common delimiters and clean up
      const extractedRegions = regionText
        .split(/[,;]/)
        .map(r => r.trim())
        .filter(r => r.length > 0 && !r.match(/^\d/)) // Remove numeric-only entries
        .map(r => r.replace(/\s+and\s+/g, ', ').replace(/\s+in\s+next.*$/i, ''))
        .filter(r => r.length > 2);
      
      regions.push(...extractedRegions);
      break; // Use first match
    }
  }
  
  return regions.length > 0 ? regions : null;
};

// Determine disaster type from RSS item
const determineDisasterType = (item) => {
  const text = (item.title + ' ' + (item.contentSnippet || item.description || '')).toLowerCase();
  
  if (text.includes('earthquake') || text.includes('quake') || text.includes('seismic')) {
    return 'earthquake';
  }
  if (text.includes('flood') || text.includes('flooding')) {
    return 'flood';
  }
  if (text.includes('fire') || text.includes('wildfire')) {
    return 'fire';
  }
  if (text.includes('storm') || text.includes('hurricane') || text.includes('cyclone') || text.includes('tornado')) {
    return 'storm';
  }
  if (text.includes('tsunami')) {
    return 'tsunami';
  }
  if (text.includes('volcano') || text.includes('volcanic')) {
    return 'volcanic';
  }
  if (text.includes('drought')) {
    return 'drought';
  }
  if (text.includes('landslide') || text.includes('avalanche')) {
    return 'landslide';
  }
  if (text.includes('cold wave') || text.includes('heat wave')) {
    return 'weather';
  }
  if (text.includes('rain') || text.includes('rainfall') || text.includes('precipitation')) {
    return 'rain';
  }
  
  return 'other';
};

// Parse a single RSS feed
export const parseRSSFeed = async (feedUrl) => {
  try {
    console.log(`Fetching RSS feed: ${feedUrl}`);
    const response = await axios.get(feedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'IDMRS Disaster Monitor/1.0'
      }
    });
    
    const feed = await parser.parseString(response.data);
    console.log(`Parsed ${feed.items.length} items from RSS feed`);
    
    const incidents = [];
    
    for (const item of feed.items) {
      const coords = parseCoordinates(item);
      
      // Skip items without valid coordinates
      if (!coords.lat || !coords.lng || isNaN(coords.lat) || isNaN(coords.lng)) {
        continue;
      }
      
      const disasterType = determineDisasterType(item);
      const timestamp = item.publishedDate ? new Date(item.publishedDate) : new Date(item.pubDate || Date.now());
      
      // Extract affected regions for NDMA feeds
      const affectedRegions = extractAffectedRegions(item.title, item.contentSnippet || item.description);
      
      // Determine country based on feed source
      const country = feedUrl.includes('ndma.gov.in') ? 'India' : null;
      
      // Create incident object
      const incident = {
        type: disasterType,
        description: item.title + (item.contentSnippet ? ' - ' + item.contentSnippet : ''),
        location: {
          lat: coords.lat,
          lng: coords.lng
        },
        timestamp: timestamp,
        source: 'RSS',
        sourceUrl: item.link || feedUrl,
        feedUrl: feedUrl,
        affectedRegions: affectedRegions,
        country: country,
        severity: item.severity || item.urgency || null
      };
      
      incidents.push(incident);
    }
    
    return incidents;
  } catch (error) {
    console.error(`Error parsing RSS feed ${feedUrl}:`, error.message);
    return [];
  }
};

// Save RSS incidents to database (avoid duplicates)
export const saveRSSIncidents = async (incidents) => {
  let savedCount = 0;
  
  for (const incidentData of incidents) {
    try {
      // Check if incident already exists (by source URL and timestamp)
      const existingIncident = await Incident.findOne({
        sourceUrl: incidentData.sourceUrl,
        timestamp: incidentData.timestamp
      });
      
      if (!existingIncident) {
        // Debug logging for affected regions
        if (incidentData.affectedRegions && incidentData.affectedRegions.length > 0) {
          console.log(`Saving incident with regions:`, incidentData.affectedRegions, 'for', incidentData.description.substring(0, 50));
        }
        
        // Save the incident
        const savedIncident = await Incident.create(incidentData);
        savedCount++;
        
        // Create alert if severity is medium or higher
        if (incidentData.severity) {
          try {
            const alert = await createAlertFromIncident(savedIncident);
            if (alert) {
              console.log(`🚨 Created alert for ${incidentData.type} incident in ${incidentData.country || 'Unknown'}`);
            }
          } catch (alertError) {
            console.error('Failed to create alert for incident:', alertError.message);
          }
        }
      }
    } catch (error) {
      console.error('Error saving incident:', error.message);
    }
  }
  
  return savedCount;
};

// Fetch from all configured RSS feeds
export const fetchAllRSSFeeds = async () => {
  const allIncidents = [];
  
  for (const [name, url] of Object.entries(DISASTER_RSS_FEEDS)) {
    try {
      console.log(`Processing RSS feed: ${name}`);
      const incidents = await parseRSSFeed(url);
      allIncidents.push(...incidents);
    } catch (error) {
      console.error(`Failed to process RSS feed ${name}:`, error.message);
    }
  }
  
  if (allIncidents.length > 0) {
    const savedCount = await saveRSSIncidents(allIncidents);
    console.log(`Saved ${savedCount} new incidents from RSS feeds`);
  }
  
  return allIncidents;
};