import NGO from '../models/NGO.js';

export const registerNGO = async (req, res) => {
  try {
    const { name, contactPerson, phone, services = [], area } = req.body;
    if (!name || !contactPerson || !phone || !area) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const ngo = await NGO.create({ name, contactPerson, phone, services, area });
    res.status(201).json(ngo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to register NGO' });
  }
};

export const listNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find().sort({ createdAt: -1 });
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch NGOs' });
  }
};


