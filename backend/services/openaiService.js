const fetch = require('node-fetch');
const winston = require('winston');

/**
 * OpenAI Integration Service
 * Generates professional review responses using GPT-4
 */
class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
    this.model = 'gpt-4o-mini'; // Cost-effective, fast model
  }

  /**
   * Generate professional response to a customer review
   * Returns ready-to-paste response text
   */
  async generateReviewResponse(review, restaurantContext = {}) {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'OpenAI API key not configured',
          message: 'Add OPENAI_API_KEY to your .env file to enable AI-powered review responses'
        };
      }

      const { restaurantName, ownerName, businessType = 'restaurant' } = restaurantContext;

      // Build context-aware prompt
      const prompt = this.buildReviewResponsePrompt(review, restaurantContext);

      winston.info(`Generating AI review response for ${restaurantName}`);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional restaurant owner responding to customer reviews. Write genuine, personalized responses that show you care about customer feedback. Be warm, professional, and specific to the review content. Keep responses concise (2-4 sentences).'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const generatedResponse = data.choices[0].message.content.trim();

      winston.info('AI review response generated successfully');

      return {
        success: true,
        response: generatedResponse,
        review: {
          author: review.author || review.authorAttribution?.displayName,
          rating: review.rating,
          text: review.text || review.originalText?.text,
          sentiment: this.detectSentiment(review.rating)
        },
        usage: {
          tokensUsed: data.usage.total_tokens,
          estimatedCost: this.calculateCost(data.usage.total_tokens)
        }
      };

    } catch (error) {
      winston.error(`Review response generation failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        fallbackResponse: this.generateFallbackResponse(review, restaurantContext)
      };
    }
  }

  /**
   * Generate responses for multiple reviews in batch
   */
  async generateBatchResponses(reviews, restaurantContext = {}) {
    const responses = [];

    for (const review of reviews) {
      // Only generate for reviews without owner responses
      if (!review.ownerResponse) {
        const result = await this.generateReviewResponse(review, restaurantContext);
        responses.push({
          reviewId: review.reviewId || review.name,
          ...result
        });

        // Rate limiting: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return responses;
  }

  /**
   * Build context-aware prompt for review response
   */
  buildReviewResponsePrompt(review, context) {
    const rating = review.rating || 0;
    const reviewText = review.text || review.originalText?.text || '';
    const author = review.author || review.authorAttribution?.displayName || 'Customer';
    const restaurantName = context.restaurantName || 'our restaurant';

    let prompt = `Restaurant: ${restaurantName}\n`;
    prompt += `Customer: ${author}\n`;
    prompt += `Rating: ${rating}/5 stars\n`;
    prompt += `Review: "${reviewText}"\n\n`;

    if (rating >= 4) {
      prompt += 'This is a positive review. Write a warm, grateful response that:\n';
      prompt += '- Thanks the customer genuinely\n';
      prompt += '- Mentions specific things they appreciated (if any)\n';
      prompt += '- Invites them back\n';
    } else if (rating >= 3) {
      prompt += 'This is a neutral review. Write a constructive response that:\n';
      prompt += '- Acknowledges their feedback\n';
      prompt += '- Shows commitment to improvement\n';
      prompt += '- Offers to discuss further\n';
    } else {
      prompt += 'This is a negative review. Write a professional, empathetic response that:\n';
      prompt += '- Apologizes for their experience\n';
      prompt += '- Addresses specific concerns mentioned\n';
      prompt += '- Offers to make it right (e.g., manager contact)\n';
    }

    prompt += '\nGenerate ONLY the response text, ready to copy and paste. No quotes or formatting.';

    return prompt;
  }

  /**
   * Detect sentiment from rating
   */
  detectSentiment(rating) {
    if (rating >= 4) return 'positive';
    if (rating >= 3) return 'neutral';
    return 'negative';
  }

  /**
   * Calculate estimated cost for API usage
   */
  calculateCost(tokens) {
    // GPT-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens
    // Approximate: ~$0.0004 per response
    const costPer1000Tokens = 0.0004;
    return ((tokens / 1000) * costPer1000Tokens).toFixed(4);
  }

  /**
   * Generate fallback response if API fails
   */
  generateFallbackResponse(review, context) {
    const rating = review.rating || 0;
    const restaurantName = context.restaurantName || 'our restaurant';

    if (rating >= 4) {
      return `Thank you so much for your wonderful review! We're thrilled you enjoyed your experience at ${restaurantName}. We look forward to serving you again soon!`;
    } else if (rating >= 3) {
      return `Thank you for your feedback! We appreciate you taking the time to share your thoughts. We're always working to improve and would love to discuss your experience further. Please feel free to contact us directly.`;
    } else {
      return `We sincerely apologize for not meeting your expectations. Your feedback is important to us, and we'd like to make this right. Please contact our manager directly so we can address your concerns.`;
    }
  }
}

module.exports = OpenAIService;
