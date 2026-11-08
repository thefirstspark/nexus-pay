import { NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.orderId) {
      return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
    }
    const result = await capturePayPalOrder(body.orderId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
