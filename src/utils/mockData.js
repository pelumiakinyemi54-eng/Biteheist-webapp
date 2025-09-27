// Mock data generator for BiteHeist dashboard
export function generateMockAuditData(place) {
  const score = Math.floor(Math.random() * 40 + 50) // 50-90
  const grade = score >= 85 ? 'A' : score >= 75 ? 'B' : score >= 65 ? 'C' : 'D'
  
  return {
    restaurant: {
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || (Math.random() * 1.5 + 3.5),
      total_ratings: place.user_ratings_total || Math.floor(Math.random() * 200 + 50),
      website: generateMockWebsite(place.name),
      phone: generateMockPhone()
    },
    overallScore: score,
    grade: grade,
    metrics: {
      seoScore: { 
        value: Math.floor(Math.random() * 30 + 60), 
        label: 'SEO Score',
        displayValue: null
      },
      performance: { 
        value: Math.floor(Math.random() * 30 + 50), 
        label: 'Performance',
        displayValue: null
      },
      accessibility: { 
        value: Math.floor(Math.random() * 20 + 75), 
        label: 'Accessibility',
        displayValue: null
      },
      bestPractices: { 
        value: Math.floor(Math.random() * 25 + 70), 
        label: 'Best Practices',
        displayValue: null
      }
    },
    competitors: generateMockCompetitors(),
    seoIssues: generateMockSeoIssues(place),
    pagespeed: {
      performance: Math.floor(Math.random() * 30 + 45),
      seo: Math.floor(Math.random() * 20 + 75),
      lcp: (Math.random() * 3 + 2).toFixed(1),
      accessibility: Math.floor(Math.random() * 25 + 70),
      bestPractices: Math.floor(Math.random() * 20 + 70)
    },
    actionItems: generateMockActionItems(place)
  }
}

function generateMockWebsite(name) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)
  const domains = ['.com', '.net', '.restaurant']
  return `https://www.${cleanName}${domains[Math.floor(Math.random() * domains.length)]}`
}

function generateMockPhone() {
  const area = Math.floor(Math.random() * 800) + 200
  const exchange = Math.floor(Math.random() * 800) + 200
  const number = Math.floor(Math.random() * 9000) + 1000
  return `(${area}) ${exchange}-${number}`
}

function generateMockCompetitors() {
  const competitorNames = [
    'Pizza Palace', 'Burger Barn', 'Taco Time', 'Sandwich Shop', 'Deli Delicious',
    'Pasta Place', 'Grill House', 'Noodle Nation', 'Wrap World', 'Salad Station',
    'Coffee Corner', 'Bakery Bliss', 'Seafood Shack', 'Steakhouse Supreme', 'Veggie Village'
  ]
  
  const areas = [
    'Downtown', 'Midtown', 'Uptown', 'Westside', 'Eastside',
    'North End', 'South Beach', 'Old Town', 'New District', 'The Plaza'
  ]
  
  return Array.from({ length: 5 }, (_, i) => ({
    place_id: `competitor_${i + 1}`,
    name: competitorNames[Math.floor(Math.random() * competitorNames.length)],
    vicinity: `${areas[Math.floor(Math.random() * areas.length)]}, ${(0.1 + i * 0.3).toFixed(1)} mi away`,
    rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
    user_ratings_total: Math.floor(Math.random() * 400 + 25),
    price_level: Math.floor(Math.random() * 4) + 1,
    types: ['restaurant', 'food', 'establishment']
  }))
}

function generateMockSeoIssues(place) {
  const issues = [
    {
      type: 'title',
      title: 'Title Tag Length',
      description: 'Title tag exceeds 60 characters and may be truncated in search results',
      status: Math.random() > 0.3 ? 'fail' : 'pass',
      value: `${place.name} - Best Restaurant in Miami Beach Florida | Order Online Now`
    },
    {
      type: 'schema',
      title: 'Restaurant Schema Markup',
      description: 'Missing structured data for rich snippets in search results',
      status: Math.random() > 0.6 ? 'fail' : 'pass',
      value: null
    },
    {
      type: 'meta',
      title: 'Meta Description',
      description: 'Meta description optimized for search engines',
      status: Math.random() > 0.4 ? 'pass' : 'fail',
      value: `Visit ${place.name} for amazing food and great service. Order online or call for delivery.`
    },
    {
      type: 'og',
      title: 'Open Graph Tags',
      description: 'Social media preview tags for better sharing appearance',
      status: Math.random() > 0.5 ? 'fail' : 'pass',
      value: null
    },
    {
      type: 'reviews',
      title: 'Review Response Rate',
      description: 'Percentage of customer reviews that have been responded to',
      status: Math.random() > 0.4 ? 'fail' : 'pass',
      value: `${Math.floor(Math.random() * 15)} unanswered reviews`
    },
    {
      type: 'images',
      title: 'Image Optimization',
      description: 'Images optimized with proper alt tags and compression',
      status: Math.random() > 0.3 ? 'pass' : 'fail',
      value: null
    },
    {
      type: 'mobile',
      title: 'Mobile Optimization',
      description: 'Website is properly optimized for mobile devices',
      status: Math.random() > 0.2 ? 'pass' : 'fail',
      value: null
    },
    {
      type: 'ssl',
      title: 'SSL Certificate',
      description: 'Website uses secure HTTPS connection',
      status: Math.random() > 0.1 ? 'pass' : 'fail',
      value: null
    }
  ]
  
  return issues.slice(0, 6) // Return 6 random issues
}

function generateMockActionItems(place) {
  const actions = [
    {
      title: 'Optimize Title Tag Length',
      description: 'Shorten title to under 60 characters to prevent truncation in Google search results',
      priority: 'High',
      impact: '+15% click-through rate',
      effort: 'Low',
      timeframe: '1 day'
    },
    {
      title: 'Implement Restaurant Schema Markup',
      description: 'Add structured data to enable rich snippets with ratings, hours, and menu items',
      priority: 'High',
      impact: '+25% search visibility',
      effort: 'Medium',
      timeframe: '1 week'
    },
    {
      title: 'Respond to Customer Reviews',
      description: 'Reply to unanswered reviews to improve customer engagement and local SEO',
      priority: 'Medium',
      impact: '+0.3★ rating boost',
      effort: 'Medium',
      timeframe: '2 weeks'
    },
    {
      title: 'Add Open Graph Meta Tags',
      description: 'Improve social media sharing appearance with proper OG tags',
      priority: 'Medium',
      impact: 'Better social CTR',
      effort: 'Low',
      timeframe: '2 days'
    },
    {
      title: 'Optimize Core Web Vitals',
      description: 'Improve page loading speed to prevent traffic loss and boost rankings',
      priority: 'High',
      impact: 'Prevent 27% traffic loss',
      effort: 'High',
      timeframe: '2 weeks'
    },
    {
      title: 'Update Google Business Profile',
      description: 'Ensure all business information is accurate and complete',
      priority: 'Medium',
      impact: '+10% local visibility',
      effort: 'Low',
      timeframe: '1 day'
    },
    {
      title: 'Optimize Menu Images',
      description: 'Add descriptive alt tags and compress images for faster loading',
      priority: 'Low',
      impact: 'Better accessibility',
      effort: 'Medium',
      timeframe: '3 days'
    }
  ]
  
  return actions.slice(0, 5) // Return top 5 actions
}

// Export individual generators for testing
export {
  generateMockCompetitors,
  generateMockSeoIssues,
  generateMockActionItems
}