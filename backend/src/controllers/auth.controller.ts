import { Request, Response } from 'express';
import { AppDataSource } from '../database/config';
import { User, VendorProfile } from '../entities';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

export const login = async (req: Request, res: Response) => {
  console.log('\n=== LOGIN ATTEMPT ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const { email, password } = req.body;
    console.log('Email:', email);
    console.log('Password provided:', password ? 'YES' : 'NO');

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.email);
    console.log('   - ID:', user.id);
    console.log('   - Role:', user.role);
    console.log('   - Name:', user.name);

    // Check if passwordHash exists
    if (!user.passwordHash) {
      console.log('❌ User has no password hash in database');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('   - Password hash exists:', user.passwordHash.substring(0, 15) + '...');

    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log('Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Password mismatch for:', email);
      
      // DEBUG: Show what the hash of the provided password would be
      const testHash = await bcrypt.hash(password, 10);
      console.log('   - Provided password would hash to:', testHash.substring(0, 15) + '...');
      console.log('   - Stored hash starts with:', user.passwordHash.substring(0, 15) + '...');
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password valid!');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    console.log('✅ Token generated:', token.substring(0, 30) + '...');

    // Get vendor profile if user is a vendor
    let vendorProfile = null;
    if (user.role === 'VENDOR') {
      const vendorProfileRepo = AppDataSource.getRepository(VendorProfile);
      vendorProfile = await vendorProfileRepo.findOne({ where: { userId: user.id } });
      console.log('✅ Vendor profile loaded:', vendorProfile ? 'YES' : 'NO');
    }

    console.log('✅ LOGIN SUCCESSFUL\n');

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        vendorProfile,
      },
    });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    console.error('Error details:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  console.log('\n=== GET CURRENT USER ===');
  
  try {
    const userId = (req as any).user.userId;
    console.log('User ID from token:', userId);

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found:', user.email);

    // Get vendor profile if user is a vendor
    let vendorProfile = null;
    if (user.role === 'VENDOR') {
      const vendorProfileRepo = AppDataSource.getRepository(VendorProfile);
      vendorProfile = await vendorProfileRepo.findOne({ where: { userId: user.id } });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        vendorProfile,
      },
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};