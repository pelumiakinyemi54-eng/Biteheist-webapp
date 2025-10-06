const winston = require('winston');

/**
 * SEO Issue Detection & Fix Recommendations
 * Analyzes restaurant SEO and provides actionable fixes ranked by impact
 */
class SEOIssueDetector {
  /**
   * Detect all SEO issues and provide fix recommendations
   */
  detectIssues(auditData) {
    const issues = [];

    // 1. Google Business Profile Issues
    issues.push(...this.detectGBPIssues(auditData.restaurant));

    // 2. Review Management Issues
    issues.push(...this.detectReviewIssues(auditData.restaurant, auditData.scores));

    // 3. Website Performance Issues
    issues.push(...this.detectPerformanceIssues(auditData.scores?.pageSpeed));

    // 4. Competitive Positioning Issues
    issues.push(...this.detectCompetitiveIssues(auditData.ranking, auditData.competitors));

    // 5. Content & Information Issues
    issues.push(...this.detectContentIssues(auditData.restaurant));

    // Sort by revenue impact (high to low)
    issues.sort((a, b) => {
      const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });

    winston.info(`Detected ${issues.length} SEO issues`);

    return issues;
  }

  /**
   * Detect Google Business Profile issues
   */
  detectGBPIssues(restaurant) {
    const issues = [];

    // Missing phone number
    if (!restaurant.phone || restaurant.phone.trim() === '') {
      issues.push({
        category: 'Google Business Profile',
        severity: 'critical',
        impact: 'high',
        issue: 'Missing Phone Number',
        description: 'Your Google Business Profile doesn\'t have a phone number listed.',
        revenueImpact: {
          monthly: 800,
          annual: 9600,
          reason: 'Customers can\'t call you directly from search results'
        },
        howToFix: [
          '1. Go to google.com/business',
          '2. Select your business',
          '3. Click "Info" tab',
          '4. Add your phone number',
          '5. Verify and save'
        ],
        timeToFix: '5 minutes',
        difficulty: 'Easy',
        priority: 1
      });
    }

    // Missing website
    if (!restaurant.website || restaurant.website.trim() === '') {
      issues.push({
        category: 'Google Business Profile',
        severity: 'critical',
        impact: 'high',
        issue: 'Missing Website URL',
        description: 'No website listed on your Google Business Profile.',
        revenueImpact: {
          monthly: 1200,
          annual: 14400,
          reason: 'Customers can\'t view your menu, make reservations, or learn more'
        },
        howToFix: [
          '1. Add your website to Google Business Profile',
          '2. If you don\'t have a website, create a free Google Site',
          '3. Include menu, hours, location, and contact info'
        ],
        timeToFix: '10 minutes (if you have a website)',
        difficulty: 'Easy',
        priority: 1
      });
    }

    // Low photo count
    const photoCount = restaurant.photos?.length || 0;
    if (photoCount < 10) {
      issues.push({
        category: 'Google Business Profile',
        severity: 'high',
        impact: 'medium',
        issue: `Only ${photoCount} Photos`,
        description: 'Businesses with 100+ photos get 520% more calls and 2.7x more direction requests.',
        revenueImpact: {
          monthly: 600,
          annual: 7200,
          reason: 'Photos increase customer engagement and trust'
        },
        howToFix: [
          '1. Take high-quality photos of:',
          '   - Your best dishes (10+ photos)',
          '   - Interior ambiance (5+ photos)',
          '   - Exterior & signage (3+ photos)',
          '   - Staff & kitchen (optional)',
          '2. Upload to Google Business Profile',
          '3. Add descriptions to each photo',
          '4. Update photos monthly'
        ],
        timeToFix: '2 hours (photo shoot + upload)',
        difficulty: 'Medium',
        priority: 2
      });
    }

    // Missing business hours
    if (!restaurant.hours || !restaurant.hours.weekdayText) {
      issues.push({
        category: 'Google Business Profile',
        severity: 'high',
        impact: 'medium',
        issue: 'Missing Business Hours',
        description: 'Customers don\'t know when you\'re open.',
        revenueImpact: {
          monthly: 400,
          annual: 4800,
          reason: 'Customers visit competitors with clear hours'
        },
        howToFix: [
          '1. Go to Google Business Profile',
          '2. Click "Info" tab',
          '3. Add hours for each day',
          '4. Mark special hours (holidays, events)'
        ],
        timeToFix: '10 minutes',
        difficulty: 'Easy',
        priority: 2
      });
    }

    return issues;
  }

