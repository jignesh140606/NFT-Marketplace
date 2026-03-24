# Stylus CLI and WASM Target Installation Script
# Run this AFTER Rust is installed successfully

Write-Host "🔧 Installing Stylus CLI and WASM Target..." -ForegroundColor Green

# Verify Rust is installed
$rustVersion = rustc --version 2>$null
if (-not $rustVersion) {
    Write-Host "❌ Rust not found! Please install Rust first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Rust found: $rustVersion" -ForegroundColor Green

# Install Stylus CLI
Write-Host "📦 Installing Stylus CLI..." -ForegroundColor Yellow
cargo install cargo-stylus

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Stylus CLI installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Stylus CLI installed!" -ForegroundColor Green

# Add WASM target
Write-Host "🎯 Adding WASM target..." -ForegroundColor Yellow
rustup target add wasm32-unknown-unknown

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ WASM target installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ WASM target added!" -ForegroundColor Green

# Verify installations
Write-Host "🔍 Verifying installations..." -ForegroundColor Cyan
Write-Host "Rust version:" -ForegroundColor White
rustc --version

Write-Host "Cargo version:" -ForegroundColor White
cargo --version

Write-Host "Stylus CLI:" -ForegroundColor White
cargo stylus --version

Write-Host "WASM target:" -ForegroundColor White
rustup target list --installed | Select-String "wasm32-unknown-unknown"

Write-Host "🎉 All tools installed successfully!" -ForegroundColor Green
Write-Host "Next step: Get Arbitrum Sepolia ETH and deploy the contract!" -ForegroundColor Cyan