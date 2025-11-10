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
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  officerName: {
    type: String,
    trim: true
  },
  password: {
    type: String,
  },
  type: {
    type: String,
    default: 'department'
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

// Compare password method
departmentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Department = mongoose.model('Department', departmentSchema);

export default Department;
