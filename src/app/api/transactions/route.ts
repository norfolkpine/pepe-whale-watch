import { NextResponse } from 'next/server';

let latestTransactions: any = null;

export async function GET() {
  return NextResponse.json(latestTransactions || { erc20Transfers: [] });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
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
