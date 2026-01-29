import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { api } from '../services/api';

// --- TYPES ---
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyName?: string;
}

interface Product {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  companyName: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  vendorId: string;
  destination: string;
  status: string;
  quantity: number;
  requirements?: any[];
}

interface Document {
  id: string;
  docType: string;
  fileName: string;
  status: string;
  priority: string;
  orderNumber: string;
  orderId: string;
  vendorName: string;
  uploadDate: string;
  aiInsights?: {
    qualityScore: number;
    flag?: string;
  };
  fileHash?: string;
  blockchainTx?: string;
  approvedBy?: string;
  approvalDate?: string;
}

interface MasterSOP {
  id: string;
  title: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: { name: string; role: string; id: string };
  action: string;
  entity: string;
  blockchainHash?: string;
  changes?: any;
}

interface TimelineEvent {
  step: string;
  date: string;
  actor: string;
  status: string;
  hash?: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  // Data
  products: Product[];
  vendors: Vendor[];
  orders: Order[];
  documents: Document[];
  masterSOPs: MasterSOP[];
  auditLogs: AuditLog[];
  // Helpers
  getVendorById: (id: string) => Vendor | undefined;
  getProductById: (id: string) => Product | undefined;
  getOrderById: (id: string) => Order | undefined;
  getOrderTimeline: (orderId: string) => TimelineEvent[];
  // Actions
  approveDocument: (docId: string, signerName: string, signature: string, comments: string) => void;
  rejectDocument: (docId: string, reviewerName: string, comments: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- MOCK DATA ---
const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Atenolol 50mg' },
  { id: 'p2', name: 'Metformin 500mg' },
];

const MOCK_VENDORS = [
  { id: 'v1', companyName: 'Global Pharma Inc', status: 'ACCEPTED' },
  { id: 'v2', companyName: 'MediSupply Co', status: 'INVITED' },
];

const MOCK_ORDERS = [
  {
    id: 'o1',
    orderNumber: 'ORD-2023-001',
    productId: 'p1',
    vendorId: 'v1',
    destination: 'New York, USA',
    status: 'READY_TO_SHIP',
    quantity: 500,
    requirements: [
      { id: 'r1', docType: 'Packing List', status: 'APPROVED', category: 'TRANSACTIONAL', expiryDate: '2024-10-26' },
      { id: 'r2', docType: 'Certificate of Analysis', status: 'APPROVED', category: 'MASTER' }
    ]
  },
  {
    id: 'o2',
    orderNumber: 'ORD-2023-002',
    productId: 'p2',
    vendorId: 'v2',
    destination: 'Berlin, DE',
    status: 'REQUESTED',
    quantity: 1200,
    requirements: []
  },
  {
    id: 'o3',
    orderNumber: 'ORD-2023-003',
    productId: 'p1',
    vendorId: 'v1',
    destination: 'Tokyo, JP',
    status: 'DOCS_PENDING',
    quantity: 800,
    requirements: [
      { id: 'r3', docType: 'Certificate of Analysis', status: 'PENDING_REVIEW', category: 'TRANSACTIONAL' }
    ]
  },
];

const MOCK_DOCS = [
  {
    id: 'd1',
    docType: 'Packing List',
    fileName: 'packing_list_v1.pdf',
    status: 'APPROVED',
    priority: 'HIGH',
    orderNumber: 'ORD-2023-001',
    orderId: 'o1',
    vendorName: 'Global Pharma Inc',
    uploadDate: '2023-10-26',
    aiInsights: { qualityScore: 98 },
    fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    blockchainTx: '0x71c3569f984d72863B8d672728e93297a7B20f86',
    approvedBy: 'Dr. Pulashya Verma (QA Lead)',
    approvalDate: '2023-10-26 14:30:00'
  },
  {
    id: 'd2',
    docType: 'Certificate of Analysis',
    fileName: 'coa_batch_998.pdf',
    status: 'PENDING_REVIEW',
    priority: 'MEDIUM',
    orderNumber: 'ORD-2023-003',
    orderId: 'o3',
    vendorName: 'Global Pharma Inc',
    uploadDate: '2023-10-27',
    aiInsights: { qualityScore: 85, flag: 'Minor formatting issue detected' }
  }
];

const MOCK_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    timestamp: new Date().toISOString(),
    actor: { name: 'Admin User', role: 'ADMIN', id: 'u1' },
    action: 'CREATE_ORDER',
    entity: 'ORD-2023-001',
    blockchainHash: '0xabc1234567890abcdef1234567890abcdef12',
    changes: { status: 'CREATED', quantity: 500 }
  },
  {
    id: 'log_002',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    actor: { name: 'Vendor User', role: 'VENDOR', id: 'v1' },
    action: 'UPLOAD_DOC',
    entity: 'packing_list_v1.pdf',
    blockchainHash: '0xdef1234567890abcdef1234567890abcdef12',
    changes: { docType: 'Packing List' }
  },
  {
    id: 'log_003',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    actor: { name: 'Dr. Pulashya Verma', role: 'QA', id: 'qa1' },
    action: 'APPROVE_DOC',
    entity: 'packing_list_v1.pdf',
    blockchainHash: '0x71c3569f984d72863B8d672728e93297a7B20f86',
    changes: { status: 'APPROVED' }
  }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCS);
  const [masterSOPs, _setMasterSOPs] = useState<MasterSOP[]>([]);
  const [auditLogs, _setAuditLogs] = useState<AuditLog[]>(MOCK_LOGS);

  // Load real data if available, else stick to mocks
  useEffect(() => {
    const initData = async () => {
      try {
        const [pData, vData, oData] = await Promise.all([
          api.getProducts().catch(() => ({ products: MOCK_PRODUCTS })),
          api.getVendors().catch(() => ({ vendors: MOCK_VENDORS })),
          api.getOrders().catch(() => ({ orders: MOCK_ORDERS })),
        ]);

        if (pData.products && pData.products.length > 0) setProducts(pData.products);
        if (vData.vendors && vData.vendors.length > 0) setVendors(vData.vendors);
        if (oData.orders && oData.orders.length > 0) setOrders(oData.orders);

        // Use Mock documents/logs for now as endpoints might not exist
      } catch (err) {
        console.warn('Using mock data for AppContext');
      }
    };

    initData();
  }, []);

  // Helpers
  const getVendorById = (id: string) => vendors.find(v => v.id === id);
  const getProductById = (id: string) => products.find(p => p.id === id);
  const getOrderById = (id: string) => orders.find(o => o.id === id);

  const getOrderTimeline = (_orderId: string): TimelineEvent[] => {
    return [
      { step: 'Order Created', date: '2023-10-25 09:00', actor: 'Admin', status: 'COMPLETED', hash: '0xa1...' },
      { step: 'Vendor Accepted', date: '2023-10-25 10:30', actor: 'Global Pharma', status: 'COMPLETED', hash: '0xb2...' },
      { step: 'Documents Uploaded', date: '2023-10-26 11:00', actor: 'Global Pharma', status: 'COMPLETED', hash: '0xc3...' },
      { step: 'QA Verification', date: '2023-10-26 14:30', actor: 'Dr. Pulashya', status: 'COMPLETED', hash: '0xd4...' },
      { step: 'Ready to Ship', date: '2023-10-26 15:00', actor: 'System', status: 'COMPLETED', hash: '0xe5...' }
    ];
  };

  // Actions
  const approveDocument = (docId: string, signerName: string, _signature: string, _comments: string) => {
    setDocuments(prev => prev.map(d =>
      d.id === docId ? {
        ...d,
        status: 'APPROVED',
        blockchainTx: '0x' + Math.random().toString(16).slice(2),
        approvedBy: signerName,
        approvalDate: new Date().toISOString()
      } : d
    ));
  };

  const rejectDocument = (docId: string, _reviewerName: string, _comments: string) => {
    setDocuments(prev => prev.map(d =>
      d.id === docId ? { ...d, status: 'REJECTED' } : d
    ));
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      products,
      vendors,
      orders,
      documents,
      masterSOPs,
      auditLogs,
      getVendorById,
      getProductById,
      getOrderById,
      getOrderTimeline,
      approveDocument,
      rejectDocument
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};