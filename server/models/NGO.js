import mongoose from 'mongoose';

const NGOSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    services: { type: [String], default: [] },
    area: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('NGO', NGOSchema);


