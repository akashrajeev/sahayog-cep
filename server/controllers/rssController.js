import { fetchAllRSSFeeds, parseRSSFeed, DISASTER_RSS_FEEDS } from '../services/rssService.js';

// Manually trigger RSS feed fetch
export const fetchRSSFeeds = async (req, res) => {
  try {
    console.log('Manual RSS feed fetch triggered');
    const incidents = await fetchAllRSSFeeds();
    
    res.json({
      success: true,
      message: `Processed ${incidents.length} incidents from RSS feeds`,
      incidents: incidents.length,
      feeds: Object.keys(DISASTER_RSS_FEEDS)
    });
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RSS feeds',
      message: error.message
    });
  }
};

// Get available RSS feeds
export const getAvailableFeeds = (req, res) => {
  res.json({
    feeds: DISASTER_RSS_FEEDS,
    description: 'Available RSS feeds for disaster monitoring'
  });
};

// Test a specific RSS feed
export const testRSSFeed = async (req, res) => {
  try {
    const { feedUrl } = req.body;
    
    if (!feedUrl) {
      return res.status(400).json({
        success: false,
        error: 'Feed URL is required'
      });
    }
    
    const incidents = await parseRSSFeed(feedUrl);
    
    res.json({
      success: true,
      feedUrl,
      incidents: incidents.length,
      sampleIncidents: incidents.slice(0, 3) // Return first 3 as preview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test RSS feed',
      message: error.message
    });
  }
};