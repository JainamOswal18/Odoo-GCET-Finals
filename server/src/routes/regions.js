import express from 'express';
import { allQuery } from '../config/database.js';

const router = express.Router();

/**
 * Search countries
 * GET /api/regions/countries?search=india
 */
router.get('/countries', async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    let query = 'SELECT id, iso2, iso3, name, phone_code, currency, flag FROM countries';
    let params = [];
    
    if (search) {
      query += ' WHERE name LIKE ? OR iso2 LIKE ? OR iso3 LIKE ?';
      const searchParam = `%${search}%`;
      params = [searchParam, searchParam, searchParam];
    }
    
    query += ' ORDER BY name ASC LIMIT 100';
    
    const countries = await allQuery(query, params);
    
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch countries'
    });
  }
});

/**
 * Get states by country
 * GET /api/regions/countries/:countryId/states?search=maharashtra
 */
router.get('/countries/:countryId/states', async (req, res) => {
  try {
    const { countryId } = req.params;
    const { search = '' } = req.query;
    
    let query = `
      SELECT id, country_id, name, state_code 
      FROM states 
      WHERE country_id = ?
    `;
    let params = [countryId];
    
    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY name ASC LIMIT 100';
    
    const states = await allQuery(query, params);
    
    res.json({
      success: true,
      data: states
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch states'
    });
  }
});

/**
 * Get cities by state
 * GET /api/regions/states/:stateId/cities?search=mumbai
 */
router.get('/states/:stateId/cities', async (req, res) => {
  try {
    const { stateId } = req.params;
    const { search = '' } = req.query;
    
    let query = `
      SELECT id, state_id, country_id, name 
      FROM cities 
      WHERE state_id = ?
    `;
    let params = [stateId];
    
    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY name ASC LIMIT 100';
    
    const cities = await allQuery(query, params);
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities'
    });
  }
});

/**
 * Get cities by country (for cases where state is optional)
 * GET /api/regions/countries/:countryId/cities?search=mumbai
 */
router.get('/countries/:countryId/cities', async (req, res) => {
  try {
    const { countryId } = req.params;
    const { search = '' } = req.query;
    
    let query = `
      SELECT id, state_id, country_id, name 
      FROM cities 
      WHERE country_id = ?
    `;
    let params = [countryId];
    
    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY name ASC LIMIT 100';
    
    const cities = await allQuery(query, params);
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities'
    });
  }
});

export default router;
