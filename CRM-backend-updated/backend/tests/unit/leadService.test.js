const leadService = require('../../src/services/leadService');
const Lead = require('../../src/models/Lead');
const { NotFoundError } = require('../../src/utils/ApiError');

// Mock the Lead model
jest.mock('../../src/models/Lead');

describe('LeadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Create Lead ───────────────────────────────────────────────
  describe('createLead', () => {
    it('should create a lead successfully', async () => {
      const mockLeadData = {
        name: 'Alice Smith',
        email: 'alice@example.com',
        phone: '1234567890',
        company: 'Acme Inc',
        source: 'website',
        status: 'new',
      };

      const mockCreatedLead = { _id: 'lead123', ...mockLeadData, save: jest.fn() };
      Lead.create.mockResolvedValue(mockCreatedLead);

      const result = await leadService.createLead(mockLeadData);

      expect(Lead.create).toHaveBeenCalledWith(mockLeadData);
      expect(result).toHaveProperty('_id', 'lead123');
      expect(result).toHaveProperty('email', 'alice@example.com');
    });
  });

  // ─── Get Leads ─────────────────────────────────────────────────
  describe('getLeads', () => {
    it('should return paginated leads with default params', async () => {
      const mockLeads = [
        { _id: 'lead1', name: 'Alice' },
        { _id: 'lead2', name: 'Bob' },
      ];

      // Mock chain for Lead.find().populate().sort().skip().limit().lean()
      const mockLean = jest.fn().mockResolvedValue(mockLeads);
      const mockLimit = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();

      Lead.find.mockReturnValue({
        populate: mockPopulate,
        sort: mockSort,
        skip: mockSkip,
        limit: mockLimit,
        lean: mockLean,
      });

      Lead.countDocuments.mockResolvedValue(2);

      const result = await leadService.getLeads({});

      expect(Lead.find).toHaveBeenCalledWith({});
      expect(Lead.countDocuments).toHaveBeenCalledWith({});
      expect(result).toHaveProperty('leads');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('page', 1);
      expect(result.pagination).toHaveProperty('limit', 10);
      expect(result.pagination).toHaveProperty('total', 2);
      expect(result.pagination).toHaveProperty('pages', 1);
    });

    it('should apply status filter when provided', async () => {
      const mockLean = jest.fn().mockResolvedValue([]);
      Lead.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: mockLean,
      });
      Lead.countDocuments.mockResolvedValue(0);

      await leadService.getLeads({ status: 'new' });

      expect(Lead.find).toHaveBeenCalledWith({ status: 'new' });
    });

    it('should apply assignedTo filter when provided', async () => {
      const mockLean = jest.fn().mockResolvedValue([]);
      Lead.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: mockLean,
      });
      Lead.countDocuments.mockResolvedValue(0);

      await leadService.getLeads({ assignedTo: 'user123' });

      expect(Lead.find).toHaveBeenCalledWith({ assignedTo: 'user123' });
    });

    it('should apply search filter when provided', async () => {
      const mockLean = jest.fn().mockResolvedValue([]);
      Lead.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: mockLean,
      });
      Lead.countDocuments.mockResolvedValue(0);

      await leadService.getLeads({ search: 'Alice' });

      expect(Lead.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ $regex: 'Alice' }) }),
            expect.objectContaining({ email: expect.objectContaining({ $regex: 'Alice' }) }),
            expect.objectContaining({ company: expect.objectContaining({ $regex: 'Alice' }) }),
          ]),
        })
      );
    });

    it('should apply custom pagination params', async () => {
      const mockLean = jest.fn().mockResolvedValue([]);
      Lead.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: mockLean,
      });
      Lead.countDocuments.mockResolvedValue(25);

      const result = await leadService.getLeads({ page: 3, limit: 10 });

      expect(result.pagination).toHaveProperty('page', 3);
      expect(result.pagination).toHaveProperty('limit', 10);
      expect(result.pagination).toHaveProperty('total', 25);
      expect(result.pagination).toHaveProperty('pages', 3);
    });
  });

  // ─── Get Lead By ID ────────────────────────────────────────────
  describe('getLeadById', () => {
    it('should return a lead when found', async () => {
      const mockLead = { _id: 'lead123', name: 'Alice', email: 'alice@example.com' };
      const mockLean = jest.fn().mockResolvedValue(mockLead);

      Lead.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      const result = await leadService.getLeadById('lead123');

      expect(Lead.findById).toHaveBeenCalledWith('lead123');
      expect(result).toHaveProperty('_id', 'lead123');
    });

    it('should throw NotFoundError when lead not found', async () => {
      const mockLean = jest.fn().mockResolvedValue(null);

      Lead.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      await expect(leadService.getLeadById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  // ─── Update Lead ───────────────────────────────────────────────
  describe('updateLead', () => {
    it('should update a lead successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedLead = { _id: 'lead123', name: 'Updated Name', email: 'alice@example.com' };

      const mockLean = jest.fn().mockResolvedValue(updatedLead);
      Lead.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      const result = await leadService.updateLead('lead123', updateData);

      expect(Lead.findByIdAndUpdate).toHaveBeenCalledWith('lead123', updateData, {
        new: true,
        runValidators: true,
      });
      expect(result).toHaveProperty('name', 'Updated Name');
    });

    it('should throw NotFoundError when lead to update not found', async () => {
      const mockLean = jest.fn().mockResolvedValue(null);

      Lead.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      await expect(leadService.updateLead('nonexistent', { name: 'Test' })).rejects.toThrow(NotFoundError);
    });
  });

  // ─── Delete Lead ───────────────────────────────────────────────
  describe('deleteLead', () => {
    it('should delete a lead successfully', async () => {
      const deletedLead = { _id: 'lead123', name: 'Alice' };
      Lead.findByIdAndDelete.mockResolvedValue(deletedLead);

      const result = await leadService.deleteLead('lead123');

      expect(Lead.findByIdAndDelete).toHaveBeenCalledWith('lead123');
      expect(result).toHaveProperty('_id', 'lead123');
    });

    it('should throw NotFoundError when lead to delete not found', async () => {
      Lead.findByIdAndDelete.mockResolvedValue(null);

      await expect(leadService.deleteLead('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  // ─── Assign Lead ───────────────────────────────────────────────
  describe('assignLead', () => {
    it('should assign a lead to a user successfully', async () => {
      const assignedLead = {
        _id: 'lead123',
        name: 'Alice',
        assignedTo: { _id: 'user456', name: 'Admin', email: 'admin@example.com' },
      };

      const mockLean = jest.fn().mockResolvedValue(assignedLead);
      Lead.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      const result = await leadService.assignLead('lead123', 'user456');

      expect(Lead.findByIdAndUpdate).toHaveBeenCalledWith('lead123', { assignedTo: 'user456' }, { new: true });
      expect(result).toHaveProperty('assignedTo');
    });

    it('should throw NotFoundError when lead to assign not found', async () => {
      const mockLean = jest.fn().mockResolvedValue(null);

      Lead.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      await expect(leadService.assignLead('nonexistent', 'user456')).rejects.toThrow(NotFoundError);
    });
  });
});

