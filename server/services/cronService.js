import cron from 'node-cron';
import { fetchAllRSSFeeds } from './rssService.js';
import { processIncidentsForAlerts, cleanupExpiredAlerts } from './alertService.js';

// Initialize RSS feed fetching cron jobs
export const initRSSCronJobs = () => {
  console.log('Initializing RSS feed cron jobs...');
  
  // Fetch RSS feeds every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running scheduled RSS feed fetch...');
    try {
      await fetchAllRSSFeeds();
      console.log('Scheduled RSS feed fetch completed');
      
      // Process incidents for alert creation
      console.log('Processing incidents for alerts...');
      await processIncidentsForAlerts();
      console.log('Alert processing completed');
    } catch (error) {
      console.error('Error in scheduled RSS feed fetch:', error);
    }
  });

  // Clean up expired alerts every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running alert cleanup job...');
    try {
      await cleanupExpiredAlerts();
      console.log('Alert cleanup completed');
    } catch (error) {
      console.error('Alert cleanup failed:', error);
    }
  });
  
  // Run an initial fetch when server starts (after a 30 second delay)
  setTimeout(async () => {
    console.log('Running initial RSS feed fetch and alert processing...');
    try {
      await fetchAllRSSFeeds();
      console.log('Initial RSS feed fetch completed');
      
      // Process any existing incidents for alerts
      await processIncidentsForAlerts();
      console.log('Initial alert processing completed');
    } catch (error) {
      console.error('Error in initial RSS feed fetch:', error);
    }
  }, 30000); // 30 second delay to ensure DB is connected
  
  console.log('RSS and Alert cron jobs initialized');
  console.log('- RSS feeds: fetching every 30 minutes');  
  console.log('- Alert processing: every 30 minutes with RSS fetch');
  console.log('- Alert cleanup: every hour');
};