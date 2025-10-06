const mongoose = require('mongoose');
const winston = require('winston');
const RankingHistory = require('../models/RankingHistory');
const CompetitorSnapshot = require('../models/CompetitorSnapshot');
const WeeklyReport = require('../models/WeeklyReport');

/**
 * MongoDB Service
 * Handles data persistence for historical tracking
 */
class MongoService {
  /**
   * Save ranking snapshot to history
   */
  async saveRankingSnapshot(auditData) {
    try {
      if (!mongoose.connection.readyState) {
        winston.warn('MongoDB not connected - skipping ranking snapshot save');
        return null;
      }

      const { restaurant, ranking, scores } = auditData;

      const snapshot = new RankingHistory({
        placeId: restaurant.placeId,
        restaurantName: restaurant.name,
        googleRank: ranking.googleRank,
        localRank: ranking.googleRank, // Same for now
        totalCompetitors: ranking.totalCompetitors,
        overallScore: scores.overall,
        seoScore: scores.seo,
        performanceScore: scores.pageSpeed?.overall || 0,
        rating: restaurant.rating,
        totalRatings: restaurant.totalRatings,
        estimatedMonthlyVisitors: scores.traffic?.estimatedMonthlyVisitors || 0,
        revenueImpact: auditData.revenueImpact || { monthly: 0, annual: 0 },
        recordDate: new Date()
      });

      // Add week number and year
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const daysSinceStart = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
      snapshot.weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
      snapshot.year = now.getFullYear();

      await snapshot.save();

      winston.info(`Ranking snapshot saved for ${restaurant.name} (Rank: ${ranking.googleRank})`);

      return snapshot;
    } catch (error) {
      winston.error(`Failed to save ranking snapshot: ${error.message}`);
      return null;
    }
  }

  /**
   * Save competitor snapshot to history
   */
  async saveCompetitorSnapshot(auditData) {
    try {
      if (!mongoose.connection.readyState) {
        winston.warn('MongoDB not connected - skipping competitor snapshot save');
        return null;
      }

      const { restaurant, ranking, competitors } = auditData;

      // Get previous snapshot to calculate changes
      const previousSnapshot = await CompetitorSnapshot.findOne({
        placeId: restaurant.placeId
      })
      .sort({ recordDate: -1 })
      .lean();

      const previousCompetitorsMap = new Map();
      if (previousSnapshot) {
        previousSnapshot.competitors.forEach(c => {
          previousCompetitorsMap.set(c.placeId, c);
        });
      }

      // Calculate changes for each competitor
      const competitorsWithChanges = (competitors || []).map((comp, index) => {
        const previous = previousCompetitorsMap.get(comp.placeId);
        return {
          placeId: comp.placeId,
          name: comp.name,
          rating: comp.rating,
          totalRatings: comp.totalRatings,
          distance: comp.distance,
          rank: index + 1,
          types: comp.types || [],
          ratingChange: previous ? (comp.rating - previous.rating) : 0,
          reviewsChange: previous ? (comp.totalRatings - previous.totalRatings) : 0,
          rankChange: previous ? (previous.rank - (index + 1)) : 0
        };
      });

      // Calculate stats
      const competitorStats = {
        averageRating: competitors.reduce((sum, c) => sum + (c.rating || 0), 0) / competitors.length,
        averageReviews: competitors.reduce((sum, c) => sum + (c.totalRatings || 0), 0) / competitors.length,
        totalCompetitors: competitors.length,
        strongerCompetitors: competitors.filter(c => c.rating > restaurant.rating).length,
        weakerCompetitors: competitors.filter(c => c.rating < restaurant.rating).length
      };

      const snapshot = new CompetitorSnapshot({
        placeId: restaurant.placeId,
        competitors: competitorsWithChanges,
        competitorStats,
        yourPosition: {
          rank: ranking.googleRank,
          percentile: ((ranking.totalCompetitors - ranking.googleRank + 1) / ranking.totalCompetitors) * 100
        },
        recordDate: new Date()
      });

      // Add week number and year
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const daysSinceStart = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
      snapshot.weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
      snapshot.year = now.getFullYear();

      await snapshot.save();

      winston.info(`Competitor snapshot saved with ${competitors.length} competitors`);

      return snapshot;
    } catch (error) {
      winston.error(`Failed to save competitor snapshot: ${error.message}`);
      return null;
    }
  }

