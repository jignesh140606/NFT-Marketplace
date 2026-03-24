/**
 * API Route to Initialize Smart Contract
 * Calls the initialize() function on the deployed contract
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, contractAddress } = await request.json();

    if (!walletAddress || !contractAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address or contract address' },
        { status: 400 }
      );
    }

    // For now, we'll return instructions for manual initialization
    // In a full production setup, you'd want to use a server-side wallet or have the frontend handle this
    return NextResponse.json({
      success: true,
      message: 'Contract information received. Initialize via frontend.',
      data: {
        walletAddress,
        contractAddress,
        instructions: 'Use MetaMask to call initialize() function'
      }
    });

  } catch (error) {
    console.error('Contract initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize contract' },
      { status: 500 }
    );
  }
}