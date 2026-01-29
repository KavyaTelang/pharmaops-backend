import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToOne, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) name!: string;
  @Column({ unique: true }) domain!: string;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @Column({ unique: true }) sku!: string;
  @Column({ nullable: true }) description!: string;
  @Column('uuid') companyId!: string;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('vendor_profiles')
export class VendorProfile {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid', { unique: true }) userId!: string;
  
  // Added relation for controller queries
  @OneToOne(() => User, (user) => user.vendorProfile)
  @JoinColumn({ name: 'userId' })
  user!: any; 

  @Column() companyName!: string;
  @Column({ nullable: true }) licenseNumber!: string;
  @Column({ nullable: true }) warehouseAddress!: string;
  @Column({ type: 'int', default: 1000 }) capacity!: number;
  @Column({ default: 'PENDING' }) status!: string;
  
  // MISSING COLUMN: Required by inviteVendor controller
  @Column('uuid') companyId!: string;

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) email!: string;
  @Column() passwordHash!: string;
  @Column() role!: string;
  @Column() name!: string;
  @Column({ default: true }) isActive!: boolean;
  @Column('uuid') companyId!: string;

  // Added relation for controller queries
  @OneToOne(() => VendorProfile, (profile) => profile.user)
  vendorProfile!: VendorProfile;

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) orderNumber!: string;
  @Column('uuid') vendorId!: string;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'vendorId' })
  vendor!: User;

  @Column('uuid') productId!: string;
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column('int') quantity!: number;
  @Column() destination!: string;
  @Column({ default: 'REQUESTED' }) status!: string;
  @Column('uuid') companyId!: string;

  // MISSING COLUMN: Required by createOrderRequest controller
  @Column('uuid') createdById!: string;

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('order_document_status')
export class OrderDocumentStatus {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') orderId!: string;
  @Column('uuid') requirementId!: string;
  @Column('uuid', { nullable: true }) uploadedDocId!: string;
  @Column({ default: 'MISSING' }) status!: string;

  // MISSING COLUMNS: Required by createOrderRequest controller
  @Column() docType!: string;
  @Column({ default: true }) required!: boolean;
  @Column() category!: string;

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('document_requirements')
export class DocumentRequirement {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') productId!: string;
  @Column() destination!: string;
  @Column() docType!: string;
  @Column() uploaderRole!: string;
  @Column() category!: string;
  @Column({ type: 'text', nullable: true }) requirement!: string;

  // MISSING COLUMN: Required by defineComplianceRule controller
  @Column('uuid') companyId!: string;

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() fileName!: string;
  @Column() s3Url!: string; // Current name
  @Column({ nullable: true }) fileHash!: string;
  @Column() docType!: string;
  @Column('uuid') uploadedBy!: string;
  @Column({ default: 'PENDING_REVIEW' }) status!: string;
  @Column('uuid', { nullable: true }) approvedBy!: string;
  @Column({ type: 'timestamp', nullable: true }) approvalTimestamp!: Date;
  @Column({ type: 'text', nullable: true }) rejectionReason!: string;
  @Column({ type: 'date', nullable: true }) expiryDate!: Date;
  @Column('uuid', { nullable: true }) orderId!: string;
  @Column('uuid', { nullable: true }) productId!: string;

  // MISSING COLUMNS: Required by uploadMasterSOP controller
  @Column() filePath!: string;
  @Column() category!: string;
  @Column('uuid') companyId!: string;
  @Column('uuid') uploadedById!: string;

  // MISSING COLUMNS: Required by QA and Auditor controllers
  @Column('uuid', { nullable: true }) reviewedById!: string;
  @Column({ type: 'timestamp', nullable: true }) reviewedAt!: Date;
  @Column({ type: 'text', nullable: true }) reviewComments!: string;

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('vendor_product_assignments')
export class VendorProductAssignment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') vendorUserId!: string;
  @Column('uuid') productId!: string;
  @Column({ default: false }) isMasterLicenseValid!: boolean;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid', { unique: true }) orderId!: string;
  @Column() orderNumber!: string;
  @Column() trackingNumber!: string;
  @Column({ nullable: true }) courierName!: string;
  @Column({ default: 'PREPARING' }) status!: string;
  @Column({ nullable: true }) currentLocation!: string;
  @Column('decimal', { precision: 10, scale: 6, nullable: true }) latitude!: number;
  @Column('decimal', { precision: 10, scale: 6, nullable: true }) longitude!: number;
  @Column({ type: 'timestamp', nullable: true }) estimatedArrival!: Date;
  @Column('uuid') companyId!: string;
  @Column('uuid') createdById!: string;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('blockchain_anchors')
export class BlockchainAnchor {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid', { nullable: true }) entityId!: string;
  @Column() entityType!: string;
  @Column() txHash!: string;
  @Column({ type: 'timestamp' }) blockTimestamp!: Date;
  @Column({ type: 'text', nullable: true }) blockchainNetwork!: string;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('audit_trails')
export class AuditTrail {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') companyId!: string;
  @Column('uuid') actorUserId!: string;
  @Column() action!: string;
  @Column('uuid', { nullable: true }) entityId!: string;
  @Column({ type: 'jsonb', nullable: true }) oldValue!: any;
  @Column({ type: 'jsonb', nullable: true }) newValue!: any;
  @Column({ type: 'text', nullable: true }) comments!: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) timestamp!: Date;
}

export const entities = [
  Company, User, VendorProfile, Product, VendorProductAssignment,
  DocumentRequirement, Order, OrderDocumentStatus, Document,
  Shipment, BlockchainAnchor, AuditTrail
];