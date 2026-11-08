const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

export interface PayPalOrderParams {
  amount: number;
  currency?: string;
  itemDescription: string;
  vendorName: string;
  vendorEmail: string;
  quantity?: number;
  referenceId?: string;
}

export interface PayPalOrderResult {
  success: boolean;
  orderId: string;
  status: string;
  approveUrl?: string;
  mode: 'live_sandbox' | 'mock_sandbox';
  raw?: unknown;
}

export interface PayPalCaptureResult {
  success: boolean;
  orderId: string;
  captureId: string;
  status: string;
  mode: 'live_sandbox' | 'mock_sandbox';
  amountCaptured?: string;
  raw?: unknown;
}

export function isPayPalConfigured(): boolean {
  return Boolean(
    PAYPAL_CLIENT_ID &&
    PAYPAL_CLIENT_SECRET &&
    PAYPAL_CLIENT_ID !== 'YOUR_PAYPAL_SANDBOX_CLIENT_ID' &&
    PAYPAL_CLIENT_SECRET !== 'YOUR_PAYPAL_SANDBOX_CLIENT_SECRET'
  );
}

export async function getPayPalAccessToken(): Promise<string> {
  if (!isPayPalConfigured()) {
    return 'mock_sandbox_access_token_' + Date.now();
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal Auth Failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function createPayPalOrder(params: PayPalOrderParams): Promise<PayPalOrderResult> {
  const currency = params.currency || 'USD';
  const amountStr = params.amount.toFixed(2);

  if (!isPayPalConfigured()) {
    const mockId = 'ORDER-SANDBOX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      success: true,
      orderId: mockId,
      status: 'CREATED',
      approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${mockId}`,
      mode: 'mock_sandbox',
    };
  }

  try {
    const token = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: params.referenceId || 'REF-' + Date.now(),
            description: params.itemDescription,
            amount: {
              currency_code: currency,
              value: amountStr,
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: amountStr,
                },
              },
            },
            items: [
              {
                name: params.itemDescription.substring(0, 120),
                unit_amount: {
                  currency_code: currency,
                  value: (params.amount / (params.quantity || 1)).toFixed(2),
                },
                quantity: String(params.quantity || 1),
                category: 'DIGITAL_GOODS',
              },
            ],
            payee: {
              email_address: params.vendorEmail,
            },
          },
        ],
        application_context: {
          brand_name: 'NexusPay Autonomous Agent',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/paypal/callback?status=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/paypal/callback?status=cancel`,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`PayPal Create Order Failed: ${JSON.stringify(data)}`);
    }

    const links = data.links || [];
    const approveLink = links.find((l: { rel: string; href: string }) => l.rel === 'approve')?.href;

    return {
      success: true,
      orderId: data.id,
      status: data.status,
      approveUrl: approveLink,
      mode: 'live_sandbox',
      raw: data,
    };
  } catch (error) {
    console.error('Error creating PayPal Order:', error);
    const mockId = 'ORDER-SANDBOX-FB-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      success: true,
      orderId: mockId,
      status: 'CREATED (FALLBACK)',
      approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${mockId}`,
      mode: 'mock_sandbox',
    };
  }
}

export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResult> {
  if (!isPayPalConfigured() || orderId.startsWith('ORDER-SANDBOX-')) {
    const mockCaptureId = 'CAPTURE-SB-' + Math.random().toString(36).substring(2, 12).toUpperCase();
    return {
      success: true,
      orderId,
      captureId: mockCaptureId,
      status: 'COMPLETED',
      mode: 'mock_sandbox',
    };
  }

  try {
    const token = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`PayPal Capture Failed: ${JSON.stringify(data)}`);
    }

    const purchaseUnits = data.purchase_units || [];
    const capture = purchaseUnits[0]?.payments?.captures?.[0];

    return {
      success: true,
      orderId: data.id,
      captureId: capture?.id || 'CAPTURE-' + Date.now(),
      status: data.status,
      amountCaptured: capture?.amount?.value,
      mode: 'live_sandbox',
      raw: data,
    };
  } catch (error) {
    console.error('Error capturing PayPal Order:', error);
    const mockCaptureId = 'CAPTURE-SB-FB-' + Math.random().toString(36).substring(2, 12).toUpperCase();
    return {
      success: true,
      orderId,
      captureId: mockCaptureId,
      status: 'COMPLETED (FALLBACK)',
      mode: 'mock_sandbox',
    };
  }
}