  /**
   * Get ranking history
   */
  async getRankingHistory(placeId, days = 30) {
    try {
      if (!mongoose.connection.readyState) {
        winston.warn('MongoDB not connected - cannot retrieve ranking history');
        return null;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const history = await RankingHistory.find({
        placeId,
        recordDate: { $gte: startDate }
      })
      .sort({ recordDate: 1 })
      .lean();

      return history;
    } catch (error) {
      winston.error(`Failed to get ranking history: ${error.message}`);
      return null;
    }
  }

  /**
   * Get competitor trends
   */
  async getCompetitorTrends(placeId, days = 30) {
    try {
      if (!mongoose.connection.readyState) {
        winston.warn('MongoDB not connected - cannot retrieve competitor trends');
        return null;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await CompetitorSnapshot.find({
        placeId,
        recordDate: { $gte: startDate }
      })
      .sort({ recordDate: 1 })
      .lean();

      return trends;
    } catch (error) {
      winston.error(`Failed to get competitor trends: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate weekly report
   */
  async generateWeeklyReport(placeId) {
    try {
      if (!mongoose.connection.readyState) {
        winston.warn('MongoDB not connected - cannot generate weekly report');
        return null;
      }

      const weekInfo = WeeklyReport.getCurrentWeekInfo();

      // Check if report already exists for this week
      const existingReport = await WeeklyReport.findOne({
        placeId,
        year: weekInfo.year,
        weekNumber: weekInfo.weekNumber
      }).lean();

      if (existingReport) {
        winston.info(`Weekly report already exists for week ${weekInfo.weekNumber}`);
        return existingReport;
      }

      // Get this week's data
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - 7);

      const thisWeekRankings = await RankingHistory.find({
        placeId,
        recordDate: { $gte: thisWeekStart }
      }).sort({ recordDate: 1 }).lean();

      if (thisWeekRankings.length === 0) {
        winston.info('No ranking data available for weekly report');
        return null;
      }

      const currentRanking = thisWeekRankings[thisWeekRankings.length - 1];
      const weekStartRanking = thisWeekRankings[0];

      // Get last week's final ranking
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

      const lastWeekRanking = await RankingHistory.findOne({
        placeId,
        recordDate: { $lte: lastWeekEnd }
      }).sort({ recordDate: -1 }).lean();

      // Calculate performance changes
      const performance = {
        currentRank: currentRanking.googleRank,
        rankChange: lastWeekRanking ? (lastWeekRanking.googleRank - currentRanking.googleRank) : 0,
        currentScore: currentRanking.overallScore,
        scoreChange: lastWeekRanking ? (currentRanking.overallScore - lastWeekRanking.overallScore) : 0,
        currentRating: currentRanking.rating,
        ratingChange: lastWeekRanking ? (currentRanking.rating - lastWeekRanking.rating) : 0,
        totalReviews: currentRanking.totalRatings,
        newReviews: lastWeekRanking ? (currentRanking.totalRatings - lastWeekRanking.totalRatings) : 0
      };

      // Get competitor data
      const latestCompetitorSnapshot = await CompetitorSnapshot.findOne({
        placeId
      }).sort({ recordDate: -1 }).lean();

      const competitors = latestCompetitorSnapshot ? {
        totalTracked: latestCompetitorSnapshot.competitorStats.totalCompetitors,
        yourPosition: latestCompetitorSnapshot.yourPosition.rank,
        averageCompetitorRating: latestCompetitorSnapshot.competitorStats.averageRating,
        topCompetitor: latestCompetitorSnapshot.competitors[0] ? {
          name: latestCompetitorSnapshot.competitors[0].name,
          rating: latestCompetitorSnapshot.competitors[0].rating,
          rank: 1
        } : null
      } : null;

      // Generate insights
      const insights = [];

      if (performance.rankChange > 0) {
        insights.push({
          type: 'positive',
          title: `Rank Improved by ${performance.rankChange} Position${performance.rankChange > 1 ? 's' : ''}`,
          description: `You moved from #${performance.currentRank + performance.rankChange} to #${performance.currentRank} this week!`,
          priority: 'high'
        });
      } else if (performance.rankChange < 0) {
        insights.push({
          type: 'warning',
          title: `Rank Dropped by ${Math.abs(performance.rankChange)} Position${Math.abs(performance.rankChange) > 1 ? 's' : ''}`,
          description: `Your ranking decreased from #${performance.currentRank - performance.rankChange} to #${performance.currentRank}. Take action to recover.`,
          priority: 'high'
        });
      }

      if (performance.newReviews > 5) {
        insights.push({
          type: 'positive',
          title: `${performance.newReviews} New Reviews This Week`,
          description: 'Great momentum! More reviews improve your search visibility.',
          priority: 'medium'
        });
      } else if (performance.newReviews === 0) {
        insights.push({
          type: 'action',
          title: 'No New Reviews This Week',
          description: 'Ask satisfied customers for reviews to maintain visibility.',
          priority: 'high'
        });
      }

      // Create report
      const report = new WeeklyReport({
        placeId,
        restaurantName: currentRanking.restaurantName,
        weekNumber: weekInfo.weekNumber,
        year: weekInfo.year,
        startDate: weekInfo.startDate,
        endDate: weekInfo.endDate,
        performance,
        traffic: {
          estimatedVisitors: currentRanking.estimatedMonthlyVisitors,
          trafficTrend: performance.rankChange > 0 ? 'up' : (performance.rankChange < 0 ? 'down' : 'stable')
        },
        competitors,
        revenueImpact: currentRanking.revenueImpact,
        insights,
        charts: {
          rankingTrend: thisWeekRankings.map(r => ({
            date: r.recordDate,
            rank: r.googleRank,
            score: r.overallScore
          }))
        }
      });

      await report.save();

      winston.info(`Weekly report generated for week ${weekInfo.weekNumber}`);

      return report;
    } catch (error) {
      winston.error(`Failed to generate weekly report: ${error.message}`);
      return null;
    }
  }

