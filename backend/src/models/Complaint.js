import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sector: {
    type: String,
    required: true,
    enum: ['Water', 'Roads', 'Electricity', 'Health', 'Education', 'Sanitation', 'Transport', 'Others'],
    trim: true
  },
  complaint_text: {
    type: String,
    required: true,
    trim: true
  },
  location: {
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
    }
  },
  assigned_authority_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Authority',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  ai_analysis: {
    detected_sector: {
      type: String,
      trim: true
    },
    confidence_score: {
      type: Number,
      min: 0,
      max: 1
    },
    notes: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for efficient queries
complaintSchema.index({ user_id: 1 });
complaintSchema.index({ assigned_authority_id: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ sector: 1 });
complaintSchema.index({ 'location.state': 1, 'location.district': 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
