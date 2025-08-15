const express = require('express');
const SymptomQuery = require('../models/SymptomQuery');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get user dashboard statistics
 * @access  Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get symptom analysis count
    const totalSymptomQueries = await SymptomQuery.countDocuments({ userId });
    
    // Get recent symptom queries (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSymptomQueries = await SymptomQuery.countDocuments({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get payment statistics
    const totalPayments = await Payment.countDocuments({ userId });
    const successfulPayments = await Payment.countDocuments({ 
      userId, 
      status: 'paid' 
    });

    // Calculate total amount spent
    const paymentStats = await Payment.aggregate([
      { $match: { userId, status: 'paid' } },
      { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
    ]);
    const totalSpent = paymentStats.length > 0 ? paymentStats[0].totalSpent : 0;

    // Get most common conditions
    const commonConditions = await SymptomQuery.aggregate([
      { $match: { userId } },
      { $group: { _id: '$prediction.disease', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get recent activity
    const recentActivity = await SymptomQuery.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('symptoms prediction.disease prediction.severity createdAt');

    res.json({
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalSymptomQueries,
          recentSymptomQueries,
          totalConsultations: successfulPayments,
          totalSpent
        },
        commonConditions: commonConditions.map(item => ({
          condition: item._id,
          count: item.count
        })),
        recentActivity
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      message: 'Server error retrieving dashboard statistics'
    });
  }
});

/**
 * @route   GET /api/dashboard/health-summary
 * @desc    Get user's health summary and trends
 * @access  Private
 */
router.get('/health-summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get symptom trends over last 6 months
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    
    const monthlyTrends = await SymptomQuery.aggregate([
      { 
        $match: { 
          userId, 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          severityBreakdown: {
            $push: '$prediction.severity'
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get severity distribution
    const severityStats = await SymptomQuery.aggregate([
      { $match: { userId } },
      { $group: { _id: '$prediction.severity', count: { $sum: 1 } } }
    ]);

    // Get consultation recommendations
    const consultationRecommended = await SymptomQuery.countDocuments({
      userId,
      consultationRecommended: true
    });

    // Health score calculation (simple algorithm)
    const totalQueries = await SymptomQuery.countDocuments({ userId });
    const highSeverityQueries = await SymptomQuery.countDocuments({
      userId,
      'prediction.severity': { $in: ['high', 'critical'] }
    });
    
    const healthScore = totalQueries > 0 
      ? Math.max(20, 100 - (highSeverityQueries / totalQueries) * 80)
      : 85; // Default score for new users

    res.json({
      message: 'Health summary retrieved successfully',
      data: {
        healthScore: Math.round(healthScore),
        monthlyTrends,
        severityDistribution: severityStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        consultationRecommended,
        recommendations: generateHealthRecommendations(healthScore, severityStats)
      }
    });

  } catch (error) {
    console.error('Health summary error:', error);
    res.status(500).json({
      message: 'Server error retrieving health summary'
    });
  }
});

/**
 * Helper function to generate health recommendations
 */
function generateHealthRecommendations(healthScore, severityStats) {
  const recommendations = [];

  if (healthScore < 50) {
    recommendations.push({
      type: 'urgent',
      message: 'Consider scheduling a comprehensive health checkup with a healthcare professional.',
      icon: 'AlertTriangle'
    });
  }

  if (healthScore < 70) {
    recommendations.push({
      type: 'warning',
      message: 'Monitor your symptoms closely and maintain a healthy lifestyle.',
      icon: 'AlertCircle'
    });
  }

  const highSeverityCount = severityStats.find(s => s._id === 'high')?.count || 0;
  if (highSeverityCount > 3) {
    recommendations.push({
      type: 'info',
      message: 'You\'ve had several high-severity symptoms. Consider consulting a specialist.',
      icon: 'Info'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: 'Great job maintaining your health! Keep up the good work.',
      icon: 'CheckCircle'
    });
  }

  return recommendations;
}

module.exports = router;