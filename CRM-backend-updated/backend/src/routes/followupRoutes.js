const router = require('express').Router();
const followupController = require('../controllers/followupController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createFollowupSchema, updateFollowupSchema } = require('../validators/followupValidator');
const auditLog = require('../middleware/audit');

router.use(authenticate);

router
  .route('/')
  .post(authorize('admin', 'sales'), validate(createFollowupSchema), auditLog('create', 'followup'), followupController.createFollowup)
  .get(followupController.getFollowups);

router
  .route('/:id')
  .put(authorize('admin', 'sales'), validate(updateFollowupSchema), auditLog('update', 'followup'), followupController.updateFollowup);

router.patch('/:id/complete', authorize('admin', 'sales'), auditLog('complete', 'followup'), followupController.completeFollowup);

module.exports = router;

