import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      required: true,
      enum: ['flood', 'fire', 'earthquake', 'cyclone', 'landslide', 'heatwave', 'storm']
    },
    severity: { 
      type: String, 
      required: true,
      enum: ['low', 'medium', 'high', 'critical']
    },
    region: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String }
    },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    affectedRadius: { type: Number, default: 5000 }, // radius in meters
    evacuationRequired: { type: Boolean, default: false },
    emergencyContacts: [{
      name: String,
      phone: String,
      role: String
    }]
  },
  { timestamps: true }
);

// Index for geospatial queries
AlertSchema.index({ "location.lat": 1, "location.lng": 1 });
AlertSchema.index({ isActive: 1, expiresAt: 1 });

export default mongoose.model('Alert', AlertSchema);