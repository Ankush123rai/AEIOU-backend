import User from '../models/user.model.js';
import OTP from '../models/otp.model.js';
import { signJwt } from '../utils/jwt.js';
import Joi from 'joi';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/emailService.js';

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student','teacher','admin').default('student')
});

export async function register(req, res, next) {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    
    const existingUser = await User.findOne({ email: value.email });
    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    await OTP.deleteMany({ email: value.email, type: 'email_verification' });

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    const otpRecord = new OTP({
      email: value.email,
      otp: otp,
      type: 'email_verification',
      expiresAt: expiresAt
    });
    await otpRecord.save();

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = value.name;
      existingUser.role = value.role;
      await existingUser.setPassword(value.password);
      await existingUser.save();
    } else {
      const user = new User({ 
        name: value.name, 
        email: value.email, 
        role: value.role,
        loginMethod: 'email',
        isVerified: false
      });
      await user.setPassword(value.password);
      await user.save();
    }

    await sendVerificationEmail(value.email, otp);

    res.status(200).json({ 
      message: 'Verification OTP sent to your email',
      email: value.email
    });
  } catch (e) { 
    next(e); 
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ 
      email, 
      type: 'email_verification' 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    if (!otpRecord.isValid()) {
      await OTP.deleteMany({ email, type: 'email_verification' });
      return res.status(400).json({ error: 'OTP expired or maximum attempts reached' });
    }

    if (otpRecord.otp.toString() !== otp.toString()) {
      await otpRecord.incrementAttempts();
      const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
      return res.status(400).json({ 
        error: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found. Please register again.' });
    }

    user.isVerified = true;
    await user.save();

    await OTP.deleteMany({ email, type: 'email_verification' });

    const token = signJwt({ 
      sub: user._id, 
      role: user.role, 
      email: user.email, 
      name: user.name 
    });
    
    res.status(201).json({ 
      message: 'Registration successful',
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isVerified: user.isVerified
      } 
    });
  } catch (e) { 
    next(e); 
  }
}

export async function resendOtp(req, res, next) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No pending registration found for this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Delete any existing OTPs
    await OTP.deleteMany({ email, type: 'email_verification' });

    // Generate new OTP
    const newOtp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new OTP record
    const otpRecord = new OTP({
      email: email,
      otp: newOtp,
      type: 'email_verification',
      expiresAt: expiresAt
    });
    await otpRecord.save();

    // Send new verification email
    await sendVerificationEmail(email, newOtp);

    res.status(200).json({ 
      message: 'New OTP sent to your email',
      email: email
    });
  } catch (e) { 
    next(e); 
  }
}

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export async function googleLogin(req, res, next) {
  try {
    const { email, name } = req.body; 
    if (!email || !name) return res.status(400).json({ error: 'email and name required' });
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, role: 'student' });
      await user.save();
    }
    const token = signJwt({ sub: user._id, role: user.role, email: user.email, name: user.name });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    
    const user = await User.findOne({ email: value.email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Email not verified. Please verify your email before logging in.' 
      });
    }
    
    if (user.loginMethod === 'google') {
      return res.status(401).json({ 
        error: 'This account uses Google login. Please sign in with Google.' 
      });
    }
    
    const ok = await user.validatePassword(value.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = signJwt({ sub: user._id, role: user.role, email: user.email, name: user.name });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
}

export async function cleanupExpiredOtps() {
  try {
    const result = await OTP.deleteMany({ 
      expiresAt: { $lt: new Date() } 
    });
    console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
  }
}