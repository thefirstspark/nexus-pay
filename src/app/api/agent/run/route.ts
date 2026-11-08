import { NextResponse } from 'next/server';
import { runAgentCycle, approveAndExecuteOrder } from '@/lib/agentEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'approve') {
      const result = await approveAndExecuteOrder(body.quote);
      return NextResponse.json(result);
    }

    const result = await runAgentCycle({
      query: body.query || 'Procure cloud resources',
      category: body.category,
      budgetLimit: body.budgetLimit ? Number(body.budgetLimit) : undefined,
      autoApprove: Boolean(body.autoApprove),
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
