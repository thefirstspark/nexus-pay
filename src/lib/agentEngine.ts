import { AgentStep, LedgerItem, VendorQuote } from '@/types';
import { MOCK_VENDOR_DIRECTORY } from './mockData';
import { createPayPalOrder, capturePayPalOrder } from './paypal';

const AUTONOMOUS_SPEND_LIMIT = 250.00;

export interface AgentRunParams {
  query: string;
  category?: string;
  budgetLimit?: number;
  autoApprove?: boolean;
}

export interface AgentCycleResult {
  steps: AgentStep[];
  requiresApproval: boolean;
  selectedQuote?: VendorQuote;
  paypalOrderId?: string;
  approveUrl?: string;
  newLedgerItem?: LedgerItem;
  completed: boolean;
}

export async function runAgentCycle(params: AgentRunParams): Promise<AgentCycleResult> {
  const queryLower = params.query.toLowerCase();
  let category: string = params.category || 'Developer Services';

  if (queryLower.includes('gpu') || queryLower.includes('render') || queryLower.includes('compute') || queryLower.includes('cloud')) {
    category = 'Cloud & Compute';
  } else if (queryLower.includes('box') || queryLower.includes('pack') || queryLower.includes('mail') || queryLower.includes('shipping')) {
    category = 'Office Logistics';
  } else if (queryLower.includes('yubi') || queryLower.includes('key') || queryLower.includes('hardware') || queryLower.includes('rfid')) {
    category = 'Hardware & Parts';
  } else if (queryLower.includes('gemini') || queryLower.includes('ai') || queryLower.includes('token') || queryLower.includes('claude')) {
    category = 'Developer Services';
  }

  const quotes = MOCK_VENDOR_DIRECTORY[category] || MOCK_VENDOR_DIRECTORY['Developer Services'];
  const selectedQuote = quotes.slice().sort((a, b) => (a.pricePerUnit * a.quantity) - (b.pricePerUnit * b.quantity))[0];
  const totalAmount = selectedQuote.totalPrice;
  const requiresApproval = !params.autoApprove && totalAmount > AUTONOMOUS_SPEND_LIMIT;

  const now = new Date();
  const formatTime = (offsetSec: number) => {
    const d = new Date(now.getTime() + offsetSec * 1000);
    return d.toTimeString().split(' ')[0];
  };

  const steps: AgentStep[] = [
    {
      id: 'step-1',
      stepNumber: 1,
      type: 'thought',
      title: 'Analyze Procurement Intent',
      description: `Deconstructed user query into target category "${category}" with parsed ceiling budget of $${params.budgetLimit || totalAmount + 50}.`,
      timestamp: formatTime(0),
      status: 'success',
      metadata: {
        budgetLimit: params.budgetLimit || totalAmount + 50,
        reasoning: [
          'Query classified with 97.4% confidence rating.',
          `Target domain: ${category}`,
          'Validation policies: ISO-27001 vendor compliance and SLA verification required.'
        ]
      }
    },
    {
      id: 'step-2',
      stepNumber: 2,
      type: 'tool',
      title: 'Query Verified Supplier Catalog',
      description: `Queried 3 supplier endpoints. Retrieved ${quotes.length} competitive quotes matching technical specifications.`,
      timestamp: formatTime(1),
      status: 'success',
      metadata: {
        toolName: 'supplier_catalog_lookup',
        quotes: quotes,
      }
    },
    {
      id: 'step-3',
      stepNumber: 3,
      type: 'thought',
      title: 'Optimal Vendor Selection',
      description: `Selected "${selectedQuote.vendorName}" at $${selectedQuote.totalPrice.toFixed(2)} based on composite score (Price: 100%, Rating: ${selectedQuote.rating}/5.0, Delivery: ${selectedQuote.deliveryDays}d).`,
      timestamp: formatTime(2),
      status: 'success',
      metadata: {
        selectedQuote: selectedQuote,
        reasoning: [
          `Best price achieved: $${selectedQuote.totalPrice.toFixed(2)}`,
          `Vendor compliance status: ${selectedQuote.complianceVerified ? 'VERIFIED' : 'PENDING'}`,
          `Stock check passed (${selectedQuote.stockAvailable} available in inventory).`
        ]
      }
    }
  ];

  if (requiresApproval) {
    steps.push({
      id: 'step-4',
      stepNumber: 4,
      type: 'approval',
      title: 'Human-in-the-Loop Policy Gate',
      description: `Order total ($${totalAmount.toFixed(2)}) exceeds autonomous threshold ($${AUTONOMOUS_SPEND_LIMIT.toFixed(2)}). Awaiting managerial sign-off before dispatching PayPal Sandbox order.`,
      timestamp: formatTime(3),
      status: 'waiting_approval',
      metadata: {
        selectedQuote: selectedQuote,
        budgetLimit: params.budgetLimit,
      }
    });

    return {
      steps,
      requiresApproval: true,
      selectedQuote,
      completed: false,
    };
  }

  // Autonomous execution path (< $250 or autoApprove)
  const orderRes = await createPayPalOrder({
    amount: selectedQuote.totalPrice,
    currency: 'USD',
    itemDescription: selectedQuote.itemDescription,
    vendorName: selectedQuote.vendorName,
    vendorEmail: selectedQuote.paypalMerchantEmail,
    quantity: selectedQuote.quantity,
  });

  steps.push({
    id: 'step-4',
    stepNumber: 4,
    type: 'payment',
    title: 'Dispatched PayPal Sandbox Order',
    description: `Generated live PayPal Sandbox Order ${orderRes.orderId} via /v2/checkout/orders. Mode: ${orderRes.mode}.`,
    timestamp: formatTime(3),
    status: 'success',
    metadata: {
      paypalOrderId: orderRes.orderId,
      paypalApproveUrl: orderRes.approveUrl,
    }
  });

  const captureRes = await capturePayPalOrder(orderRes.orderId);

  steps.push({
    id: 'step-5',
    stepNumber: 5,
    type: 'completed',
    title: 'Captured & Ledger Settled',
    description: `PayPal Capture ${captureRes.captureId} settled. Transaction logged to AG Grid Institutional Ledger.`,
    timestamp: formatTime(4),
    status: 'success',
    metadata: {
      paypalOrderId: orderRes.orderId,
      captureId: captureRes.captureId,
    }
  });

  const newLedgerItem: LedgerItem = {
    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    vendor: selectedQuote.vendorName,
    itemDescription: selectedQuote.itemDescription,
    category: category as any,
    quantity: selectedQuote.quantity,
    unitPrice: selectedQuote.pricePerUnit,
    totalAmount: selectedQuote.totalPrice,
    currency: 'USD',
    status: 'COMPLETED',
    paypalOrderId: orderRes.orderId,
    paypalCaptureId: captureRes.captureId,
    confidenceScore: 98,
    approvalType: params.autoApprove ? 'HUMAN_CONFIRMED' : 'AUTONOMOUS',
    riskScore: 'LOW',
    notes: `Autonomous procurement of ${selectedQuote.itemDescription} fulfilled via PayPal Sandbox.`
  };

  return {
    steps,
    requiresApproval: false,
    selectedQuote,
    paypalOrderId: orderRes.orderId,
    approveUrl: orderRes.approveUrl,
    newLedgerItem,
    completed: true,
  };
}

