import React, { useState } from 'react';
import './ButtonTabs.css'; // Import the CSS file

// Define a type for the tab names
type TabName = 'marketDetail' | 'claim' | 'gameDetails';

const ButtonTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabName>('marketDetail');

    // Explicitly type the parameter as TabName
    const handleTabClick = (tab: TabName) => {
        setActiveTab(tab);
    };

    return (
        <div>
            <div className="button-container">
                <button
                    className={`tab-button ${activeTab === 'marketDetail' ? 'active' : ''}`}
                    onClick={() => handleTabClick('marketDetail')}
                >
                    Market Activities
                </button>
                <button
                    className={`tab-button ${activeTab === 'claim' ? 'active' : ''}`}
                    onClick={() => handleTabClick('claim')}
                >
                    Claim
                </button>
                <button
                    className={`tab-button ${activeTab === 'gameDetails' ? 'active' : ''}`}
                    onClick={() => handleTabClick('gameDetails')}
                >
                    Game Details
                </button>
            </div>

            <div className="table-container">
                {activeTab === 'marketDetail' && <MarketDetailTable />}
                {activeTab === 'claim' && <ClaimTable />}
                {activeTab === 'gameDetails' && <GameDetailsTable />}
            </div>
        </div>
    );
};

// Example tables for demonstration purposes
const MarketDetailTable: React.FC = () => (
    <table>
        <thead>
        <tr><th>Market Detail</th></tr>
        </thead>
        <tbody>
        <tr><td>Details here...</td></tr>
        </tbody>
    </table>
);

const ClaimTable: React.FC = () => (
    <table>
        <thead>
        <tr><th>Claim</th></tr>
        </thead>
        <tbody>
        <tr><td>Claim details here...</td></tr>
        </tbody>
    </table>
);

const GameDetailsTable: React.FC = () => (
    <table>
        <thead>
        <tr><th>Game Details</th></tr>
        </thead>
        <tbody>
        <tr><td>Game details here...</td></tr>
        </tbody>
    </table>
);

export default ButtonTabs;
