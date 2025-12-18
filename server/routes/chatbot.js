import express from 'express';
import {
  chatWithBot,
  getQuickDisasterGuidance,
  getEmergencyGuidance,
  getPreparednessChecklist,
  resetChat,
  getAvailableTopics
} from '../controllers/chatbotController.js';

const router = express.Router();

// Main chat endpoint
router.post('/chat', chatWithBot);

// Quick disaster guidance
router.get('/guidance/:disasterType', getQuickDisasterGuidance);

// Emergency guidance (high priority)
router.post('/emergency', getEmergencyGuidance);

// Preparedness checklist
router.get('/preparedness', getPreparednessChecklist);

// Reset chat context
router.post('/reset', resetChat);

// Available topics and disaster types
router.get('/topics', getAvailableTopics);

export default router;