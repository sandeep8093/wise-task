const router = require('express').Router();
const InstructorController = require('../controllers/auth.controller');
const {verifyToken, verifyTokenAndAdmin} = require('../middlewares/index')
const validator = require('../middlewares/validate')

router.post('/signup', validator.signUp, InstructorController.signup);
router.post('/login', validator.login, InstructorController.login);

router.get('/get-instructors', verifyTokenAndAdmin, InstructorController.getInstructors);
router.get('/get-profile', verifyToken, InstructorController.getInstructorProfile);
router.delete('/delete-profile', verifyTokenAndAdmin, InstructorController.deleteInstructor);

module.exports = router