  /**
   * Detect review management issues
   */
  detectReviewIssues(restaurant, scores) {
    const issues = [];
    const totalReviews = restaurant.totalRatings || 0;
    const rating = restaurant.rating || 0;
    const responseRate = scores?.reviewResponse?.responseRate || 0;
    const avgResponseTime = scores?.reviewResponse?.avgResponseTime || 999;

    // Low review count
    if (totalReviews < 50) {
      issues.push({
        category: 'Review Management',
        severity: 'critical',
        impact: 'high',
        issue: `Only ${totalReviews} Reviews`,
        description: 'Restaurants with 50+ reviews rank significantly higher in search.',
        revenueImpact: {
          monthly: 1500,
          annual: 18000,
          reason: 'More reviews = higher rankings = more customers'
        },
        howToFix: [
          '1. Ask happy customers for reviews (in-person)',
          '2. Send review links via email/SMS after visits',
          '3. Put QR codes on receipts/tables',
          '4. Respond to all reviews to encourage more',
          '5. Goal: Get 5-10 new reviews per month'
        ],
        timeToFix: 'Ongoing',
        difficulty: 'Medium',
        priority: 1
      });
    }

    // Low rating
    if (rating < 4.0 && totalReviews > 10) {
      issues.push({
        category: 'Review Management',
        severity: 'critical',
        impact: 'critical',
        issue: `Low Rating (${rating.toFixed(1)}/5.0)`,
        description: 'Ratings below 4.0 severely hurt your rankings and customer trust.',
        revenueImpact: {
          monthly: 2500,
          annual: 30000,
          reason: 'Customers skip restaurants with ratings below 4.0'
        },
        howToFix: [
          '1. **Immediate Action:**',
          '   - Respond professionally to negative reviews',
          '   - Acknowledge issues and explain improvements',
          '2. **Long-term Fix:**',
          '   - Identify common complaints from reviews',
          '   - Fix underlying service/quality issues',
          '   - Train staff on customer service',
          '   - Focus on getting new positive reviews',
          '3. **Recovery Plan:**',
          '   - Aim for 20 new 5-star reviews to raise average',
          '   - Improve food quality & service consistency'
        ],
        timeToFix: '3-6 months',
        difficulty: 'Hard',
        priority: 1
      });
    }

    // Poor review response rate
    if (responseRate < 50 && totalReviews > 5) {
      issues.push({
        category: 'Review Management',
        severity: 'high',
        impact: 'medium',
        issue: `Low Response Rate (${Math.round(responseRate)}%)`,
        description: 'Responding to reviews shows you care and can improve ratings by 0.12 stars.',
        revenueImpact: {
          monthly: 500,
          annual: 6000,
          reason: 'Customers prefer businesses that engage with feedback'
        },
        howToFix: [
          '1. Respond to ALL reviews within 24-48 hours',
          '2. For positive reviews:',
          '   - Thank customers genuinely',
          '   - Mention specific feedback they gave',
          '   - Invite them back',
          '3. For negative reviews:',
          '   - Apologize and acknowledge the issue',
          '   - Explain what you\'re doing to fix it',
          '   - Offer to discuss offline',
          '4. Use AI tools to draft responses faster'
        ],
        timeToFix: '30 min/week',
        difficulty: 'Easy',
        priority: 2
      });
    }

    // Slow review response time
    if (responseRate > 0 && avgResponseTime > 72) {
      issues.push({
        category: 'Review Management',
        severity: 'medium',
        impact: 'low',
        issue: `Slow Response Time (${Math.round(avgResponseTime)}h avg)`,
        description: 'Faster responses (within 24h) show better customer service.',
        revenueImpact: {
          monthly: 200,
          annual: 2400,
          reason: 'Quick responses improve reputation'
        },
        howToFix: [
          '1. Set up Google Business notifications',
          '2. Check for new reviews daily',
          '3. Respond within 24 hours',
          '4. Use templates for faster responses'
        ],
        timeToFix: 'Ongoing',
        difficulty: 'Easy',
        priority: 3
      });
    }

    return issues;
  }

  /**
   * Detect website performance issues
   */
  detectPerformanceIssues(pageSpeedData) {
    const issues = [];

    if (!pageSpeedData) return issues;

    const score = pageSpeedData.score || 0;
    const loadTime = pageSpeedData.loadTime || 0;

    // Poor page speed score
    if (score < 50) {
      issues.push({
        category: 'Website Performance',
        severity: 'high',
        impact: 'high',
        issue: `Poor PageSpeed Score (${score}/100)`,
        description: '40% of users abandon sites that take >3 seconds to load.',
        revenueImpact: {
          monthly: 800,
          annual: 9600,
          reason: 'Slow websites lose customers and rank lower on Google'
        },
        howToFix: [
          '1. Optimize images (compress, use WebP format)',
          '2. Enable browser caching',
          '3. Minify CSS/JavaScript files',
          '4. Use a CDN for faster delivery',
          '5. Remove unused plugins/scripts',
          '6. Consider upgrading hosting plan'
        ],
        timeToFix: '2-4 hours',
        difficulty: 'Medium',
        priority: 2
      });
    } else if (score < 80) {
      issues.push({
        category: 'Website Performance',
        severity: 'medium',
        impact: 'medium',
        issue: `Moderate PageSpeed Score (${score}/100)`,
        description: 'Your website could be faster to improve user experience.',
        revenueImpact: {
          monthly: 300,
          annual: 3600,
          reason: 'Faster sites convert better'
        },
        howToFix: [
          '1. Compress images',
          '2. Enable caching',
          '3. Remove unused code'
        ],
        timeToFix: '1-2 hours',
        difficulty: 'Easy',
        priority: 3
      });
    }

    // Slow load time
    if (loadTime > 5) {
      issues.push({
        category: 'Website Performance',
        severity: 'high',
        impact: 'high',
        issue: `Slow Load Time (${loadTime.toFixed(1)}s)`,
        description: 'Pages should load in under 3 seconds for optimal experience.',
        revenueImpact: {
          monthly: 600,
          annual: 7200,
          reason: 'Every 1 second delay = 7% fewer conversions'
        },
        howToFix: [
          '1. Optimize images (largest performance hit)',
          '2. Use lazy loading for images',
          '3. Reduce server response time',
          '4. Remove render-blocking resources'
        ],
        timeToFix: '2-3 hours',
        difficulty: 'Medium',
        priority: 2
      });
    }

    return issues;
  }

