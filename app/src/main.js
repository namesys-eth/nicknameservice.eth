import { createAppKit } from '@reown/appkit'
import { base, mainnet } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createPublicClient, createWalletClient, http, custom, parseEther } from 'viem'
import { getEnsAddress, getEnsName, normalize } from 'viem/ens'

// Contract address and ABI
const CONTRACT_ADDRESS = '0x0000000000282691831b618a23b31042ee07c6c6'
const CONTRACT_ABI = [
  {
    name: 'mint',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: '_nickname', type: 'string' }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    name: 'getNickname',
    type: 'function',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: '_owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_index', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'tokenURI',
    type: 'function',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  },
  {
    name: 'totalSupply',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
]

// project ID from https://cloud.reown.com
const projectId = '9aec7613816460c56ad283ad8e416293'

export const networks = [base]

// Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

// Configure the metadata
const metadata = {
  name: 'Nick Name Service',
  description: 'Soulbound Nick Name Service',
  url: 'https://nicknameservice.eth.limo',
  icons: ['https://nicknameservice.eth.limo/nns.svg']
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  metadata,
  projectId,
  features: {
    analytics: false
  }
})

// Initialize clients
const publicClient = createPublicClient({
  chain: base,
  transport: http()
})

// Initialize mainnet client for ENS
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

/**
 * App initialization
 */
document.addEventListener("DOMContentLoaded", async () => {
  // Handle tab navigation
  setupTabNavigation();
  
  // Setup theme toggle
  setupThemeToggle();
  
  // Check if wallet is already connected
  await checkWalletConnection();

  // Setup event listeners
  document.getElementById("open-connect-modal").addEventListener("click", connectWallet);
  document.getElementById("mint-connect-btn").addEventListener("click", connectWallet);
  document.getElementById("search-btn").addEventListener("click", searchHandler);
  document.getElementById("home-search-btn").addEventListener("click", homeSearchHandler);
  document.getElementById("set-nickname").addEventListener("click", mintNicknameHandler);
  document.getElementById("search-input").addEventListener("input", () => {
    document.getElementById("search-results").style.display = "none";
  });
  
  // Add keypress event listeners for search inputs
  document.getElementById("search-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchHandler();
    }
  });
  
  document.getElementById("home-search-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      homeSearchHandler();
    }
  });
  
  // Setup recipient input event handlers
  setupRecipientInput();
  
  // Setup nickname input handlers
  setupNicknameInput();
  
  // Setup modal event listeners
  setupModalListeners();
});

/**
 * Sets up the tab navigation system
 */
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = e.target.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      
      // Show corresponding content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetTab}-tab`) {
          content.classList.add('active');
        }
      });
      
      // Update page state based on active tab
      updatePageStateForTab(targetTab);
    });
  });
}

/**
 * Updates page state based on the active tab
 */
async function updatePageStateForTab(activeTab) {
  if (activeTab === 'mint') {
    const connectedAccount = await getConnectedAccount();
    const mintForm = document.getElementById('mint-form');
    const mintWalletNotice = document.getElementById('mint-wallet-notice');
    
    if (!mintForm || !mintWalletNotice) return;
    
    if (connectedAccount) {
      mintForm.style.display = 'block';
      mintWalletNotice.style.display = 'none';
    } else {
      mintForm.style.display = 'none';
      mintWalletNotice.style.display = 'block';
    }
  }
}

/**
 * Sets up the theme toggle functionality
 */
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
    themeToggle.textContent = '☀️';
  } else {
    document.documentElement.classList.remove('light-theme');
    themeToggle.textContent = '🌙';
  }
  
  // Toggle theme on click
  themeToggle.addEventListener('click', () => {
    if (document.documentElement.classList.contains('light-theme')) {
      document.documentElement.classList.remove('light-theme');
      themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-theme');
      themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'light');
    }
  });
}

/**
 * Handler for the home page search button
 */
function homeSearchHandler() {
  const input = document.getElementById('home-search-input').value.trim();
  if (input) {
    // Switch to search tab and transfer the input
    document.querySelector('[data-tab="search"]').click();
    document.getElementById('search-input').value = input;
    // Trigger search
    setTimeout(() => {
      document.getElementById('search-btn').click();
    }, 100);
  }
}

