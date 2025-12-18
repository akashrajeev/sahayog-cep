import Hospital from '../models/Hospital.js';

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ name: 1 });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
};