  /**
   * Detect competitive positioning issues
   */
  detectCompetitiveIssues(ranking, competitors) {
    const issues = [];

    if (!ranking) return issues;

    const googleRank = ranking.googleRank || 999;
    const totalCompetitors = ranking.totalCompetitors || 0;

    // Poor ranking position
    if (googleRank > 5 && totalCompetitors > 5) {
      issues.push({
        category: 'Competitive Position',
        severity: 'high',
        impact: 'critical',
        issue: `Ranked #${googleRank} of ${totalCompetitors + 1}`,
        description: '75% of clicks go to the top 3 results. You\'re losing customers.',
        revenueImpact: {
          monthly: 3000,
          annual: 36000,
          reason: 'Higher rankings = exponentially more customers'
        },
        howToFix: [
          '1. **Quick Wins:**',
          '   - Get 10+ new positive reviews',
          '   - Add 20+ high-quality photos',
          '   - Complete all Google Business Profile info',
          '2. **Medium-term:**',
          '   - Improve response rate to 100%',
          '   - Optimize website speed',
          '   - Build local citations (Yelp, TripAdvisor)',
          '3. **Long-term:**',
          '   - Maintain 4.5+ star rating',
          '   - Get consistent new reviews monthly',
          '   - Create content about your cuisine'
        ],
        timeToFix: '2-6 months',
        difficulty: 'Hard',
        priority: 1
      });
    } else if (googleRank > 3 && totalCompetitors > 3) {
      issues.push({
        category: 'Competitive Position',
        severity: 'medium',
        impact: 'high',
        issue: `Ranked #${googleRank} of ${totalCompetitors + 1}`,
        description: 'Breaking into top 3 will significantly increase visibility.',
        revenueImpact: {
          monthly: 1500,
          annual: 18000,
          reason: 'Top 3 positions get 3x more clicks'
        },
        howToFix: [
          '1. Analyze top 3 competitors',
          '2. Match their review count & rating',
          '3. Add more photos than competitors',
          '4. Improve response rate to 100%'
        ],
        timeToFix: '1-3 months',
        difficulty: 'Medium',
        priority: 1
      });
    }

    return issues;
  }

  /**
   * Detect content and information issues
   */
  detectContentIssues(restaurant) {
    const issues = [];

    // Missing address
    if (!restaurant.address || restaurant.address.trim() === '') {
      issues.push({
        category: 'Business Information',
        severity: 'critical',
        impact: 'critical',
        issue: 'Missing Address',
        description: 'Customers can\'t find your location.',
        revenueImpact: {
          monthly: 2000,
          annual: 24000,
          reason: 'No address = invisible in local search'
        },
        howToFix: [
          '1. Add complete address to Google Business Profile',
          '2. Ensure address matches exactly across all platforms',
          '3. Verify location with Google'
        ],
        timeToFix: '15 minutes',
        difficulty: 'Easy',
        priority: 1
      });
    }

    // Incomplete business types
    const foodTypes = restaurant.types?.filter(t => t.includes('restaurant') || t.includes('food')) || [];
    if (foodTypes.length < 2) {
      issues.push({
        category: 'Business Information',
        severity: 'medium',
        impact: 'medium',
        issue: 'Limited Category Tags',
        description: 'More specific categories help you appear in relevant searches.',
        revenueImpact: {
          monthly: 400,
          annual: 4800,
          reason: 'Better categorization = more search visibility'
        },
        howToFix: [
          '1. Go to Google Business Profile',
          '2. Add secondary categories (e.g., "Italian Restaurant", "Pizza Place")',
          '3. Be specific to your cuisine and service type',
          '4. Maximum 10 categories allowed'
        ],
        timeToFix: '10 minutes',
        difficulty: 'Easy',
        priority: 3
      });
    }

    return issues;
  }

  /**
   * Calculate total revenue impact of all issues
   */
  calculateTotalImpact(issues) {
    const monthly = issues.reduce((sum, issue) => sum + (issue.revenueImpact?.monthly || 0), 0);
    const annual = issues.reduce((sum, issue) => sum + (issue.revenueImpact?.annual || 0), 0);

    return {
      monthly,
      annual,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highIssues: issues.filter(i => i.severity === 'high').length,
      mediumIssues: issues.filter(i => i.severity === 'medium').length,
      lowIssues: issues.filter(i => i.severity === 'low').length
    };
  }
}

module.exports = SEOIssueDetector;
