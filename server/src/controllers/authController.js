import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { runQuery, getQuery, allQuery } from '../config/database.js';

class AuthController {
  
  // ============================================================================
  // ADMIN USER REGISTRATION (Admin creates new Admin or Portal user)
  // ============================================================================
  async register(req, res, next) {
    try {
      const { name, loginId, email, password, role, contact_id } = req.body;

      // Check if login ID already exists in users table
      const existingUser = await getQuery(
        'SELECT id FROM users WHERE login_id = ?',
        [loginId]
      );

      if (existingUser) {
        return res.status(400).json({ error: 'Login ID already exists' });
      }

      // Check if email already exists in users table
      const existingEmail = await getQuery(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // For portal users, also check portal_access table
      if (role === 'portal') {
        const existingPortalLogin = await getQuery(
          'SELECT id FROM portal_access WHERE login_id = ?',
          [loginId]
        );

        if (existingPortalLogin) {
          return res.status(400).json({ error: 'Login ID already exists in portal' });
        }

        const existingPortalEmail = await getQuery(
          'SELECT id FROM portal_access WHERE email = ?',
          [email]
        );

        if (existingPortalEmail) {
          return res.status(400).json({ error: 'Email already exists in portal' });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      if (role === 'admin') {
        // Create admin user in users table
        const result = await runQuery(
          `INSERT INTO users (login_id, email, password_hash, full_name, role)
           VALUES (?, ?, ?, ?, ?)`,
          [loginId, email, hashedPassword, name, 'admin']
        );

        res.status(201).json({
          message: 'Admin user created successfully',
          user: {
            id: result.id,
            loginId,
            email,
            name,
            role: 'admin'
          }
        });
      } else if (role === 'portal') {
        // For portal users, we need a contact
        let contactId = contact_id;

        if (!contactId) {
          // Create a new contact for this portal user
          const contactResult = await runQuery(
            `INSERT INTO contacts (name, email, contact_type, is_customer, created_by)
             VALUES (?, ?, 'individual', 1, ?)`,
            [name, email, req.user.id]
          );
          contactId = contactResult.id;
        } else {
          // Verify contact exists
          const contact = await getQuery('SELECT id FROM contacts WHERE id = ?', [contactId]);
          if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
          }

          // Check if contact already has portal access
          const existingAccess = await getQuery(
            'SELECT id FROM portal_access WHERE contact_id = ?',
            [contactId]
          );
          if (existingAccess) {
            return res.status(400).json({ error: 'Contact already has portal access' });
          }
        }

        // Create portal access
        const result = await runQuery(
          `INSERT INTO portal_access (contact_id, login_id, email, password_hash)
           VALUES (?, ?, ?, ?)`,
          [contactId, loginId, email, hashedPassword]
        );

        res.status(201).json({
          message: 'Portal user created successfully',
          user: {
            id: result.id,
            loginId,
            email,
            name,
            role: 'portal',
            contact_id: contactId
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // UNIFIED LOGIN (Auto-detects Admin or Portal user)
  // ============================================================================
  async login(req, res, next) {
    try {
      const { loginId, password } = req.body;

      // Step 1: Check if user is an admin user (by login_id)
      let adminUser = await getQuery(
        'SELECT * FROM users WHERE login_id = ? AND active = 1',
        [loginId]
      );

      // Step 1b: If not found by login_id, try email for admin users
      if (!adminUser) {
        adminUser = await getQuery(
          'SELECT * FROM users WHERE email = ? AND active = 1',
          [loginId]
        );
      }

      if (adminUser) {
        // Verify password for admin user
        const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);

        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid Login ID or Password' });
        }

        // Generate token for admin
        const token = jwt.sign(
          { userId: adminUser.id, role: adminUser.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        // Update last activity
        await runQuery(
          'UPDATE users SET updated_at = datetime(\'now\') WHERE id = ?',
          [adminUser.id]
        );

        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: adminUser.id,
            loginId: adminUser.login_id,
            email: adminUser.email,
            name: adminUser.full_name,
            role: adminUser.role
          }
        });
      }

      // Step 2: Check if user is a portal user (by login_id)
      let portalAccess = await getQuery(
        `SELECT pa.*, c.name, c.id as contact_id
         FROM portal_access pa
         JOIN contacts c ON pa.contact_id = c.id
         WHERE pa.login_id = ? AND pa.active = 1`,
        [loginId]
      );

      // Step 3: If not found by login_id, try email (for portal users)
      if (!portalAccess) {
        portalAccess = await getQuery(
          `SELECT pa.*, c.name, c.id as contact_id
           FROM portal_access pa
           JOIN contacts c ON pa.contact_id = c.id
           WHERE pa.email = ? AND pa.active = 1`,
          [loginId]
        );
      }

      if (portalAccess) {
        // Verify password for portal user
        const isPasswordValid = await bcrypt.compare(password, portalAccess.password_hash);

        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid Login ID or Password' });
        }

        // Generate token for portal user
        const token = jwt.sign(
          { portalUserId: portalAccess.id, contactId: portalAccess.contact_id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        // Update last login
        await runQuery(
          'UPDATE portal_access SET last_login = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?',
          [portalAccess.id]
        );

        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: portalAccess.id,
            loginId: portalAccess.login_id || portalAccess.email,
            name: portalAccess.name,
            email: portalAccess.email,
            contact_id: portalAccess.contact_id,
            role: 'portal'
          }
        });
      }

      // Step 4: No user found
      return res.status(401).json({ error: 'Invalid Login ID or Password' });

    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // CREATE PORTAL ACCESS FOR EXISTING CONTACT
  // ============================================================================
  async createPortalAccess(req, res, next) {
    try {
      const { contact_id, loginId, email, password } = req.body;

      const contact = await getQuery('SELECT * FROM contacts WHERE id = ?', [contact_id]);

      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      // Check if login ID already exists
      const existingLoginId = await getQuery(
        'SELECT id FROM portal_access WHERE login_id = ?',
        [loginId]
      );

      if (existingLoginId) {
        return res.status(400).json({ error: 'Login ID already exists' });
      }

      // Check if email already exists
      const existingEmail = await getQuery(
        'SELECT id FROM portal_access WHERE email = ?',
        [email]
      );

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Check if contact already has portal access
      const existingAccess = await getQuery(
        'SELECT id FROM portal_access WHERE contact_id = ?',
        [contact_id]
      );

      if (existingAccess) {
        return res.status(400).json({ error: 'Portal access already exists for this contact' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await runQuery(
        `INSERT INTO portal_access (contact_id, login_id, email, password_hash)
         VALUES (?, ?, ?, ?)`,
        [contact_id, loginId, email, hashedPassword]
      );

      res.status(201).json({
        message: 'Portal access created successfully',
        id: result.id,
        loginId,
        email,
        contact_id
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // GET PROFILE
  // ============================================================================
  async getProfile(req, res, next) {
    try {
      const user = await getQuery(
        'SELECT id, login_id as loginId, email, full_name as name, role, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // UPDATE PASSWORD
  // ============================================================================
  async updatePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;

      const user = await getQuery(
        'SELECT * FROM users WHERE id = ?',
        [req.user.id]
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);

      await runQuery(
        'UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [hashedPassword, req.user.id]
      );

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // FORGOT PASSWORD
  // ============================================================================
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      // Check in users table
      const user = await getQuery('SELECT id, email FROM users WHERE email = ?', [email]);
      
      // Check in portal_access table
      const portalUser = await getQuery('SELECT id, email FROM portal_access WHERE email = ?', [email]);

      if (!user && !portalUser) {
        // Don't reveal if email exists or not for security
        return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

      // In a real app, you would:
      // 1. Store the reset token hash and expiry in the database
      // 2. Send an email with the reset link containing the token
      
      // For now, we'll just log it (replace with email service)
      console.log(`Password reset requested for ${email}. Token: ${resetToken}`);

      res.json({ 
        message: 'If an account exists with this email, a password reset link has been sent.',
        // Remove this in production - only for testing
        debug_token: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // RESET PASSWORD
  // ============================================================================
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      // In a real app, you would:
      // 1. Hash the token and look it up in the database
      // 2. Check if it's expired
      // 3. Update the password
      // 4. Invalidate the token

      // For now, this is a placeholder
      res.json({ message: 'Password reset functionality requires email service integration.' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // LIST ALL USERS (Admin only)
  // ============================================================================
  async listUsers(req, res, next) {
    try {
      // Get admin users
      const adminUsers = await allQuery(
        `SELECT id, login_id as loginId, email, full_name as name, role, active, created_at, updated_at 
         FROM users 
         ORDER BY created_at DESC`
      );

      // Get portal users
      const portalUsers = await allQuery(
        `SELECT pa.id, pa.login_id as loginId, pa.email, c.name, 'portal' as role, 
                pa.active, pa.created_at, pa.updated_at, pa.contact_id
         FROM portal_access pa
         JOIN contacts c ON pa.contact_id = c.id
         ORDER BY pa.created_at DESC`
      );

      res.json({
        adminUsers,
        portalUsers,
        total: adminUsers.length + portalUsers.length
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // DEACTIVATE USER (Admin only)
  // ============================================================================
  async deactivateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { userType } = req.query; // 'admin' or 'portal'

      if (userType === 'portal') {
        await runQuery(
          'UPDATE portal_access SET active = 0, updated_at = datetime(\'now\') WHERE id = ?',
          [id]
        );
      } else {
        // Prevent deactivating yourself
        if (parseInt(id) === req.user.id) {
          return res.status(400).json({ error: 'Cannot deactivate your own account' });
        }

        await runQuery(
          'UPDATE users SET active = 0, updated_at = datetime(\'now\') WHERE id = ?',
          [id]
        );
      }

      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // ACTIVATE USER (Admin only)
  // ============================================================================
  async activateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { userType } = req.query; // 'admin' or 'portal'

      if (userType === 'portal') {
        await runQuery(
          'UPDATE portal_access SET active = 1, updated_at = datetime(\'now\') WHERE id = ?',
          [id]
        );
      } else {
        await runQuery(
          'UPDATE users SET active = 1, updated_at = datetime(\'now\') WHERE id = ?',
          [id]
        );
      }

      res.json({ message: 'User activated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
