#!/bin/bash

# Course Completion NFT - Deployment Script for Arbitrum Sepolia
echo "🚀 Starting Course Completion NFT Deployment to Arbitrum Sepolia..."

# Check if we're in the right directory
if [ ! -f "Cargo.toml" ]; then
    echo "❌ Error: Please run this script from the contracts/course-completion-nft directory"
    exit 1
fi

# Set environment variables
export ARBITRUM_SEPOLIA_RPC="https://sepolia-rollup.arbitrum.io/rpc"
export CHAIN_ID=421614

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: Please set your PRIVATE_KEY environment variable"
    echo "Usage: PRIVATE_KEY=your_private_key_here ./deploy.sh"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "✅ Rust toolchain installed"
echo "✅ Stylus CLI installed"
echo "✅ Private key provided"
echo "✅ Building contract..."

# Build the contract
echo "🔨 Building smart contract..."
cargo stylus build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Deploy the contract
echo "🚀 Deploying to Arbitrum Sepolia..."
echo "Network: Arbitrum Sepolia (Chain ID: 421614)"
echo "RPC: $ARBITRUM_SEPOLIA_RPC"

cargo stylus deploy \
    --private-key=$PRIVATE_KEY \
    --endpoint=$ARBITRUM_SEPOLIA_RPC

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed! Please check the errors above."
    exit 1
fi

echo "🎉 Deployment successful!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the contract address from the output above"
echo "2. Update NEXT_PUBLIC_COURSE_COMPLETION_NFT_ADDRESS in apps/web/.env.local"
echo "3. Initialize the contract by calling the initialize() function"
echo "4. Add yourself as an admin using the web interface"
echo ""
echo "🎯 Ready to create your first course!"