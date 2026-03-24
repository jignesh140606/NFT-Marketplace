# If you see "bad interpreter" or CRLF errors on Windows, run first: dos2unix scripts/*.sh
# Or: pnpm fix-scripts

#!/bin/bash
# Audited Contract Arbitrum Sepolia Deployment Script
# This script deploys your security-analyzed Stylus contract to Arbitrum Sepolia

# Load .env if present (ignore comments)
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Fail on error, undefined var, or pipefail
set -euo pipefail

# Arbitrum Sepolia RPC URL
RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"

# Check for PRIVATE_KEY environment variable
if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "Error: PRIVATE_KEY environment variable is not set."
  echo "Please set your private key: export PRIVATE_KEY=your_private_key_here"
  exit 1
fi

# Check for required tools
for cmd in cast cargo rustup curl; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "Error: $cmd is not installed."
    exit 1
  fi
done

# Ensure the wasm target is installed for the active toolchain
if ! rustup target list --installed | grep -q "^wasm32-unknown-unknown$"; then
  echo "Rust target wasm32-unknown-unknown not found. Adding target using rustup..."
  if ! rustup target add wasm32-unknown-unknown; then
    echo "Error: Failed to add wasm32-unknown-unknown target via rustup."
    echo "If you're using a custom toolchain, ensure rustup is configured correctly."
    exit 1
  fi
  echo "wasm32-unknown-unknown target installed."
else
  echo "wasm32-unknown-unknown target already installed."
fi

# (Optional) check that `cargo stylus` can be invoked
if ! cargo stylus --help &> /dev/null; then
  echo "Warning: 'cargo stylus' didn't respond to --help. It may still work when run as a subcommand; continuing..."
fi

# Check if Radar analysis was run
if [ ! -f "output.json" ]; then
    echo "⚠️  Warning: No Radar analysis output found (output.json)"
    echo "It's recommended to run security analysis before deployment:"
    echo "  pnpm security:analyze"
    echo ""
    read -p "Continue with deployment anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
else
    echo "✅ Found Radar analysis output (output.json)"
    # Check for high severity issues
    if grep -q '"severity": "High"' output.json; then
        echo "⚠️  WARNING: High severity issues found in security analysis!"
        echo "Please review output.json before deploying to production."
        echo ""
        read -p "Continue with deployment anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled. Fix security issues first."
            exit 0
        fi
    fi
fi

# Check if we can connect to Arbitrum Sepolia
echo "Checking connection to Arbitrum Sepolia..."
if ! curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' \
  "${RPC_URL}" > /dev/null; then
    echo "Error: Cannot connect to Arbitrum Sepolia RPC"
    exit 1
fi
echo "Connected to Arbitrum Sepolia!"

echo "Deploying the audited Stylus contract using cargo stylus..."
deploy_output=$(cargo stylus deploy -e "${RPC_URL}" --private-key "${PRIVATE_KEY}" --no-verify 2>&1) || true

# If cargo stylus failed, exit with helpful output
if [[ $? -ne 0 ]]; then
    echo "Error: Contract deployment failed"
    echo "Deploy output: $deploy_output"
    exit 1
fi

# Extract deployment transaction hash using more precise pattern
deployment_tx=$(echo "$deploy_output" | grep -i "transaction\|tx" | grep -oE '0x[a-fA-F0-9]{64}' | head -1)

# Extract contract address using more precise pattern
contract_address=$(echo "$deploy_output" | grep -i "contract\|deployed" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)

# If the above patterns don't work, try alternative patterns for cargo stylus output
if [[ -z "$deployment_tx" ]]; then
    deployment_tx=$(echo "$deploy_output" | grep -oE '0x[a-fA-F0-9]{64}' | head -1)
fi

if [[ -z "$contract_address" ]]; then
    contract_address=$(echo "$deploy_output" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)
fi

# Verify extraction was successful
if [[ -z "$deployment_tx" ]]; then
    echo "Error: Could not extract deployment transaction hash from output"
    echo "Deploy output: $deploy_output"
    exit 1
fi

echo "🔒 Security-analyzed contract deployed successfully!"
echo "Transaction hash: $deployment_tx"

if [[ ! -z "$contract_address" ]]; then
    echo "Contract address: $contract_address"
fi

echo "Deployment completed successfully on Arbitrum Sepolia!"
