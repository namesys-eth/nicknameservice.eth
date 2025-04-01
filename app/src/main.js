import { createAppKit } from '@reown/appkit'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 1. Get a project ID at https://cloud.reown.com
const projectId = '9aec7613816460c56ad293'

export const networks = [mainnet, arbitrum]

// 2. Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

// 3. Configure the metadata
const metadata = {
  name: 'NNS',
  description: 'Nick Name Service',
  url: 'https://reown.com/appkit',
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 4. Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum],
  metadata,
  projectId,
  features: {
    analytics: true
  }
})

// Placeholder data
const placeholderNames = [
  { 
    address: '0x1234...5678',
    ens: 'vitalik.eth',
    names: [
      { nickname: 'CryptoKing', amount: 1.5, timestamp: Date.now() - 86400000 },
      { nickname: 'Web3Dev', amount: 0.8, timestamp: Date.now() - 172800000 }
    ]
  },
  { 
    address: '0x8765...4321',
    ens: 'satoshi.eth',
    names: [
      { nickname: 'DeFiMaster', amount: 2.1, timestamp: Date.now() - 259200000 }
    ]
  }
]

// Theme management
const theme = {
  isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  toggle() {
    this.isDark = !this.isDark
    document.documentElement.classList.toggle('dark-theme')
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
  }
}

// Initialize theme
if (localStorage.getItem('theme') === 'dark' || theme.isDark) {
  document.documentElement.classList.add('dark-theme')
  theme.isDark = true
}

// 5. Setup UI
document.querySelector('#app').innerHTML = `
  <div class="container">
    <header>
      <div class="header-content">
        <h1>Nick Name Service</h1>
        <button id="theme-toggle" class="btn icon-btn">
          ${theme.isDark ? '☀️' : '🌙'}
        </button>
      </div>
      <p class="tagline">Give memorable nicknames to Ethereum addresses. 99% refundable after 30 days!</p>
    </header>

    <div class="wallet-section">
      <button id="open-connect-modal" class="btn primary">Connect Wallet</button>
      <button id="open-network-modal" class="btn secondary">Switch Network</button>
    </div>

    <div class="search-section">
      <input type="text" id="search-input" placeholder="Search by address, ENS domain (.eth), or nickname" />
      <button id="search-btn" class="btn primary">Search</button>
    </div>

    <div class="main-content">
      <div id="search-results" class="search-results">
        <div class="address-info">
          <div class="address-details">
            <div class="address">Address: <span id="display-address">-</span></div>
            <div class="ens">ENS: <span id="display-ens">-</span></div>
          </div>
          <div class="nicknames-list">
            <h3>Nicknames</h3>
            <div id="nicknames-list"></div>
          </div>
        </div>
      </div>

      <div id="add-nickname-section" class="add-nickname-section" style="display: none;">
        <h2>Add New Nickname</h2>
        <div class="input-group">
          <input type="text" id="nickname-input" placeholder="Enter nickname" />
          <input type="number" id="amount-input" placeholder="Amount (ETH)" step="0.01" />
        </div>
        <button id="set-nickname" class="btn primary">Set Nickname</button>
      </div>
    </div>
  </div>
`

// Function to render nicknames
function renderNicknames(names) {
  const nicknamesList = document.getElementById('nicknames-list')
  if (!names || names.length === 0) {
    nicknamesList.innerHTML = '<div class="no-nicknames">No nicknames found</div>'
    return
  }
  
  nicknamesList.innerHTML = names.map(name => `
    <div class="nickname-item">
      <span class="nickname">${name.nickname}</span>
      <span class="amount">${name.amount} ETH</span>
      <span class="time">${Math.floor((Date.now() - name.timestamp) / 86400000)}d ago</span>
    </div>
  `).join('')
}

// Function to display address info
function displayAddressInfo(address, ens, names) {
  document.getElementById('display-address').textContent = address
  document.getElementById('display-ens').textContent = ens || '-'
  document.getElementById('search-results').style.display = 'block'
  document.getElementById('add-nickname-section').style.display = 'block'
  renderNicknames(names)
}

