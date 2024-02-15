const router = require('express').Router();
const trackController = require('../controllers/tracking.controller');
const {verifyToken} = require('../middlewares/index')

router.post('/check-in', verifyToken, trackController.checkIn);
router.post('/check-out', verifyToken, trackController.checkOut);
router.get('/get-monthly-report', verifyToken, trackController.monthlyReport);


module.exports = router