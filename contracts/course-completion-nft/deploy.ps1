# Course Completion NFT - Deployment Script for Arbitrum Sepolia (Windows)
Write-Host "🚀 Starting Course Completion NFT Deployment to Arbitrum Sepolia..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "Cargo.toml")) {
    Write-Host "❌ Error: Please run this script from the contracts/course-completion-nft directory" -ForegroundColor Red
    exit 1
}

# Set environment variables
$env:ARBITRUM_SEPOLIA_RPC = "https://sepolia-rollup.arbitrum.io/rpc"
$env:CHAIN_ID = "421614"

# Check if private key is set
if (-not $env:PRIVATE_KEY) {
    Write-Host "❌ Error: Please set your PRIVATE_KEY environment variable" -ForegroundColor Red
    Write-Host "Usage: `$env:PRIVATE_KEY=`"your_private_key_here`"; .\deploy.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Pre-deployment checklist:" -ForegroundColor Cyan
Write-Host "✅ Rust toolchain installed" -ForegroundColor Green
Write-Host "✅ Stylus CLI installed" -ForegroundColor Green
Write-Host "✅ Private key provided" -ForegroundColor Green
Write-Host "✅ Building contract..." -ForegroundColor Green

# Build the contract
Write-Host "🔨 Building smart contract..." -ForegroundColor Yellow
& cargo stylus build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Deploy the contract
Write-Host "🚀 Deploying to Arbitrum Sepolia..." -ForegroundColor Blue
Write-Host "Network: Arbitrum Sepolia (Chain ID: 421614)" -ForegroundColor Cyan
Write-Host "RPC: $env:ARBITRUM_SEPOLIA_RPC" -ForegroundColor Cyan

& cargo stylus deploy --private-key=$env:PRIVATE_KEY --endpoint=$env:ARBITRUM_SEPOLIA_RPC

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy the contract address from the output above"
Write-Host "2. Update NEXT_PUBLIC_COURSE_COMPLETION_NFT_ADDRESS in apps/web/.env.local"
Write-Host "3. Initialize the contract by calling the initialize() function"
Write-Host "4. Add yourself as an admin using the web interface"
Write-Host ""
Write-Host "🎯 Ready to create your first course!" -ForegroundColor Green