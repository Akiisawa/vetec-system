const { Router } = require('express');
const { AuthService } = require('../application/auth-service');
const { authenticate } = require('../../../app/middleware/auth');
const router = Router();
router.post('/login',async(req,res,next)=>{try{res.json({ok:true,data:await AuthService.login(req.body||{})})}catch(e){next(e)}});
router.get('/me',authenticate,(req,res,next)=>{try{res.json({ok:true,data:AuthService.me(req.user.id)})}catch(e){next(e)}});
module.exports = router;