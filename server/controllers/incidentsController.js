import Incident from '../models/Incident.js';

export const createIncident = async (req, res) => {
  try {
    const { type, description, location } = req.body;
    if (!type || !description || !location || location.lat == null || location.lng == null) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const incident = await Incident.create({ type, description, location });
    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create incident' });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
};