  /**
   * Get latest weekly report
   */
  async getLatestWeeklyReport(placeId) {
    try {
      if (!mongoose.connection.readyState) {
        winston.warn('MongoDB not connected - cannot retrieve weekly report');
        return null;
      }

      const report = await WeeklyReport.findOne({ placeId })
        .sort({ year: -1, weekNumber: -1 })
        .lean();

      return report;
    } catch (error) {
      winston.error(`Failed to get latest weekly report: ${error.message}`);
      return null;
    }
  }

  /**
   * Get weekly report history
   */
  async getWeeklyReportHistory(placeId, limit = 12) {
    try {
      if (!mongoose.connection.readyState) {
        winston.warn('MongoDB not connected - cannot retrieve report history');
        return null;
      }

      const reports = await WeeklyReport.find({ placeId })
        .sort({ year: -1, weekNumber: -1 })
        .limit(limit)
        .lean();

      return reports;
    } catch (error) {
      winston.error(`Failed to get weekly report history: ${error.message}`);
      return null;
    }
  }

  /**
   * Find new competitors (compared to last snapshot)
   */
  async findNewCompetitors(placeId) {
    try {
      if (!mongoose.connection.readyState) {
        return [];
      }

      return await CompetitorSnapshot.findNewCompetitors(placeId);
    } catch (error) {
      winston.error(`Failed to find new competitors: ${error.message}`);
      return [];
    }
  }

  /**
   * Find departed competitors (compared to last snapshot)
   */
  async findDepartedCompetitors(placeId) {
    try {
      if (!mongoose.connection.readyState) {
        return [];
      }

      return await CompetitorSnapshot.findDepartedCompetitors(placeId);
    } catch (error) {
      winston.error(`Failed to find departed competitors: ${error.message}`);
      return [];
    }
  }
}

module.exports = MongoService;
