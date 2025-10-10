const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { isMongoConnected } = require('../config/database');
const winston = require('winston');

// In-memory storage for leads when MongoDB is not available
let inMemoryLeads = [];

// POST /api/leads/capture - Capture a new lead
router.post('/capture', async (req, res) => {
  try {
    const { phone, restaurantId, restaurantName, placeId, source } = req.body;

    // Validate phone number
    if (!phone || phone.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Get IP address and user agent
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const leadData = {
      phone: phone.trim(),
      restaurantSearched: restaurantName,
      placeId: placeId || restaurantId,
      source: source || 'audit-report',
      ipAddress,
      userAgent,
      timestamp: new Date()
    };

    if (isMongoConnected()) {
      // Save to MongoDB
      const lead = await Lead.create(leadData);
      winston.info(`Lead captured: ${phone} for ${restaurantName || placeId}`);

      res.json({
        success: true,
        leadId: lead._id,
        message: 'Lead captured successfully'
      });
    } else {
      // Save to in-memory storage
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      inMemoryLeads.push({ _id: leadId, ...leadData });

      // Keep only last 100 leads in memory
      if (inMemoryLeads.length > 100) {
        inMemoryLeads = inMemoryLeads.slice(-100);
      }

      winston.info(`Lead captured (in-memory): ${phone} for ${restaurantName || placeId}`);
      console.log('📞 Lead captured:', leadData);

      res.json({
        success: true,
        leadId: leadId,
        message: 'Lead captured successfully (stored in memory)'
      });
    }
  } catch (error) {
    winston.error('Error capturing lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to capture lead'
    });
  }
});

// GET /api/leads - Get all leads (admin only)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, skip = 0, placeId } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (placeId) {
        query.placeId = placeId;
      }

      const leads = await Lead.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await Lead.countDocuments(query);

      res.json({
        success: true,
        leads,
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit)
      });
    } else {
      // Return in-memory leads
      let filteredLeads = [...inMemoryLeads];
      if (placeId) {
        filteredLeads = filteredLeads.filter(lead => lead.placeId === placeId);
      }

      // Sort by timestamp descending
      filteredLeads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const total = filteredLeads.length;
      const paginatedLeads = filteredLeads.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

      res.json({
        success: true,
        leads: paginatedLeads,
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit),
        storage: 'in-memory'
      });
    }
  } catch (error) {
    winston.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    });
  }
});

// GET /api/leads/:id - Get a specific lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lead'
    });
  }
});

// PUT /api/leads/:id - Update lead (mark as contacted, add notes)
router.put('/:id', async (req, res) => {
  try {
    const { contacted, notes } = req.body;

    const updateData = {};
    if (typeof contacted !== 'undefined') {
      updateData.contacted = contacted;
    }
    if (notes) {
      updateData.notes = notes;
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update lead'
    });
  }
});

// GET /api/leads/check/:phone - Check if phone already exists
router.get('/check/:phone', async (req, res) => {
  try {
    const lead = await Lead.findByPhone(req.params.phone);

    res.json({
      success: true,
      exists: !!lead,
      lead: lead || null
    });
  } catch (error) {
    console.error('Error checking lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check lead'
    });
  }
});

module.exports = router;
