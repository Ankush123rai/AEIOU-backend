import mongoose from "mongoose";

const userDetailSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullname: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    motherTongue: [{ name: String }],
    languagesKnown: [{ name: String }],
    highestQualification: { type: String, required: true },
    section: { type: String },
    residence: { type: String, required: true },
}, {
    timestamps: true
});

userDetailSchema.index({ user: 1 });

export default mongoose.model('UserDetail', userDetailSchema);