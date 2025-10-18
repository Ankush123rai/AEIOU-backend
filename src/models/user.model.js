// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String },
//   role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
//   loginMethod: { type: String, enum: ['email', 'google'], default: 'email' },
//   isVerified: { type: Boolean, default: false }
// }, { timestamps: true });

// userSchema.methods.setPassword = async function (password) {
//   this.password = await bcrypt.hash(password, 10);
// };

// userSchema.methods.validatePassword = async function (password) {
//   if (!this.password) return false;
//   return bcrypt.compare(password, this.password);
// };

// export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  loginMethod: { type: String, enum: ['email', 'google'], default: 'email' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Password methods
userSchema.methods.setPassword = async function (password) {
  this.password = await bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// ======== AUTOMATIC DELETION MIDDLEWARE ========

// Middleware to delete user details when a single user is deleted
userSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      // Delete all user details associated with this user
      await mongoose.model('UserDetail').deleteMany({ user: doc._id });
      console.log(`Automatically deleted user details for user: ${doc._id}`);
    } catch (error) {
      console.error('Error automatically deleting user details:', error);
    }
  }
});

// Middleware to delete user details when multiple users are deleted
userSchema.post('deleteMany', async function(result) {
  try {
    const filter = this.getFilter();
    // Delete all user details associated with the deleted users
    await mongoose.model('UserDetail').deleteMany(filter);
    console.log('Automatically deleted user details for multiple users');
  } catch (error) {
    console.error('Error automatically deleting user details for multiple users:', error);
  }
});

// ======== ALTERNATIVE STATIC METHODS (More Reliable) ========

// Static method to delete user with all associated details (recommended)
userSchema.statics.deleteUserWithDetails = async function(userId) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Delete user
      await this.findByIdAndDelete(userId).session(session);
      // Delete associated user details
      await mongoose.model('UserDetail').deleteMany({ user: userId }).session(session);
    });
    console.log(`Successfully deleted user and details for: ${userId}`);
  } catch (error) {
    console.error('Error in deleteUserWithDetails:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

// Static method to delete multiple users with their details
userSchema.statics.deleteUsersWithDetails = async function(userIds) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Delete users
      await this.deleteMany({ _id: { $in: userIds } }).session(session);
      // Delete associated user details
      await mongoose.model('UserDetail').deleteMany({ user: { $in: userIds } }).session(session);
    });
    console.log(`Successfully deleted ${userIds.length} users and their details`);
  } catch (error) {
    console.error('Error in deleteUsersWithDetails:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

export default mongoose.model('User', userSchema);