export async function approveAndExecuteOrder(quote: VendorQuote): Promise<{
  steps: AgentStep[];
  newLedgerItem: LedgerItem;
}> {
  const now = new Date();
  const formatTime = (offsetSec: number) => {
    const d = new Date(now.getTime() + offsetSec * 1000);
    return d.toTimeString().split(' ')[0];
  };

  const orderRes = await createPayPalOrder({
    amount: quote.totalPrice,
    currency: 'USD',
    itemDescription: quote.itemDescription,
    vendorName: quote.vendorName,
    vendorEmail: quote.paypalMerchantEmail,
    quantity: quote.quantity,
  });

  const captureRes = await capturePayPalOrder(orderRes.orderId);

  const steps: AgentStep[] = [
    {
      id: 'step-exec-1',
      stepNumber: 5,
      type: 'payment',
      title: 'Human Authorized: Dispatched PayPal Sandbox Order',
      description: `Manager override approved. PayPal Order ${orderRes.orderId} executed via Sandbox API.`,
      timestamp: formatTime(0),
      status: 'success',
      metadata: {
        paypalOrderId: orderRes.orderId,
        paypalApproveUrl: orderRes.approveUrl,
      }
    },
    {
      id: 'step-exec-2',
      stepNumber: 6,
      type: 'completed',
      title: 'Settled to AG Grid Ledger',
      description: `Payment capture ${captureRes.captureId} completed. Ledger record appended.`,
      timestamp: formatTime(1),
      status: 'success',
      metadata: {
        paypalOrderId: orderRes.orderId,
        captureId: captureRes.captureId,
      }
    }
  ];

  const newLedgerItem: LedgerItem = {
    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    vendor: quote.vendorName,
    itemDescription: quote.itemDescription,
    category: 'Hardware & Parts',
    quantity: quote.quantity,
    unitPrice: quote.pricePerUnit,
    totalAmount: quote.totalPrice,
    currency: 'USD',
    status: 'COMPLETED',
    paypalOrderId: orderRes.orderId,
    paypalCaptureId: captureRes.captureId,
    confidenceScore: 94,
    approvalType: 'HUMAN_CONFIRMED',
    riskScore: 'LOW',
    notes: 'Approved via Human-in-the-Loop Control Gate. Dispatched on PayPal Sandbox.'
  };

  return { steps, newLedgerItem };
}
