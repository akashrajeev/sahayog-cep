import axios from 'axios';
import Parser from 'rss-parser';

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

// Debug RSS feed structure
export const debugRSSFeed = async (req, res) => {
  try {
    const { feedUrl } = req.body;
    
    if (!feedUrl) {
      return res.status(400).json({
        success: false,
        error: 'Feed URL is required'
      });
    }
    
    console.log(`Debugging RSS feed: ${feedUrl}`);
    
    // Fetch raw RSS data
    const response = await axios.get(feedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'IDMRS Disaster Monitor/1.0'
      }
    });
    
    // Parse the RSS feed
    const feed = await parser.parseString(response.data);
    
    // Get first few items for analysis
    const debugInfo = {
      feedTitle: feed.title,
      feedDescription: feed.description,
      totalItems: feed.items.length,
      sampleItems: feed.items.slice(0, 3).map(item => ({
        title: item.title,
        description: item.description,
        content: item.content,
        contentSnippet: item.contentSnippet,
        pubDate: item.pubDate,
        link: item.link,
        customFields: {
          lat: item.lat,
          lng: item.lng,
          geoPoint: item.geoPoint,
          effective: item.effective,
          expires: item.expires,
          urgency: item.urgency,
          severity: item.severity,
          certainty: item.certainty,
          area: item.area,
          polygon: item.polygon,
          circle: item.circle
        },
        allFields: Object.keys(item)
      })),
      rawXmlSample: response.data.substring(0, 2000) + '...' // First 2000 characters
    };
    
    res.json({
      success: true,
      feedUrl,
      debugInfo
    });
  } catch (error) {
    console.error('Error debugging RSS feed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to debug RSS feed',
      message: error.message
    });
  }
};