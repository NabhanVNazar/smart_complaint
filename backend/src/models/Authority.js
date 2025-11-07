import mongoose from 'mongoose';

const authoritySchema = new mongoose.Schema({
  authority_name: {
    type: String,
    required: true,
    trim: true
  },
  sector: {
    type: String,
    required: true,
    enum: ['Water', 'Roads', 'Electricity', 'Health', 'Education', 'Sanitation', 'Transport', 'Others'],
    trim: true
  },
  gov_level: {
    type: String,
    required: true,
    enum: ['Central', 'State', 'District', 'Local'],
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  taluk: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  geo: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient geo queries
authoritySchema.index({ 'geo': '2dsphere' });
authoritySchema.index({ sector: 1, state: 1, district: 1 });

const Authority = mongoose.model('Authority', authoritySchema);

export default Authority;
