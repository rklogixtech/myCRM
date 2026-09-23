const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, authorize('admin', 'sales'), dashboardController.getStats);

module.exports = router;

