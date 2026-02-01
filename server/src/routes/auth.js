import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController.js';
import { validate } from '../middleware/validator.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Custom password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

// Unified Login - Auto-detects Admin or Portal user based on login_id or email
// Accepts login_id (6+ chars) or email address
router.post('/login',
  [
    body('loginId')
      .trim()
      .notEmpty().withMessage('Login ID or Email is required')
      .isLength({ min: 6 }).withMessage('Login ID must be at least 6 characters'),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],
  validate,
  authController.login
);

// Forgot Password - Request reset
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email is required')
  ],
  validate,
  authController.forgotPassword
);

// Reset Password - With token
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character')
  ],
  validate,
  authController.resetPassword
);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

// Get current user profile
router.get('/me', authenticate, authController.getProfile);

// Update own password
router.put('/password',
  authenticate,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character')
  ],
  validate,
  authController.updatePassword
);

// ============================================================================
// ADMIN-ONLY ROUTES (Admin authentication required)
// ============================================================================

// Create new user (Admin or Portal user) - Admin only
router.post('/register',
  authenticate,
  requireAdmin,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('loginId')
      .trim()
      .notEmpty().withMessage('Login ID is required')
      .isLength({ min: 6 }).withMessage('Login ID must be at least 6 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Login ID can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character'),
    body('role')
      .isIn(['admin', 'portal']).withMessage('Role must be either "admin" or "portal"'),
    // Optional: contact_id for portal users (if linking to existing contact)
    body('contact_id')
      .optional()
      .isInt().withMessage('Contact ID must be a valid integer')
  ],
  validate,
  authController.register
);

// Create Portal Access for existing contact - Admin only
router.post('/portal/create',
  authenticate,
  requireAdmin,
  [
    body('contact_id')
      .isInt().withMessage('Valid contact ID is required'),
    body('loginId')
      .trim()
      .notEmpty().withMessage('Login ID is required')
      .isLength({ min: 6 }).withMessage('Login ID must be at least 6 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Login ID can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character')
  ],
  validate,
  authController.createPortalAccess
);

// List all users (Admin only)
router.get('/users', authenticate, requireAdmin, authController.listUsers);

// Deactivate user (Admin only)
router.put('/users/:id/deactivate', authenticate, requireAdmin, authController.deactivateUser);

// Activate user (Admin only)
router.put('/users/:id/activate', authenticate, requireAdmin, authController.activateUser);

export default router;
