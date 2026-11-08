# NexusPay: Autonomous Agentic Commerce Control Tower

**PayPal AI Hackathon 2026 Submission**
Targeting:
- **Overall Grand Prize ($12,000)**
- **Best Use of Agentic Commerce ($5,000)**
- **AG Grid Sponsor Prize ($5,000)**

---

## Overview

**NexusPay** is an autonomous agentic commerce platform that acts as a financial command tower for businesses and solopreneurs. It allows an AI agent to autonomously source products, analyze competitive vendor quotes, evaluate corporate purchasing policies, trigger human-in-the-loop managerial approvals when spend thresholds are exceeded, and execute settlement via the **PayPal Sandbox API**.

The entire reasoning tree is visualized in real time on a **React Flow interactive node canvas**, while all transactions, quotes, and audit trails stream into an **AG Grid v36 institutional data ledger**.

---

## Core Features

1. **Autonomous Procurement Engine:** Converts natural-language requests into multi-step agent actions.
2. **Policy-Based Human-in-the-Loop Gate:** Purchases under $250 execute autonomously; larger orders pause for manager authorization directly within the canvas.
3. **PayPal Sandbox REST Integration:** Generates live PayPal Sandbox Orders (`/v2/checkout/orders`) and captures funds upon authorization.
4. **Interactive Agent Graph (`@xyflow/react`):** Dynamic visualization of thoughts, tool queries, quotes, approval gates, and settlement statuses.
5. **Institutional AG Grid Ledger (v36):** High-density dark Quartz themed grid with CSV export, real-time search, status pill renderers, and direct PayPal Sandbox inspection links.

---

## Quickstart

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
GEMINI_API_KEY=your_gemini_api_key
```

*Note: The platform includes high-fidelity mock fallback mode, allowing full evaluation and testing even before Sandbox API keys are provided.*
