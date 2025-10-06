const winston = require('winston');

/**
 * Priority Task Queue by Revenue Impact
 * Creates actionable task list sorted by estimated revenue impact
 */
class TaskQueue {
  /**
   * Generate prioritized task queue from SEO issues
   */
  generateTaskQueue(seoIssues, sentimentAnalysis, auditData) {
    const tasks = [];

    // 1. Convert SEO issues to tasks
    seoIssues.forEach((issue, index) => {
      tasks.push({
        id: `seo-${index + 1}`,
        title: issue.issue,
        category: issue.category,
        description: issue.description,
        priority: this.calculateTaskPriority(issue),
        revenueImpact: issue.revenueImpact,
        timeToComplete: issue.timeToFix,
        difficulty: issue.difficulty,
        steps: issue.howToFix,
        status: 'pending',
        type: 'seo',
        urgency: issue.severity
      });
    });

    // 2. Add review response tasks if needed
    if (auditData.restaurant?.reviews) {
      const unrespondedReviews = auditData.restaurant.reviews.filter(r => !r.ownerResponse);

      if (unrespondedReviews.length > 0) {
        tasks.push({
          id: 'reviews-1',
          title: `Respond to ${unrespondedReviews.length} Unanswered Reviews`,
          category: 'Review Management',
          description: `You have ${unrespondedReviews.length} reviews without responses. Responding shows you care and can improve ratings.`,
          priority: 'high',
          revenueImpact: {
            monthly: unrespondedReviews.length * 50,
            annual: unrespondedReviews.length * 600,
            reason: 'Review responses improve reputation and encourage more reviews'
          },
          timeToComplete: `${unrespondedReviews.length * 5} minutes`,
          difficulty: 'Easy',
          steps: [
            '1. Use AI-powered response generator for each review',
            '2. Personalize the generated response',
            '3. Copy and paste to Google Business Profile',
            '4. Aim to respond within 24 hours'
          ],
          status: 'pending',
          type: 'reviews',
          urgency: 'high',
          reviewCount: unrespondedReviews.length
        });
      }
    }

    // 3. Add sentiment-based tasks
    if (sentimentAnalysis.topComplaints && sentimentAnalysis.topComplaints.length > 0) {
      const topComplaint = sentimentAnalysis.topComplaints[0];

      tasks.push({
        id: 'sentiment-1',
        title: `Address #1 Complaint: ${topComplaint.complaint}`,
        category: 'Customer Experience',
        description: `${topComplaint.count} customers (${topComplaint.percentage}%) mentioned "${topComplaint.complaint}" in negative reviews.`,
        priority: 'critical',
        revenueImpact: {
          monthly: 1000,
          annual: 12000,
          reason: 'Fixing top complaint can prevent future negative reviews'
        },
        timeToComplete: 'Varies',
        difficulty: 'Medium',
        steps: [
          `1. Read all reviews mentioning "${topComplaint.complaint}"`,
          '2. Identify root cause of the issue',
          '3. Create action plan to fix',
          '4. Train staff if needed',
          '5. Monitor improvement in future reviews'
        ],
        status: 'pending',
        type: 'improvement',
        urgency: 'high'
      });
    }

    // 4. Add review generation task if needed
    const totalReviews = auditData.restaurant?.totalRatings || 0;
    if (totalReviews < 50) {
      tasks.push({
        id: 'reviews-2',
        title: 'Get More Customer Reviews',
        category: 'Review Management',
        description: `You need ${50 - totalReviews} more reviews to reach 50+ (optimal for rankings).`,
        priority: 'high',
        revenueImpact: {
          monthly: 1200,
          annual: 14400,
          reason: 'More reviews = higher rankings = more customers'
        },
        timeToComplete: '2-3 months (ongoing)',
        difficulty: 'Medium',
        steps: [
          '1. Ask happy customers for reviews (in-person)',
          '2. Put QR codes on receipts linking to review page',
          '3. Send review requests via email/SMS (with permission)',
          '4. Offer incentives for reviews (legal in most areas)',
          '5. Make it easy: "Search [Restaurant Name] on Google and leave a review"',
          '6. Goal: 5-10 new reviews per month'
        ],
        status: 'pending',
        type: 'reviews',
        urgency: 'high'
      });
    }

    // 5. Add photo upload task if needed
    const photoCount = auditData.restaurant?.photos?.length || 0;
    if (photoCount < 20) {
      tasks.push({
        id: 'photos-1',
        title: `Upload ${20 - photoCount} More Photos`,
        category: 'Visual Content',
        description: 'Businesses with 100+ photos get 520% more calls. You need more visual content.',
        priority: 'medium',
        revenueImpact: {
          monthly: 400,
          annual: 4800,
          reason: 'More photos = higher engagement = more customers'
        },
        timeToComplete: '3-4 hours (photo shoot + upload)',
        difficulty: 'Easy',
        steps: [
          '1. Schedule a professional photo shoot (or use smartphone)',
          '2. Take photos of:',
          '   - Your 10 best-selling dishes',
          '   - Interior (dining area, bar, decor)',
          '   - Exterior (storefront, signage)',
          '   - Staff (optional)',
          '3. Edit photos for best quality',
          '4. Upload to Google Business Profile',
          '5. Add descriptions to each photo'
        ],
        status: 'pending',
        type: 'content',
        urgency: 'medium'
      });
    }

    // Sort tasks by revenue impact and priority
    tasks.sort((a, b) => {
      // First by priority
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) return priorityDiff;

      // Then by monthly revenue impact
      const impactA = a.revenueImpact?.monthly || 0;
      const impactB = b.revenueImpact?.monthly || 0;

      return impactB - impactA;
    });

