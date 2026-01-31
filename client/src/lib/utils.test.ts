// Example usage of transformKeysToCamelCase transformer
import { transformKeysToCamelCase, toCamelCase } from './utils';

// Example 1: Simple string conversion
console.log('Simple conversion:');
console.log(toCamelCase('internal_reference')); // -> "internalReference"
console.log(toCamelCase('sale_price')); // -> "salePrice"
console.log(toCamelCase('postal_code')); // -> "postalCode"

// Example 2: Object with snake_case keys (like backend response)
const backendResponse = {
  id: 1,
  name: "Premium Chair",
  internal_reference: "CHAIR-001",
  sale_price: 5000,
  cost_price: 3000,
  unit_of_measure: "pcs",
  image_url: "/images/chair.jpg",
  created_at: "2026-01-31T10:00:00Z",
  updated_at: "2026-01-31T10:00:00Z",
};

console.log('\nBackend response (snake_case):');
console.log(backendResponse);

const transformed = transformKeysToCamelCase(backendResponse);
console.log('\nTransformed response (camelCase):');
console.log(transformed);
// Output:
// {
//   id: 1,
//   name: "Premium Chair",
//   internalReference: "CHAIR-001",
//   salePrice: 5000,
//   costPrice: 3000,
//   unitOfMeasure: "pcs",
//   imageUrl: "/images/chair.jpg",
//   createdAt: "2026-01-31T10:00:00Z",
//   updatedAt: "2026-01-31T10:00:00Z"
// }

// Example 3: Array of objects
const backendContacts = {
  contacts: [
    {
      id: 1,
      name: "John Doe",
      contact_type: "customer",
      postal_code: "380001",
      is_vendor: false,
      is_customer: true,
    },
    {
      id: 2,
      name: "Jane Smith",
      contact_type: "vendor",
      postal_code: "380002",
      is_vendor: true,
      is_customer: false,
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    total_pages: 1,
  }
};

console.log('\nArray response transformation:');
const transformedContacts = transformKeysToCamelCase(backendContacts);
console.log(JSON.stringify(transformedContacts, null, 2));
// Output:
// {
//   "contacts": [
//     {
//       "id": 1,
//       "name": "John Doe",
//       "contactType": "customer",
//       "postalCode": "380001",
//       "isVendor": false,
//       "isCustomer": true
//     },
//     ...
//   ],
//   "pagination": {
//     "page": 1,
//     "limit": 10,
//     "total": 2,
//     "totalPages": 1
//   }
// }

// Example 4: Nested objects
const nestedBackendResponse = {
  budget: {
    id: 1,
    budget_name: "Q1 2026 Budget",
    period_start: "2026-01-01",
    period_end: "2026-03-31",
    budget_lines: [
      {
        analytical_account_id: 1,
        budgeted_amount: 100000,
        actual_amount: 75000,
      }
    ]
  }
};

console.log('\nNested object transformation:');
const transformedBudget = transformKeysToCamelCase(nestedBackendResponse);
console.log(JSON.stringify(transformedBudget, null, 2));
// Output:
// {
//   "budget": {
//     "id": 1,
//     "budgetName": "Q1 2026 Budget",
//     "periodStart": "2026-01-01",
//     "periodEnd": "2026-03-31",
//     "budgetLines": [
//       {
//         "analyticalAccountId": 1,
//         "budgetedAmount": 100000,
//         "actualAmount": 75000
//       }
//     ]
//   }
// }
