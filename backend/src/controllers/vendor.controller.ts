import { Request, Response } from 'express';
import { AppDataSource } from '../database/config';
import { Order, OrderDocumentStatus, Document, Shipment, VendorProfile, Product } from '../entities';

// Get all orders for the logged-in vendor
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Find vendor profile for this user
    const vendorProfileRepo = AppDataSource.getRepository(VendorProfile);
    const vendorProfile = await vendorProfileRepo.findOne({ 
      where: { userId: user.userId } 
    });
    
    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    const orderRepo = AppDataSource.getRepository(Order);
    const docStatusRepo = AppDataSource.getRepository(OrderDocumentStatus);
    const productRepo = AppDataSource.getRepository(Product);
    
    // Get all orders for this vendor
    const orders = await orderRepo.find({
      where: { vendorId: vendorProfile.id },
      order: { createdAt: 'DESC' },
    });
    
    // For each order, get document requirements and product details
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const requirements = await docStatusRepo.find({
          where: { orderId: order.id },
        });
        
        const product = await productRepo.findOne({
          where: { id: order.productId },
        });
        
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          vendorId: order.vendorId,
          productId: order.productId,
          productName: product?.name || 'Unknown',
          quantity: order.quantity,
          destination: order.destination,
          status: order.status,
          createdAt: order.createdAt,
          requirements: requirements.map(req => ({
            id: req.id,
            docType: req.docType,
            status: req.status,
            required: req.required,
            category: req.category,
          })),
        };
      })
    );
    
    res.json({ 
      orders: ordersWithDetails,
      vendorProfile: {
        id: vendorProfile.id,
        companyName: vendorProfile.companyName,
        status: vendorProfile.status,
        capacity: vendorProfile.capacity,
      }
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Accept an order (change status from REQUESTED to DOCS_PENDING)
export const acceptOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { orderId } = req.params;
    
    const orderRepo = AppDataSource.getRepository(Order);
    const vendorProfileRepo = AppDataSource.getRepository(VendorProfile);
    
    // Verify vendor owns this order
    const vendorProfile = await vendorProfileRepo.findOne({ 
      where: { userId: user.userId } 
    });
    
    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    const order = await orderRepo.findOne({ 
      where: { id: orderId, vendorId: vendorProfile.id } 
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status !== 'REQUESTED') {
      return res.status(400).json({ error: 'Order cannot be accepted in current status' });
    }
    
    // Update order status
    order.status = 'DOCS_PENDING';
    await orderRepo.save(order);
    
    res.json({ 
      message: 'Order accepted successfully',
      order,
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ error: 'Failed to accept order' });
  }
};

// Upload a document for an order
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { orderId, docType, fileName } = req.body;
    
    // Validation
    if (!orderId || !docType || !fileName) {
      return res.status(400).json({ error: 'Order ID, document type, and file are required' });
    }
    
    const orderRepo = AppDataSource.getRepository(Order);
    const docStatusRepo = AppDataSource.getRepository(OrderDocumentStatus);
    const documentRepo = AppDataSource.getRepository(Document);
    const vendorProfileRepo = AppDataSource.getRepository(VendorProfile);
    
    // Verify vendor owns this order
    const vendorProfile = await vendorProfileRepo.findOne({ 
      where: { userId: user.userId } 
    });
    
    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    const order = await orderRepo.findOne({ 
      where: { id: orderId, vendorId: vendorProfile.id } 
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // In a real implementation:
    // 1. Upload file to S3/MinIO
    // 2. Store file URL in database
    // For now, we'll just store metadata
    
    // Create document record
    const document = documentRepo.create({
      orderId: order.id,
      productId: order.productId,
      docType,
      fileName,
      filePath: `/uploads/vendor/${fileName}`, // Mock path
      status: 'PENDING_REVIEW',
      category: 'TRANSACTIONAL',
      companyId: user.companyId,
      uploadedById: user.userId,
      uploadedBy: user.userId,
    });
    await documentRepo.save(document);
    
    // Update document status
    const docStatus = await docStatusRepo.findOne({
      where: { orderId: order.id, docType },
    });
    
    if (docStatus) {
      docStatus.status = 'PENDING_REVIEW';
      docStatus.uploadedDocId = document.id;
      await docStatusRepo.save(docStatus);
    }
    
    res.json({
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// Create shipment for an order (when all docs are approved)
export const createShipment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { orderId, trackingNumber, courier } = req.body;
    
    // Validation
    if (!orderId || !trackingNumber || !courier) {
      return res.status(400).json({ error: 'Order ID, tracking number, and courier are required' });
    }
    
    const orderRepo = AppDataSource.getRepository(Order);
    const shipmentRepo = AppDataSource.getRepository(Shipment);
    const vendorProfileRepo = AppDataSource.getRepository(VendorProfile);
    
    // Verify vendor owns this order
    const vendorProfile = await vendorProfileRepo.findOne({ 
      where: { userId: user.userId } 
    });
    
    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    const order = await orderRepo.findOne({ 
      where: { id: orderId, vendorId: vendorProfile.id } 
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status !== 'READY_TO_SHIP') {
      return res.status(400).json({ error: 'Order is not ready to ship. Complete all compliance checks first.' });
    }
    
    // Create shipment record
    const shipment = shipmentRepo.create({
      orderId: order.id,
      orderNumber: order.orderNumber,
      trackingNumber,
      courier,
      courierName: courier,
      status: 'IN_TRANSIT',
      currentLocation: 'Processing Center',
      location: 'Processing Center',
      latitude: 1.3521, // Default Singapore location
      longitude: 103.8198,
      companyId: user.companyId,
      createdById: user.userId,
    });
    await shipmentRepo.save(shipment);
    
    // Update order status
    order.status = 'IN_TRANSIT';
    await orderRepo.save(order);
    
    res.json({
      message: 'Shipment created successfully',
      shipment,
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
};

// Accept vendor invitation (update status from INVITED to ACCEPTED)
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    const vendorProfileRepo = AppDataSource.getRepository(VendorProfile);
    const vendorProfile = await vendorProfileRepo.findOne({ 
      where: { userId: user.userId } 
    });
    
    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    if (vendorProfile.status !== 'INVITED') {
      return res.status(400).json({ error: 'Invitation already processed' });
    }
    
    vendorProfile.status = 'ACCEPTED';
    await vendorProfileRepo.save(vendorProfile);
    
    res.json({
      message: 'Invitation accepted successfully',
      vendorProfile: {
        id: vendorProfile.id,
        companyName: vendorProfile.companyName,
        status: vendorProfile.status,
      },
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
};