/**
 * Fetch current account
 */
async function getConnectedAccount() {
  try {
    // First try with the wallet adapter
    if (wagmiAdapter.connectionControllerClient?.getAccount) {
      const account = await wagmiAdapter.connectionControllerClient.getAccount();
      if (account && account.address) {
        return account.address;
      }
    }
    
    // Fallback: Check if window.ethereum is available and connected
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        return accounts[0];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
}

/**
 * Updates the wallet connection UI elements
 */
async function updateWalletButton() {
  const account = await getConnectedAccount();
  const connectBtn = document.getElementById("open-connect-modal");
  
  if (!connectBtn) return;
  
  if (account) {
    // Truncate the account address for display
    const truncatedAddr = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
    connectBtn.textContent = truncatedAddr;
    connectBtn.classList.add("connected");
    
    // Update the mint tab state if it's visible
    if (document.querySelector('[data-tab="mint"].active')) {
      updatePageStateForTab('mint');
    }
  } else {
    connectBtn.textContent = "Connect Wallet";
    connectBtn.classList.remove("connected");
    
    // Update the mint tab state if it's visible
    if (document.querySelector('[data-tab="mint"].active')) {
      updatePageStateForTab('mint');
    }
  }
}

/**
 * Validates if a nickname is valid
 */
function isValidNickname(nickname) {
  // Check if nickname contains only allowed characters
  if (!/^[a-z0-9-]+$/.test(nickname)) {
    return false;
  }
  
  // Check length
  if (nickname.length < 3 || nickname.length > 32) {
    return false;
  }
  
  return true;
}

/**
 * Fetch nicknames for an address
 */
async function fetchNicknames(address) {
  try {
    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'balanceOf',
      args: [address]
    })

    if (!balance || Number(balance) <= 0) {
      return [];
    }

    const names = [];
    for (let i = 0; i < Number(balance); i++) {
      try {
        const tokenId = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, i]
        });
        
        const nickname = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getNickname',
          args: [tokenId]
        });
        
        // Get token URI from contract
        let tokenURI = '';
        try {
          tokenURI = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'tokenURI',
            args: [tokenId]
          });
          
          // Parse the tokenURI which is in data:application/json format
          if (tokenURI.startsWith('data:application/json,')) {
            const jsonData = tokenURI.substring('data:application/json,'.length);
            const metadata = JSON.parse(jsonData);
            tokenURI = metadata.image;
          }
        } catch (e) {
          console.error('Error fetching tokenURI:', e);
          tokenURI = `https://robohash.org/${nickname}.png`;
        }
        
        names.push({ 
          nickname, 
          tokenURI, 
          tokenId,
          timestamp: Date.now() - (i * 86400000) // Just for display purposes
        });
      } catch (err) {
        console.error(`Error fetching token at index ${i}:`, err);
      }
    }
    return names;
  } catch (error) {
    console.error('Error fetching nicknames:', error);
    return [];
  }
}

/**
 * Resolve ENS to address
 */
async function resolveENS(ensName) {
  try {
    const address = await mainnetClient.getEnsAddress({
      name: ensName
    })
    return address
  } catch (error) {
    console.error('Error resolving ENS:', error)
    return null
  }
}

/**
 * Get ENS name from address
 */
async function getAddressENS(address) {
  try {
    const ensName = await mainnetClient.getEnsName({
      address
    })
    return ensName
  } catch (error) {
    console.error('Error getting ENS name:', error)
    return null
  }
}

/**
 * Resolve address or ENS
 */
async function resolveAddressOrENS(input) {
  try {
    input = input.trim();
    
    // If input is an Ethereum address
    if (input.startsWith('0x') && input.length === 42) {
      const ens = await getAddressENS(input);
      return { address: input, ens };
    }
    
    // If input is an ENS domain
    if (input.endsWith('.eth')) {
      const address = await resolveENS(input);
      if (address) {
        return { address, ens: input };
      }
    }
    
    return { address: null, ens: null };
  } catch (error) {
    console.error('Error resolving address or ENS:', error);
    return { address: null, ens: null };
  }
}

