// routes/user.routes.js
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/user.model.js';
import {
    createUserDetail,
    getAllUserDetails,
    getUserDetailById,
    getUserDetailByUserId,
    updateUserDetail,
    deleteUserDetail
} from '../controllers/userDetail.controller.js';

const router = Router();

router.get('/me', auth(), async (req, res) => {
    const user = await User.findById(req.user.sub).select('-password');
    res.json(user);
});

router.get('/details', auth(), getAllUserDetails); 
router.get('/detail/:id', auth(), getUserDetailById); 
router.get('/detail', auth(), getUserDetailByUserId); 
router.get('/detail/user/:userId', auth(), getUserDetailByUserId);
router.post('/create-detail', auth(), createUserDetail);
router.put('/detail/:id', auth(), updateUserDetail);
router.delete('/detail/:id', auth(), deleteUserDetail);

export default router;