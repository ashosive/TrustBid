import React, { useState } from 'react';
import './App.css';
import MarketPage from './pages/MarketPage';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import MarketInfo from './pages/MarketInfo';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';

interface Market {
  eventHash: string;
  expirationTime: string;
  id: string;
  marketAddress: string;
  numberOfOptions: number;
  owner: string;
  // startTime: string;
  blockTimestamp: string;
  title: string; // Added title field
  options: string[]; // Added options field, assuming it's an array of strings
}

function App() {
  const [connectedAccount, setConnectedAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  const [markets, setMarkets] = useState<Market[]>([]);

  return (
    <div>
      <Router>
      <Navbar connectedAccount={connectedAccount} setConnectedAccount={setConnectedAccount} setAccountBalance={setAccountBalance} accountBalance={accountBalance} />
        <Routes>
          <Route path="/" element={<MarketPage markets={markets} setMarkets={setMarkets}/>} />
          <Route
            path="/market/:i/:id"
            element={<MarketInfoComponentWrapper markets={markets} account={connectedAccount} />}
          />
          <Route path='/dashboard' element={<Dashboard user={connectedAccount}/>} />
          <Route path='/admin' element={<AdminPage user={connectedAccount}/>} />
        </Routes>
      </Router>
    </div>
  );
}

// Component wrapper to pass props to MarketInfo component
const MarketInfoComponentWrapper: React.FC<{ markets: Market[], account: string }> = ({ markets, account }) => {
  // Extracting route parameters
  const { i, id } = useParams();

  // Find the market based on 'i' index, handle case where 'i' is undefined
  const market = i !== undefined ? markets[parseInt(i)] : undefined;

  return market ? <MarketInfo blockTimestamp={market.blockTimestamp} eventHash={market.eventHash} id={market.id} expirationTime={market.expirationTime} marketAddress={market.marketAddress}
  numberOfOptions={market.numberOfOptions}
  owner={market.owner}
  title={market.title}
  options={market.options}
  from={account}
  /> : null
};

export default App;