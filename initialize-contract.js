const { ethers } = require('ethers');

// Contract ABI - just the initialize function
const ABI = [
  "function initialize() external",
  "function is_admin(address addr) view returns (bool)"
];

async function initializeContract() {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');

  // Get private key from system environment (PowerShell variable)
  const privateKey = process.env.PRIVATE_KEY;
  console.log('Private key found:', privateKey ? 'Yes' : 'No');

  if (!privateKey || privateKey.length < 60) {
    console.error('❌ PRIVATE_KEY environment variable not found or invalid');
    console.log('Please run in PowerShell: $env:PRIVATE_KEY="your_metamask_private_key"');
    return;
  }

  const contractAddress = '0xb6f6d68bc3af61d05776b8b04d974d8a4f123f6f';

  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ABI, wallet);

  console.log('Initializing contract...');
  console.log('Contract address:', contractAddress);
  console.log('Wallet address:', wallet.address);

  try {
    // Check if already initialized
    const isAdmin = await contract.is_admin(wallet.address);

    if (isAdmin) {
      console.log('✅ Contract already initialized! You are the admin.');
      return;
    }

    // Initialize the contract
    const tx = await contract.initialize({
      gasLimit: 100000,
      maxFeePerGas: ethers.parseUnits('1', 'gwei'),
      maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei')
    });

    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');

    await tx.wait();
    console.log('✅ Contract initialized successfully!');

    // Verify
    const isAdminNow = await contract.is_admin(wallet.address);
    console.log('Admin status verified:', isAdminNow);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

initializeContract();