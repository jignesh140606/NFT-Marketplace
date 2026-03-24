// Run this in browser console (F12) after connecting wallet to http://localhost:3000
// Make sure you're on Arbitrum Sepolia testnet

const contractAddress = '0xb6f6d68bc3af61d05776b8b04d974d8a4f123f6f';
const ABI = [
  "function initialize() external",
  "function is_admin(address addr) view returns (bool)",
  "function total_supply() view returns (uint256)"
];

async function initializeContract() {
  try {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask not found!');
      return;
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, ABI, signer);

    console.log('Checking if contract is already initialized...');
    const walletAddress = await signer.getAddress();

    try {
      const isAdmin = await contract.is_admin(walletAddress);

      if (isAdmin) {
        console.log('✅ Contract already initialized! You are admin.');
        alert('Contract already initialized!');
        return;
      }
    } catch (e) {
      console.log('Contract not initialized yet, proceeding...');
    }

    console.log('Initializing contract...');
    const tx = await contract.initialize();

    console.log('Transaction sent:', tx.hash);
    alert('Initializing contract... Please wait for confirmation.');

    await tx.wait();
    console.log('✅ Contract initialized successfully!');
    alert('Contract initialized successfully! Refresh the page.');

  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
}

// Run the initialization
initializeContract();