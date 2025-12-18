import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  { _id: false }
);

const IncidentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: LocationSchema, required: true },
    timestamp: { type: Date, default: Date.now },
    source: { type: String, default: 'manual' }, // 'manual', 'RSS', etc.
    sourceUrl: { type: String }, // URL from RSS feed
    feedUrl: { type: String }, // Original RSS feed URL
    affectedRegions: [{ type: String }], // Array of affected regions/areas
    severity: { type: String }, // For RSS feeds with severity info
    country: { type: String } // Country for regional highlighting
  },
  { timestamps: true }
);

export default mongoose.model('Incident', IncidentSchema);


