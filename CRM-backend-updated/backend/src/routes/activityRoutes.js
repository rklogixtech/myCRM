const router = require('express').Router();
const activityController = require('../controllers/activityController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createActivitySchema } = require('../validators/activityValidator');
const auditLog = require('../middleware/audit');

router.use(authenticate);

router.post('/', authorize('admin', 'sales'), validate(createActivitySchema), auditLog('create', 'activity'), activityController.createActivity);
router.get('/:leadId', activityController.getActivityTimeline);

module.exports = router;