/**
 * Connects to the wallet
 */
async function connectWallet() {
  try {
    await modal.open();
    // After modal is closed, check if we got connected
    await checkWalletConnection();
  } catch (error) {
    console.error('Error connecting wallet:', error);
    messageModal.show('Error', 'Failed to connect wallet: ' + error.message);
  }
}

/**
 * Displays address information and nicknames
 */
async function displayAddressInfo(address, ensName = null, nicknames = null) {
  // Update the results section
  const resultsSection = document.getElementById("search-results");
  if (!resultsSection) {
    console.error("Search results section not found");
    return;
  }
  resultsSection.style.display = "block";
  
  // Ensure search results has the proper structure
  if (!document.getElementById("nicknames-list")) {
    // Create the structure if it doesn't exist
    const addressInfo = document.createElement("div");
    addressInfo.className = "address-info";
    
    const addressDetails = document.createElement("div");
    addressDetails.className = "address-details";
    
    const addressDiv = document.createElement("div");
    addressDiv.className = "address";
    addressDiv.innerHTML = 'Address: <a id="display-address" href="#" target="_blank">-</a>';
    
    const ensDiv = document.createElement("div");
    ensDiv.className = "ens";
    ensDiv.innerHTML = 'ENS: <a id="display-ens" href="#" target="_blank">-</a>';
    
    addressDetails.appendChild(addressDiv);
    addressDetails.appendChild(ensDiv);
    
    const nicknamesListContainer = document.createElement("div");
    nicknamesListContainer.className = "nicknames-list";
    
    const nicknamesTitle = document.createElement("h3");
    nicknamesTitle.textContent = "Nicknames";
    
    const nicknamesList = document.createElement("div");
    nicknamesList.id = "nicknames-list";
    
    nicknamesListContainer.appendChild(nicknamesTitle);
    nicknamesListContainer.appendChild(nicknamesList);
    
    addressInfo.appendChild(addressDetails);
    addressInfo.appendChild(nicknamesListContainer);
    
    // Clear and add the structure
    resultsSection.innerHTML = '';
    resultsSection.appendChild(addressInfo);
  }
  
  // Set address and ENS values with links
  const addressElement = document.getElementById("display-address");
  const ensElement = document.getElementById("display-ens");
  
  if (addressElement) {
    addressElement.textContent = address;
    addressElement.href = `https://etherscan.io/address/${address}`;
  }
  
  if (ensElement) {
    if (ensName) {
      ensElement.textContent = ensName;
      ensElement.href = `https://app.ens.domains/${ensName}`;
    } else {
      ensElement.textContent = "Not Found";
      ensElement.href = "#";
    }
  }
  
  try {
    // If nicknames aren't provided, fetch them
    if (!nicknames) {
      // Show loading state
      const nicknamesListElement = document.getElementById("nicknames-list");
      if (nicknamesListElement) {
        nicknamesListElement.innerHTML = '<div class="loading">Loading nicknames...</div>';
      }
      
      // Fetch nicknames
      nicknames = await fetchNicknames(address);
    }
    
    // Render the nicknames
    renderNicknames(nicknames);
  } catch (error) {
    const nicknamesListElement = document.getElementById("nicknames-list");
    if (nicknamesListElement) {
      nicknamesListElement.innerHTML = `
        <div class="no-nicknames">
          <p>Error loading nicknames: ${error.message}</p>
        </div>
      `;
    }
    console.error("Error displaying address info:", error);
  }
}

/**
 * Renders the nicknames in the UI
 */
