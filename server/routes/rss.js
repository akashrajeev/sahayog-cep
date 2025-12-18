import express from 'express';
import { fetchRSSFeeds, getAvailableFeeds, testRSSFeed } from '../controllers/rssController.js';
import { debugRSSFeed } from '../controllers/debugController.js';

const router = express.Router();

// GET /api/rss/feeds - Get available RSS feeds
router.get('/feeds', getAvailableFeeds);

// POST /api/rss/fetch - Manually trigger RSS feed fetch
router.post('/fetch', fetchRSSFeeds);

// POST /api/rss/test - Test a specific RSS feed
router.post('/test', testRSSFeed);

// POST /api/rss/debug - Debug RSS feed structure
router.post('/debug', debugRSSFeed);

export default router;