import { allQuery, getQuery } from '../config/database.js';

class AnalyticalService {
  async applyAutoModels(transaction) {
    try {
      const models = await allQuery(
        `SELECT * FROM auto_analytical_models 
         WHERE active = 1 AND (model_type = ? OR model_type = 'both')
         ORDER BY priority ASC`,
        [transaction.type]
      );

      const assignments = [];

      for (const model of models) {
        const conditions = await allQuery(
          'SELECT * FROM auto_analytical_conditions WHERE model_id = ?',
          [model.id]
        );

        let matches = true;

        for (const condition of conditions) {
          const fieldValue = this.getFieldValue(transaction, condition.field_name);
          
          if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
            matches = false;
            break;
          }
        }

        if (matches && conditions.length > 0) {
          conditions.forEach(condition => {
            assignments.push({
              analytical_account_id: condition.analytical_account_id,
              percentage: condition.percentage
            });
          });
          break;
        }
      }

      return assignments;
    } catch (error) {
      console.error('Error applying auto models:', error);
      return [];
    }
  }

  getFieldValue(transaction, fieldName) {
    const parts = fieldName.split('.');
    let value = transaction;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  evaluateCondition(fieldValue, operator, conditionValue) {
    if (fieldValue === null || fieldValue === undefined) {
      return false;
    }

    const field = String(fieldValue).toLowerCase();
    const value = String(conditionValue).toLowerCase();

    switch (operator) {
      case 'equals':
        return field === value;
      case 'contains':
        return field.includes(value);
      case 'starts_with':
        return field.startsWith(value);
      case 'greater_than':
        return parseFloat(fieldValue) > parseFloat(conditionValue);
      case 'less_than':
        return parseFloat(fieldValue) < parseFloat(conditionValue);
      default:
        return false;
    }
  }

  async assignAnalyticalAccounts(lines, transactionType, transactionData) {
    const updatedLines = [];

    for (const line of lines) {
      if (line.analytical_account_id) {
        updatedLines.push(line);
        continue;
      }

      const transaction = {
        type: transactionType,
        ...transactionData,
        line
      };

      const assignments = await this.applyAutoModels(transaction);

      if (assignments.length > 0) {
        line.analytical_account_id = assignments[0].analytical_account_id;
      }

      updatedLines.push(line);
    }

    return updatedLines;
  }
}

export default new AnalyticalService();
