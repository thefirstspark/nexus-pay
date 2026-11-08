export type TransactionStatus = 'PENDING_APPROVAL' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
export type ApprovalType = 'AUTONOMOUS' | 'HUMAN_CONFIRMED';

export interface LedgerItem {
  id: string;
  timestamp: string;
  orderId: string;
  vendor: string;
  itemDescription: string;
  category: 'Cloud & Compute' | 'Hardware & Parts' | 'Office Logistics' | 'Marketing' | 'Developer Services';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  status: TransactionStatus;
  paypalOrderId: string;
  paypalCaptureId?: string;
  confidenceScore: number;
  approvalType: ApprovalType;
  riskScore: 'LOW' | 'MEDIUM' | 'ELEVATED';
  notes?: string;
  [key: string]: unknown;
}

export interface VendorQuote {
  id: string;
  vendorName: string;
  itemDescription: string;
  pricePerUnit: number;
  quantity: number;
  totalPrice: number;
  deliveryDays: number;
  rating: number;
  stockAvailable: number;
  paypalMerchantEmail: string;
  complianceVerified: boolean;
  [key: string]: unknown;
}

export type StepType = 'thought' | 'tool' | 'approval' | 'payment' | 'completed';
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'waiting_approval';

export interface AgentStep {
  id: string;
  stepNumber: number;
  type: StepType;
  title: string;
  description: string;
  timestamp: string;
  status: StepStatus;
  metadata?: {
    toolName?: string;
    quotes?: VendorQuote[];
    selectedQuote?: VendorQuote;
    budgetLimit?: number;
    paypalOrderId?: string;
    paypalApproveUrl?: string;
    captureId?: string;
    reasoning?: string[];
  };
  [key: string]: unknown;
}

export interface ProcurementPrompt {
  id: string;
  label: string;
  query: string;
  category: string;
  budgetLimit: number;
}
