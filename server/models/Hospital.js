import mongoose from 'mongoose';

const HospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Hospital', HospitalSchema);