    // Add queue position
    tasks.forEach((task, index) => {
      task.queuePosition = index + 1;
    });

    winston.info(`Generated task queue with ${tasks.length} prioritized tasks`);

    return {
      tasks,
      totalTasks: tasks.length,
      totalMonthlyImpact: tasks.reduce((sum, t) => sum + (t.revenueImpact?.monthly || 0), 0),
      totalAnnualImpact: tasks.reduce((sum, t) => sum + (t.revenueImpact?.annual || 0), 0),
      criticalTasks: tasks.filter(t => t.priority === 'critical').length,
      highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
      quickWins: tasks.filter(t => t.difficulty === 'Easy' && t.priority === 'high'),
      summary: this.generateSummary(tasks)
    };
  }

  /**
   * Calculate task priority based on impact and urgency
   */
  calculateTaskPriority(issue) {
    const impact = issue.impact || 'low';
    const severity = issue.severity || 'low';

    if (severity === 'critical' || impact === 'critical') return 'critical';
    if (severity === 'high' || impact === 'high') return 'high';
    if (severity === 'medium' || impact === 'medium') return 'medium';
    return 'low';
  }

  /**
   * Generate executive summary of task queue
   */
  generateSummary(tasks) {
    const quickWins = tasks.filter(t => t.difficulty === 'Easy' && t.priority === 'high');
    const criticalTasks = tasks.filter(t => t.priority === 'critical');

    let summary = '';

    if (criticalTasks.length > 0) {
      summary += `🚨 You have ${criticalTasks.length} critical tasks that need immediate attention. `;
    }

    if (quickWins.length > 0) {
      const quickWinImpact = quickWins.reduce((sum, t) => sum + (t.revenueImpact?.monthly || 0), 0);
      summary += `⚡ ${quickWins.length} quick wins could generate $${quickWinImpact}/month. `;
    }

    const totalImpact = tasks.reduce((sum, t) => sum + (t.revenueImpact?.monthly || 0), 0);
    summary += `📈 Completing all tasks could add $${totalImpact}/month ($${totalImpact * 12}/year) in revenue.`;

    return summary;
  }

  /**
   * Get next recommended task
   */
  getNextTask(taskQueue) {
    const pending = taskQueue.tasks.filter(t => t.status === 'pending');

    if (pending.length === 0) {
      return null;
    }

    return pending[0]; // Already sorted by priority
  }

  /**
   * Mark task as completed
   */
  completeTask(taskQueue, taskId) {
    const task = taskQueue.tasks.find(t => t.id === taskId);

    if (task) {
      task.status = 'completed';
      task.completedAt = new Date();
    }

    return taskQueue;
  }
}

module.exports = TaskQueue;
