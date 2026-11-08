import { NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createPayPalOrder({
      amount: Number(body.amount),
      currency: body.currency || 'USD',
      itemDescription: body.itemDescription || 'Autonomous Agent Procurement',
      vendorName: body.vendorName || 'Sandbox Vendor',
      vendorEmail: body.vendorEmail || 'vendor@sandbox.paypal.com',
      quantity: Number(body.quantity) || 1,
      referenceId: body.referenceId,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
