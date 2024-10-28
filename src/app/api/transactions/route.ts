import { TransactionWebhookData } from '@/types/types';
import { NextResponse } from 'next/server';

// Store latest transactions in memory (or better, use Redis/DB in production)
let latestTransactions: any = null;

export async function GET() {
  return NextResponse.json(latestTransactions || { erc20Transfers: [] });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Store the latest transactions
    latestTransactions = data;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}