function renderNicknames(nicknames) {
  const nicknamesContainer = document.getElementById("nicknames-list");
  
  // Check if container exists
  if (!nicknamesContainer) {
    console.error("Nicknames container not found");
    return;
  }
  
  // If no nicknames, show message
  if (!nicknames || nicknames.length === 0) {
    nicknamesContainer.innerHTML = `
      <div class="no-nicknames">
        <p>No nicknames found for this address</p>
      </div>
    `;
    return;
  }
  
  // Create grid layout
  const nicknamesGrid = document.createElement("div");
  nicknamesGrid.className = "nicknames-grid";
  
  // Add cards for each nickname
  nicknames.forEach(name => {
    const card = document.createElement("div");
    card.className = "nickname-card";
    
    // Create preview div for NFT
    const nftPreview = document.createElement("div");
    nftPreview.className = "nft-preview";
    
    // Create a link to OpenSea for the NFT
    const nftLink = document.createElement("a");
    nftLink.href = `https://opensea.io/assets/base/${CONTRACT_ADDRESS}/${name.tokenId}`;
    nftLink.target = "_blank";
    nftLink.rel = "noopener noreferrer";
    nftLink.className = "nft-link";
    
    // Add image if available (check both imageUrl and tokenURI)
    const imageSource = name.imageUrl || name.tokenURI;
    if (imageSource) {
      const img = document.createElement("img");
      img.src = imageSource;
      img.alt = name.nickname;
      img.onerror = function() {
        this.onerror = null;
        this.src = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%235284ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14" fill="white">${name.nickname}</text></svg>`;
      };
      nftLink.appendChild(img);
    } else {
      // Fallback to nickname as text
      nftLink.innerHTML = `<div class="nft-text">${name.nickname}</div>`;
    }
    
    nftPreview.appendChild(nftLink);
    
    // Create info div
    const nicknameInfo = document.createElement("div");
    nicknameInfo.className = "nickname-info";
    
    // Add nickname
    const nicknameEl = document.createElement("div");
    nicknameEl.className = "nickname";
    nicknameEl.textContent = name.nickname;
    
    // Add timestamp if available
    if (name.timestamp) {
      const timeEl = document.createElement("div");
      timeEl.className = "time";
      
      // Convert timestamp to readable date
      const date = new Date(name.timestamp);
      timeEl.textContent = date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      nicknameInfo.appendChild(timeEl);
    }
    
    // Add token ID in small text
    const tokenIdEl = document.createElement("div");
    tokenIdEl.className = "token-id";
    tokenIdEl.textContent = `#${name.tokenId}`;
    nicknameInfo.appendChild(tokenIdEl);
    
    // Assemble card
    nicknameInfo.appendChild(nicknameEl);
    card.appendChild(nftPreview);
    card.appendChild(nicknameInfo);
    
    // Add to grid
    nicknamesGrid.appendChild(card);
  });
  
  // Clear and add to container
  nicknamesContainer.innerHTML = "";
  nicknamesContainer.appendChild(nicknamesGrid);
}

/**
 * Check and switch to Base chain if needed
 */
async function ensureBaseChain() {
  try {
    // Get the current chain
    const account = await getConnectedAccount();
    if (!account) {
      throw new Error('Please connect your wallet first');
    }
    
    // Check if we're on Base
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (parseInt(chainId, 16) !== base.id) {
      // Try to switch to Base
      try {
        if (window.ethereum) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${base.id.toString(16)}` }],
          });
        } else {
          throw new Error('No provider available to switch chains');
        }
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${base.id.toString(16)}`,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          });
        } else {
          throw new Error('Failed to switch to Base network: ' + switchError.message);
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring Base chain:', error);
    throw new Error('Please switch to Base network to use this service');
  }
}

/**
 * Handles the search button click
 */
