import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    index: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    default: 'email_verification'
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 } 
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  }
}, { 
  timestamps: true 
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.methods.isValid = function() {
  return this.attempts < this.maxAttempts && new Date() < this.expiresAt;
};

otpSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  await this.save();
};

export default mongoose.model('OTP', otpSchema);