// 6. Add event listeners
document.getElementById('open-connect-modal').addEventListener('click', () => modal.open())
document.getElementById('open-network-modal').addEventListener('click', () => modal.open({ view: 'Networks' }))
document.getElementById('theme-toggle').addEventListener('click', () => {
  theme.toggle()
  document.getElementById('theme-toggle').textContent = theme.isDark ? '☀️' : '🌙'
})

document.getElementById('search-btn').addEventListener('click', () => {
  const searchTerm = document.getElementById('search-input').value.toLowerCase()
  
  // Check if it's an ENS domain
  if (searchTerm.endsWith('.eth')) {
    const ens = searchTerm
    const found = placeholderNames.find(item => item.ens === ens)
    if (found) {
      displayAddressInfo(found.address, found.ens, found.names)
    } else {
      displayAddressInfo('Not found', ens, [])
    }
    return
  }

  // Check if it's an address (simplified check)
  if (searchTerm.startsWith('0x')) {
    const found = placeholderNames.find(item => item.address.toLowerCase().includes(searchTerm))
    if (found) {
      displayAddressInfo(found.address, found.ens, found.names)
    } else {
      displayAddressInfo(searchTerm, null, [])
    }
    return
  }

  // Search by nickname
  const found = placeholderNames.find(item => 
    item.names.some(name => name.nickname.toLowerCase().includes(searchTerm))
  )
  if (found) {
    displayAddressInfo(found.address, found.ens, found.names)
  } else {
    displayAddressInfo('Not found', null, [])
  }
})

// 7. Add styles
const style = document.createElement('style')
style.textContent = `
  :root {
    --bg-color: #ffffff;
    --text-color: #333333;
    --card-bg: #ffffff;
    --border-color: #eeeeee;
    --input-bg: #ffffff;
    --input-border: #dddddd;
    --secondary-bg: #f8f8f8;
    --secondary-text: #666666;
    --accent-color: #646cff;
    --accent-hover: #535bf2;
    --shadow-color: rgba(0,0,0,0.05);
  }

  .dark-theme {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --card-bg: #2d2d2d;
    --border-color: #404040;
    --input-bg: #2d2d2d;
    --input-border: #404040;
    --secondary-bg: #363636;
    --secondary-text: #cccccc;
    --accent-color: #646cff;
    --accent-hover: #535bf2;
    --shadow-color: rgba(0,0,0,0.2);
  }

  body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .header-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  .tagline {
    color: var(--secondary-text);
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }

  .wallet-section {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 2rem 0;
  }

  .search-section {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
  }

  .search-section input {
    flex: 1;
  }

  .btn {
    padding: 0.6em 1.2em;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn.primary {
    background: var(--accent-color);
    color: white;
  }

  .btn.secondary {
    background: var(--secondary-bg);
    color: var(--text-color);
  }

  .btn.icon-btn {
    padding: 0.5em;
    font-size: 1.2em;
    background: transparent;
    color: var(--text-color);
  }

  .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px var(--shadow-color);
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1rem 0;
  }

  input {
    padding: 0.8em;
    border-radius: 8px;
    border: 1px solid var(--input-border);
    font-size: 1rem;
    background: var(--input-bg);
    color: var(--text-color);
  }

  input:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(100,108,255,0.1);
  }

  .search-results {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 8px var(--shadow-color);
  }

  .address-info {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .address-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-family: monospace;
  }

  .address, .ens {
    color: var(--secondary-text);
  }

  .nicknames-list h3 {
    margin-bottom: 1rem;
    color: var(--text-color);
  }

  .nickname-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem;
    background: var(--secondary-bg);
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }

  .nickname {
    font-weight: 500;
  }

  .amount {
    color: var(--accent-color);
    font-weight: 500;
  }

  .time {
    color: var(--secondary-text);
    font-size: 0.9rem;
  }

  .add-nickname-section {
    background: var(--secondary-bg);
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .no-nicknames {
    text-align: center;
    color: var(--secondary-text);
    padding: 2rem;
  }

  h2 {
    margin-bottom: 1rem;
    color: var(--text-color);
  }
`
document.head.appendChild(style)
