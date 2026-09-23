const dealService = require('../../src/services/dealService');
const Deal = require('../../src/models/Deal');
const { NotFoundError } = require('../../src/utils/ApiError');

// Mock the Deal model
jest.mock('../../src/models/Deal');

describe('DealService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Create Deal ───────────────────────────────────────────────
  describe('createDeal', () => {
    it('should create a deal successfully', async () => {
      const mockDealData = {
        lead: 'lead123',
        title: 'Big Deal',
        value: 50000,
        stage: 'discovery',
        assignedTo: 'user123',
        expectedCloseDate: new Date('2025-06-30'),
      };

      const mockCreatedDeal = { _id: 'deal123', ...mockDealData };
      Deal.create.mockResolvedValue(mockCreatedDeal);

      const result = await dealService.createDeal(mockDealData);

      expect(Deal.create).toHaveBeenCalledWith(mockDealData);
      expect(result).toHaveProperty('_id', 'deal123');
      expect(result).toHaveProperty('title', 'Big Deal');
      expect(result).toHaveProperty('value', 50000);
    });
  });

  // ─── Get Deals ─────────────────────────────────────────────────
  describe('getDeals', () => {
    it('should return paginated deals with default params', async () => {
      const mockDeals = [
        { _id: 'deal1', title: 'Deal One', value: 10000 },
        { _id: 'deal2', title: 'Deal Two', value: 20000 },
      ];

      const mockLean = jest.fn().mockResolvedValue(mockDeals);
      Deal.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: mockLean,
      });
      Deal.countDocuments.mockResolvedValue(2);

      const result = await dealService.getDeals({});

      expect(Deal.find).toHaveBeenCalledWith({});
      expect(result).toHaveProperty('deals');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('page', 1);
      expect(result.pagination).toHaveProperty('limit', 10);
      expect(result.pagination).toHaveProperty('total', 2);
      expect(result.pagination).toHaveProperty('pages', 1);
    });

    it('should apply stage filter when provided', async () => {
      const mockLean = jest.fn().mockResolvedValue([]);
      Deal.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: mockLean,
      });
      Deal.countDocuments.mockResolvedValue(0);

      await dealService.getDeals({ stage: 'proposal' });

      expect(Deal.find).toHaveBeenCalledWith({ stage: 'proposal' });
    });

    it('should apply assignedTo filter when provided', async () => {
      const mockLean = jest.fn().mockResolvedValue([]);
      Deal.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: mockLean,
      });
      Deal.countDocuments.mockResolvedValue(0);

      await dealService.getDeals({ assignedTo: 'user123' });

      expect(Deal.find).toHaveBeenCalledWith({ assignedTo: 'user123' });
    });
  });

  // ─── Get Deal By ID ────────────────────────────────────────────
  describe('getDealById', () => {
    it('should return a deal when found', async () => {
      const mockDeal = { _id: 'deal123', title: 'Big Deal', value: 50000 };
      const mockLean = jest.fn().mockResolvedValue(mockDeal);

      Deal.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      const result = await dealService.getDealById('deal123');

      expect(Deal.findById).toHaveBeenCalledWith('deal123');
      expect(result).toHaveProperty('_id', 'deal123');
      expect(result).toHaveProperty('title', 'Big Deal');
    });

    it('should throw NotFoundError when deal not found', async () => {
      const mockLean = jest.fn().mockResolvedValue(null);
      Deal.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      await expect(dealService.getDealById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  // ─── Update Deal ───────────────────────────────────────────────
  describe('updateDeal', () => {
    it('should update a deal successfully', async () => {
      const updateData = { value: 75000 };
      const updatedDeal = { _id: 'deal123', title: 'Big Deal', value: 75000 };

      const mockLean = jest.fn().mockResolvedValue(updatedDeal);
      Deal.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      const result = await dealService.updateDeal('deal123', updateData);

      expect(Deal.findByIdAndUpdate).toHaveBeenCalledWith('deal123', updateData, {
        new: true,
        runValidators: true,
      });
      expect(result).toHaveProperty('value', 75000);
    });

    it('should throw NotFoundError when deal to update not found', async () => {
      const mockLean = jest.fn().mockResolvedValue(null);
      Deal.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      await expect(dealService.updateDeal('nonexistent', { value: 100 })).rejects.toThrow(NotFoundError);
    });
  });

  // ─── Update Deal Stage ─────────────────────────────────────────
  describe('updateDealStage', () => {
    it('should update deal stage successfully', async () => {
      const updatedDeal = { _id: 'deal123', title: 'Big Deal', stage: 'closed_won' };

      const mockLean = jest.fn().mockResolvedValue(updatedDeal);
      Deal.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      const result = await dealService.updateDealStage('deal123', 'closed_won');

      expect(Deal.findByIdAndUpdate).toHaveBeenCalledWith('deal123', { stage: 'closed_won' }, { new: true });
      expect(result).toHaveProperty('stage', 'closed_won');
    });

    it('should throw NotFoundError when deal for stage update not found', async () => {
      const mockLean = jest.fn().mockResolvedValue(null);
      Deal.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: mockLean,
      });

      await expect(dealService.updateDealStage('nonexistent', 'closed_lost')).rejects.toThrow(NotFoundError);
    });
  });

  // ─── Delete Deal ───────────────────────────────────────────────
  describe('deleteDeal', () => {
    it('should delete a deal successfully', async () => {
      const deletedDeal = { _id: 'deal123', title: 'Big Deal' };
      Deal.findByIdAndDelete.mockResolvedValue(deletedDeal);

      const result = await dealService.deleteDeal('deal123');

      expect(Deal.findByIdAndDelete).toHaveBeenCalledWith('deal123');
      expect(result).toHaveProperty('_id', 'deal123');
    });

    it('should throw NotFoundError when deal to delete not found', async () => {
      Deal.findByIdAndDelete.mockResolvedValue(null);

      await expect(dealService.deleteDeal('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});

