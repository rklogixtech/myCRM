const router = require('express').Router();
const leadController = require('../controllers/leadController');
const assignmentController = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createLeadSchema, updateLeadSchema } = require('../validators/leadValidator');
const auditLog = require('../middleware/audit');

router.use(authenticate);

router
  .route('/')
  .post(authorize('admin', 'sales'), validate(createLeadSchema), auditLog('create', 'lead'), leadController.createLead)
  .get(leadController.getLeads);

router
  .route('/:id')
  .get(leadController.getLeadById)
  .put(authorize('admin', 'sales'), validate(updateLeadSchema), auditLog('update', 'lead'), leadController.updateLead)
  .delete(authorize('admin'), auditLog('delete', 'lead'), leadController.deleteLead);

router.put('/:id/assign', authorize('admin'), auditLog('assign', 'lead'), assignmentController.assignLead);

module.exports = router;