async function searchHandler() {
  const input = document.getElementById("search-input")?.value?.trim();
  if (!input) return;

  try {
    const resultsSection = document.getElementById("search-results");
    if (!resultsSection) {
      console.error("Search results section not found");
      return;
    }
    
    resultsSection.innerHTML = '<div class="loading">Loading results...</div>';
    resultsSection.style.display = "block";

    const { address, ens } = await resolveAddressOrENS(input);
    
    if (address) {
      // Show results section
      await displayAddressInfo(address, ens);
    } else {
      resultsSection.innerHTML = `
        <div class="no-nicknames">
          <p>No valid address or ENS found for "${input}"</p>
        </div>
      `;
    }
  } catch (error) {
    const resultsSection = document.getElementById("search-results");
    if (resultsSection) {
      resultsSection.innerHTML = `
        <div class="no-nicknames">
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
    console.error(error);
  }
}

/**
 * Mints a nickname for an address
 */
async function mintNickname(recipient, nickname) {
  try {
    // Ensure we're on the right chain
    await ensureBaseChain();
    
    // Get the connected account
    const userAccount = await getConnectedAccount();
    if (!userAccount) {
      throw new Error('Please connect your wallet first');
    }
    
    // Create a wallet client
    const walletClient = createWalletClient({
      account: userAccount,
      chain: base,
      transport: window.ethereum ? custom(window.ethereum) : http()
    });
    
    // Simulate the contract call
    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'mint',
      args: [recipient, nickname],
      account: userAccount
    });
    
    // Execute the contract call
    const hash = await walletClient.writeContract(request);
    
    // Return the transaction hash
    return {
      hash,
      wait: async () => {
        return await publicClient.waitForTransactionReceipt({ hash });
      }
    };
  } catch (error) {
    console.error('Error minting nickname:', error);
    throw error;
  }
}

/**
 * Handles the mint nickname button click
 */
async function mintNicknameHandler() {
  const nicknameInput = document.getElementById("nickname-input");
  const recipientInput = document.getElementById("recipient-input");
  const mintStatus = document.getElementById("mint-status");
  
  // Clear previous status
  mintStatus.className = "mint-status";
  mintStatus.textContent = "";
  
  const nickname = nicknameInput.value.trim();
  const recipient = recipientInput.value.trim();
  
  // Validate inputs
  if (!recipient) {
    mintStatus.textContent = "Please enter a recipient address or ENS";
    mintStatus.className = "mint-status error";
    return;
  }
  
  if (!nickname) {
    mintStatus.textContent = "Please enter a nickname";
    mintStatus.className = "mint-status error";
    return;
  }
  
  // Check if nickname is valid
  if (!isValidNickname(formatNickname(nickname))) {
    mintStatus.textContent = "Nickname must be 3-32 characters, using only a-z, 0-9, and hyphens";
    mintStatus.className = "mint-status error";
    return;
  }
  
  try {
    // Show loading state
    mintStatus.textContent = "Resolving recipient address...";
    mintStatus.className = "mint-status loading";
    
    // Get connected wallet
    const connectedAccount = await getConnectedAccount();
    if (!connectedAccount) {
      mintStatus.textContent = "Please connect your wallet first";
      mintStatus.className = "mint-status error";
      return;
    }
    
    // Resolve recipient
    const { address: recipientAddress } = await resolveAddressOrENS(recipient);
    if (!recipientAddress) {
      mintStatus.textContent = "Invalid recipient address or ENS";
      mintStatus.className = "mint-status error";
      return;
    }
    
    // Check if minting to self
    if (recipientAddress.toLowerCase() === connectedAccount.toLowerCase()) {
      mintStatus.textContent = "You cannot mint a nickname for your own address";
      mintStatus.className = "mint-status error";
      return;
    }
    
    // Process the nickname (lowercase and replace spaces with hyphens)
    const processedNickname = formatNickname(nickname);
    
    // Update status
    mintStatus.textContent = "Preparing transaction...";
    
    // Call contract method to mint the nickname
    const tx = await mintNickname(recipientAddress, processedNickname);
    
    // Update status
    mintStatus.textContent = "Transaction submitted, waiting for confirmation...";
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Clear form fields
    nicknameInput.value = "";
    recipientInput.value = "";
    
    // Show success
    mintStatus.textContent = "Nickname minted successfully!";
    mintStatus.className = "mint-status success";
    
    // Update nickname preview
    updateNicknamePreview("");
    
  } catch (error) {
    mintStatus.textContent = `Error: ${error.message.substring(0, 100)}`;
    mintStatus.className = "mint-status error";
    console.error(error);
  }
}

/**
 * Checks the wallet connection status and updates UI accordingly
 */
async function checkWalletConnection() {
  try {
    const account = await getConnectedAccount();
    await updateWalletButton();
    
    // Setup wallet event listeners if not already set
    setupWalletListeners();
  } catch (error) {
    console.error("Error checking wallet connection:", error);
  }
}

/**
 * Sets up wallet event listeners
 */
function setupWalletListeners() {
  if (window.ethereum) {
    // Remove any existing listeners
    window.ethereum?.removeAllListeners?.('accountsChanged');
    window.ethereum?.removeAllListeners?.('chainChanged');
    
    // Add new listeners
    window.ethereum.on('accountsChanged', (accounts) => {
      updateWalletButton();
      // Update mint page state if it's the active tab
      if (document.querySelector('[data-tab="mint"].active')) {
        updatePageStateForTab('mint');
      }
    });
    
    window.ethereum.on('chainChanged', () => {
      updateWalletButton();
    });
  }
}

/**
 * Sets up the recipient input event handlers
 */
function setupRecipientInput() {
  const recipientInput = document.getElementById("recipient-input");
  const mintStatus = document.getElementById("mint-status");
  
  recipientInput.addEventListener("input", async () => {
    const input = recipientInput.value.trim();
    
    // Clear any previous error states
    mintStatus.className = "mint-status";
    mintStatus.textContent = "";
    
    if (input.length > 3) {
      if (input.endsWith('.eth') || input.startsWith('0x')) {
        try {
          // Only show loading for ENS resolution
          if (input.endsWith('.eth')) {
            mintStatus.textContent = "Resolving ENS...";
            mintStatus.className = "mint-status loading";
          }
          
          const { address, ens } = await resolveAddressOrENS(input);
          
          // Clear loading state
          mintStatus.className = "mint-status";
          mintStatus.textContent = "";
          
          if (address) {
            // Check if trying to mint to own address
            const connectedAccount = await getConnectedAccount();
            if (connectedAccount && address.toLowerCase() === connectedAccount.toLowerCase()) {
              mintStatus.textContent = "You cannot mint a nickname for your own address";
              mintStatus.className = "mint-status error";
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  });
}

/**
 * Sets up the nickname input event handlers
 */
function setupNicknameInput() {
  const nicknameInput = document.getElementById("nickname-input");
  
  nicknameInput.addEventListener("input", () => {
    const input = nicknameInput.value.trim();
    updateNicknamePreview(input);
  });
}

/**
 * Updates the nickname preview
 */
function updateNicknamePreview(input) {
  const previewElement = document.getElementById("nickname-preview");
  
  if (!input) {
    previewElement.textContent = "nickname-preview";
    previewElement.classList.remove("valid", "invalid");
    return;
  }
  
  const processedNickname = formatNickname(input);
  previewElement.textContent = processedNickname;
  
  // Add validation visual cues
  if (isValidNickname(processedNickname)) {
    previewElement.classList.remove("invalid");
    previewElement.classList.add("valid");
  } else {
    previewElement.classList.remove("valid");
    previewElement.classList.add("invalid");
  }
}

/**
 * Formats a nickname: lowercase, spaces to hyphens
 */
function formatNickname(nickname) {
  return nickname.toLowerCase().replace(/\s+/g, '-');
}

// Modal functionality
const messageModal = {
  element: document.getElementById('modal'),
  title: document.getElementById('modal-title'),
  message: document.getElementById('modal-message'),
  confirmBtn: document.getElementById('modal-confirm'),
  closeBtn: document.querySelector('.modal-close'),
  
  show(title, message, onConfirm = null) {
    this.title.textContent = title;
    this.message.textContent = message;
    this.element.style.display = 'block';
    
    if (onConfirm) {
      this.confirmBtn.style.display = 'block';
      this.confirmBtn.onclick = () => {
        this.hide();
        onConfirm();
      };
    } else {
      this.confirmBtn.style.display = 'none';
    }
  },
  
  hide() {
    this.element.style.display = 'none';
  }
};

/**
 * Sets up modal event listeners
 */
function setupModalListeners() {
  messageModal.closeBtn.addEventListener('click', () => messageModal.hide());
  messageModal.confirmBtn.addEventListener('click', () => messageModal.hide());
  window.addEventListener('click', (e) => {
    if (e.target === messageModal.element) {
      messageModal.hide();
    }
  });
}
