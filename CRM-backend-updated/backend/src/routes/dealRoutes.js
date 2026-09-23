const router = require('express').Router();
const dealController = require('../controllers/dealController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDealSchema, updateDealSchema } = require('../validators/dealValidator');
const auditLog = require('../middleware/audit');

router.use(authenticate);

router
  .route('/')
  .post(authorize('admin', 'sales'), validate(createDealSchema), auditLog('create', 'deal'), dealController.createDeal)
  .get(dealController.getDeals);

router
  .route('/:id')
  .get(dealController.getDealById)
  .put(authorize('admin', 'sales'), validate(updateDealSchema), auditLog('update', 'deal'), dealController.updateDeal)
  .delete(authorize('admin'), auditLog('delete', 'deal'), dealController.deleteDeal);

router.patch('/:id/stage', authorize('admin', 'sales'), auditLog('stage_update', 'deal'), dealController.updateDealStage);

module.exports = router;

