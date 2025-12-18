# RSS Feed Integration for Live Disaster Data

This implementation adds live disaster data integration to your IDMRS (Integrated Disaster Management and Response System) through RSS feeds.

## 🚀 Features

### Automatic Data Collection
- **Scheduled Fetching**: RSS feeds are automatically checked every 30 minutes
- **Multiple Sources**: Supports various disaster data sources (USGS earthquakes, GDACS alerts, ReliefWeb, NOAA weather)
- **Real-time Integration**: New incidents are automatically added to your system

### Intelligent Data Processing
- **Geographic Parsing**: Extracts coordinates from multiple RSS formats (geo:lat/lng, georss:point, text parsing)
- **Disaster Classification**: Automatically categorizes incidents (earthquake, flood, fire, storm, tsunami, etc.)
- **Duplicate Prevention**: Prevents saving duplicate incidents from the same source
- **Data Enrichment**: Adds source tracking and metadata to incidents

## 📡 Supported RSS Feeds

### Pre-configured Sources
1. **USGS Earthquakes** (Hourly & Daily)
   - Real-time earthquake data worldwide
   - Magnitude, location, and timing information

2. **GDACS (Global Disaster Alert and Coordination System)**
   - Multi-hazard disaster alerts
   - International coordination data

3. **ReliefWeb**
   - Humanitarian updates and reports
   - Global disaster response information

4. **NOAA Weather Alerts**
   - US weather-related disasters
   - Storm and severe weather warnings

## 🛠 Implementation Details

### Backend Components

#### 1. RSS Service (`server/services/rssService.js`)
- Core RSS parsing functionality
- Geographic coordinate extraction
- Disaster type classification
- Database integration

#### 2. RSS Controller (`server/controllers/rssController.js`)
- API endpoints for RSS management
- Manual fetch triggers
- Feed testing functionality

#### 3. Cron Service (`server/services/cronService.js`)
- Automated scheduling (every 30 minutes)
- Initial fetch on server startup
- Error handling and logging

#### 4. API Routes (`server/routes/rss.js`)
- `GET /api/rss/feeds` - List available feeds
- `POST /api/rss/fetch` - Manual fetch trigger
- `POST /api/rss/test` - Test custom RSS feeds

### Frontend Components

#### RSS Management Page (`client/src/pages/RSSFeeds.tsx`)
- Manual fetch controls
- Feed status monitoring
- Custom feed testing
- Integration status display

### Database Schema Updates

The `Incident` model now includes:
```javascript
{
  // Existing fields...
  source: { type: String, default: 'manual' },
  sourceUrl: { type: String },
  feedUrl: { type: String }
}
```

## 🎯 Usage

### 1. Automatic Operation
The system runs automatically once started:
```bash
cd server
npm run dev
```

RSS feeds will be fetched:
- Initially after 30 seconds
- Then every 30 minutes automatically

### 2. Manual Controls
Access the RSS management page to:
- Trigger immediate RSS fetches
- View configured feeds
- Test custom RSS feeds
- Monitor integration status

### 3. API Usage
```javascript
// Trigger manual fetch
POST /api/rss/fetch

// Test a custom feed
POST /api/rss/test
{
  "feedUrl": "https://example.com/disasters.xml"
}

// Get available feeds
GET /api/rss/feeds
```

## 🔧 Configuration

### Adding New RSS Feeds
Edit `DISASTER_RSS_FEEDS` in `server/services/rssService.js`:
```javascript
export const DISASTER_RSS_FEEDS = {
  // Existing feeds...
  CUSTOM_FEED: 'https://your-feed-url.com/rss.xml'
};
```

### Adjusting Fetch Frequency
Modify the cron schedule in `server/services/cronService.js`:
```javascript
// Current: every 30 minutes
cron.schedule('*/30 * * * *', ...)

// Every hour:
cron.schedule('0 * * * *', ...)

// Every 15 minutes:
cron.schedule('*/15 * * * *', ...)
```

## 🔍 Data Flow

1. **RSS Parsing**: Fetches RSS feeds from configured sources
2. **Coordinate Extraction**: Parses geographic data from various formats
3. **Classification**: Determines disaster type from content
4. **Deduplication**: Checks for existing incidents
5. **Storage**: Saves new incidents to MongoDB
6. **Integration**: Data appears in existing map and list views

## 🚦 Monitoring

### Logs
The system provides detailed logging:
- RSS fetch attempts and results
- Parsing success/failure
- Database operations
- Error tracking

### Frontend Status
The RSS management page shows:
- Last fetch results
- Number of incidents found
- Feed health status
- Test results for custom feeds

## 🔄 Integration with Existing System

The RSS data seamlessly integrates with your existing:
- **Map Views**: RSS incidents appear on disaster maps
- **Incident Lists**: Mixed with manually created incidents
- **Filtering**: Can be filtered by source type
- **API Responses**: Include source metadata

## 📈 Benefits

1. **Real-time Data**: Always up-to-date disaster information
2. **Global Coverage**: Multiple international data sources
3. **Automated Operation**: No manual intervention required
4. **Scalable**: Easy to add new RSS feeds
5. **Reliable**: Built-in error handling and retry logic

## 🛡 Error Handling

The system includes robust error handling for:
- Network connectivity issues
- Malformed RSS feeds
- Missing geographic data
- Database connection problems
- Parsing failures

## 🎉 Getting Started

1. **Dependencies are already installed** via the setup process
2. **Server automatically starts** RSS integration
3. **Access the RSS page** in your web application
4. **Monitor the logs** to see data being fetched
5. **View new incidents** on your maps and lists

The RSS integration is now live and automatically collecting disaster data from around the world!