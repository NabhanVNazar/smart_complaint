import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: {
    type: String, // Title is no longer strictly required for this flow
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In-Progress', 'Resolved', 'pending', 'in-progress', 'resolved'], // Allow for different cases
    default: 'Pending'
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department', // Reference to the Department model
    required: false,   // Make it explicitly optional
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
