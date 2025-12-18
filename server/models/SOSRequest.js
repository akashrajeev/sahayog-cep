import mongoose from 'mongoose';

const CoordinateSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  { _id: false }
);

const SOSRequestSchema = new mongoose.Schema(
  {
    userLocation: { type: CoordinateSchema, required: true },
    nearestHospital: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('SOSRequest', SOSRequestSchema);


