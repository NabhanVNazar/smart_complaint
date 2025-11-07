import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const departmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: true,
    trim: true
  },
  departmentType: {
    type: String,
    required: true,
    enum: ['Water', 'Roads', 'Electricity', 'Health', 'Education', 'Sanitation', 'Transport', 'Others'],
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  officerName: {
    type: String,
    required: true,
    trim: true
  },
  authority_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Authority',
    required: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
departmentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
departmentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for efficient queries
departmentSchema.index({ email: 1 });
departmentSchema.index({ authority_id: 1 });
departmentSchema.index({ departmentType: 1 });
departmentSchema.index({ is_active: 1 });

const Department = mongoose.model('Department', departmentSchema);

export default Department;
