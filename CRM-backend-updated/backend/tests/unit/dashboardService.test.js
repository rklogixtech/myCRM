const dashboardService = require('../../src/services/dashboardService');
const Lead = require('../../src/models/Lead');
const Deal = require('../../src/models/Deal');
const Followup = require('../../src/models/Followup');
const { getCache, setCache, deleteCache } = require('../../src/utils/cache');

jest.mock('../../src/models/Lead');
jest.mock('../../src/models/Deal');
jest.mock('../../src/models/Followup');
jest.mock('../../src/utils/cache');

describe('DashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return cached stats without hitting the DB on a cache hit', async () => {
      const cachedStats = { totalLeads: 42, leadsByStatus: {}, cached: true };
      getCache.mockResolvedValue(cachedStats);

      const result = await dashboardService.getStats();

      expect(getCache).toHaveBeenCalledWith('dashboard:stats');
      expect(Lead.countDocuments).not.toHaveBeenCalled();
      expect(result).toMatchObject({ totalLeads: 42, cached: true });
    });

    it('should query the DB, cache the result, and mark it uncached on a cache miss', async () => {
      getCache.mockResolvedValue(null);
      Lead.countDocuments.mockResolvedValue(10);
      Lead.aggregate.mockResolvedValue([{ _id: 'new', count: 10 }]);
      Deal.countDocuments.mockResolvedValue(5);
      Deal.aggregate
        .mockResolvedValueOnce([{ _id: 'won', count: 2 }])
        .mockResolvedValueOnce([{ _id: null, total: 5000 }]);
      Followup.countDocuments.mockResolvedValue(3);
      Lead.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      const result = await dashboardService.getStats();

      expect(Lead.countDocuments).toHaveBeenCalled();
      expect(setCache).toHaveBeenCalledWith(
        'dashboard:stats',
        expect.objectContaining({ totalLeads: 10, totalDeals: 5, totalDealValue: 5000 }),
        expect.any(Number)
      );
      expect(result).toMatchObject({ totalLeads: 10, cached: false });
    });
  });

  describe('invalidateStatsCache', () => {
    it('should delete the dashboard cache key', async () => {
      await dashboardService.invalidateStatsCache();
      expect(deleteCache).toHaveBeenCalledWith('dashboard:stats');
    });
  });
});
