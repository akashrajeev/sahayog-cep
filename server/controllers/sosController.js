import Hospital from '../models/Hospital.js';
import SOSRequest from '../models/SOSRequest.js';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const toRad = (d) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d; // meters
}

export const createSOS = async (req, res) => {
  try {
    const { userLocation } = req.body;
    if (!userLocation || userLocation.lat == null || userLocation.lng == null) {
      return res.status(400).json({ error: 'Invalid location' });
    }

    const hospitals = await Hospital.find();
    if (hospitals.length === 0) {
      return res.status(404).json({ error: 'No hospitals available' });
    }

    let nearest = null;
    let minDist = Infinity;
    hospitals.forEach((h) => {
      const d = haversineDistance(userLocation.lat, userLocation.lng, h.lat, h.lng);
      if (d < minDist) {
        minDist = d;
        nearest = h;
      }
    });

    const nearestHospitalName = nearest?.name || 'Nearest Hospital';
    await SOSRequest.create({ userLocation, nearestHospital: nearestHospitalName });

    const etaMins = Math.max(3, Math.round(minDist / 500)); // naive ETA
    res.status(201).json({
      message: `Ambulance request sent to ${nearestHospitalName} – ETA ${etaMins} mins.`,
      nearestHospital: nearest,
      distanceMeters: Math.round(minDist)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create SOS request' });
  }
};


