// controllers/userDetail.controller.js
import UserDetail from '../models/user-details.js';
import User from '../models/user.model.js';

// Create user detail
export const createUserDetail = async (req, res) => {
    try {
        const { 
            fullname, 
            age, 
            gender, 
            motherTongue, 
            languagesKnown, 
            highestQualification, 
            section, 
            residence 
        } = req.body;

        // Check if user detail already exists for this user
        const existingDetail = await UserDetail.findOne({ user: req.user.sub });
        if (existingDetail) {
            return res.status(400).json({
                success: false,
                message: 'User detail already exists. Use update instead.'
            });
        }

        // Validate that the user exists
        const user = await User.findById(req.user.sub);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userDetail = new UserDetail({
            user: req.user.sub,
            fullname,
            age,
            gender,
            motherTongue: motherTongue || [],
            languagesKnown: languagesKnown || [],
            highestQualification,
            section,
            residence
        });

        const savedDetail = await userDetail.save();
        
        // Populate user reference
        await savedDetail.populate('user', '-password');

        res.status(201).json({
            success: true,
            message: 'User detail created successfully',
            data: savedDetail
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating user detail',
            error: error.message
        });
    }
};

// Get all user details
export const getAllUserDetails = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        let query = {};
        
        // Add search functionality
        if (search) {
            query.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { residence: { $regex: search, $options: 'i' } },
                { highestQualification: { $regex: search, $options: 'i' } }
            ];
        }

        const userDetails = await UserDetail.find(query)
            .populate('user', '-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await UserDetail.countDocuments(query);

        res.json({
            success: true,
            data: userDetails,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user details',
            error: error.message
        });
    }
};

// Get user detail by ID
export const getUserDetailById = async (req, res) => {
    try {
        const { id } = req.params;

        const userDetail = await UserDetail.findById(id)
            .populate('user', '-password');

        if (!userDetail) {
            return res.status(404).json({
                success: false,
                message: 'User detail not found'
            });
        }

        res.json({
            success: true,
            data: userDetail
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user detail',
            error: error.message
        });
    }
};

// Get user detail by user ID
export const getUserDetailByUserId = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.sub;

        const userDetail = await UserDetail.findOne({ user: userId })
            .populate('user', '-password');

        if (!userDetail) {
            return res.status(404).json({
                success: false,
                message: 'User detail not found'
            });
        }

        res.json({
            success: true,
            data: userDetail
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user detail',
            error: error.message
        });
    }
};

// Update user detail
export const updateUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if user detail exists and belongs to the user
        const existingDetail = await UserDetail.findById(id);
        if (!existingDetail) {
            return res.status(404).json({
                success: false,
                message: 'User detail not found'
            });
        }

        // Optional: Check if the logged-in user owns this detail
        // if (existingDetail.user.toString() !== req.user.sub) {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Access denied'
        //     });
        // }

        const updatedDetail = await UserDetail.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('user', '-password');

        res.json({
            success: true,
            message: 'User detail updated successfully',
            data: updatedDetail
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating user detail',
            error: error.message
        });
    }
};

// Delete user detail
export const deleteUserDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const userDetail = await UserDetail.findById(id);
        if (!userDetail) {
            return res.status(404).json({
                success: false,
                message: 'User detail not found'
            });
        }

        await UserDetail.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'User detail deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user detail',
            error: error.message
        });
    }
};