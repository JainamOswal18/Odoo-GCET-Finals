import { allQuery, getQuery } from '../config/database.js';

class AnalyticalService {
  async applyAutoModels(transactionData) {
    try {
      // Get all active confirmed models
      const models = await allQuery(
        `SELECT * FROM auto_analytical_models 
         WHERE active = 1 AND status = 'confirm'
         ORDER BY id ASC`,
        []
      );

      if (models.length === 0) {
        return null;
      }

      // Extract transaction fields
      const { partnerId, productId, partnerTag, productCategory } = transactionData;

      // Find the best matching model (most fields matched)
      let bestMatch = null;
      let maxMatches = 0;

      for (const model of models) {
        let matchCount = 0;

        // Check each field for match
        if (model.partner_id && model.partner_id == partnerId) {
          matchCount++;
        }
        if (model.product_id && model.product_id == productId) {
          matchCount++;
        }
        if (model.partner_tag && partnerTag) {
          // Handle both array and string formats
          if (Array.isArray(partnerTag)) {
            if (partnerTag.some(tag => 
              String(tag).toLowerCase().includes(String(model.partner_tag).toLowerCase())
            )) {
              matchCount++;
            }
          } else if (String(partnerTag).toLowerCase().includes(String(model.partner_tag).toLowerCase())) {
            matchCount++;
          }
        }
        if (model.product_category && productCategory && 
            String(productCategory).toLowerCase() === String(model.product_category).toLowerCase()) {
          matchCount++;
        }

        // Update best match if this model has more matches
        if (matchCount > 0 && matchCount > maxMatches) {
          maxMatches = matchCount;
          bestMatch = model;
        }
      }

      // Return the analytical account ID from best matching model
      return bestMatch ? bestMatch.analytical_account_id : null;
    } catch (error) {
      console.error('Error applying auto models:', error);
      return null;
    }
  }

  async assignAnalyticalAccounts(lines, transactionData) {
    const updatedLines = [];

    for (const line of lines) {
      // Skip if already has analytical account assigned
      if (line.analytical_account_id) {
        updatedLines.push(line);
        continue;
      }

      // Get product details for matching
      let product = null;
      if (line.product_id) {
        product = await getQuery('SELECT * FROM products WHERE id = ?', [line.product_id]);
      }

      // Get partner details for matching
      let partner = null;
      if (transactionData.partnerId || transactionData.vendor_id || transactionData.customer_id) {
        const contactId = transactionData.partnerId || transactionData.vendor_id || transactionData.customer_id;
        partner = await getQuery('SELECT * FROM contacts WHERE id = ?', [contactId]);
      }

      // Parse partner tags if they're in JSON format
      let partnerTags = null;
      if (partner?.tags) {
        try {
          if (typeof partner.tags === 'string' && partner.tags.startsWith('[')) {
            partnerTags = JSON.parse(partner.tags);
          } else {
            partnerTags = partner.tags;
          }
        } catch (e) {
          partnerTags = partner.tags;
        }
      }

      // Build matching data
      const matchData = {
        partnerId: partner?.id,
        partnerTag: partnerTags,
        productId: product?.id,
        productCategory: product?.category
      };

      // Apply auto models
      const analyticalAccountId = await this.applyAutoModels(matchData);

      if (analyticalAccountId) {
        line.analytical_account_id = analyticalAccountId;
      }

      updatedLines.push(line);
    }

    return updatedLines;
  }
}

export default new AnalyticalService();
