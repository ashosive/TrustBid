import React, { useEffect, useState } from 'react';
import "./MarketPage.css";
import axios from 'axios';
import MarketCard from '../components/MarketCard';
import { Link } from 'react-router-dom';
import Config from "../config";

interface Market {
  eventHash: string;
  expirationTime: string;
  id: string;
  marketAddress: string;
  numberOfOptions: number;
  owner: string;
//   startTime: string;
  blockTimestamp: string;
  title: string; // Added title field
  options: string[]; // Added options field, assuming it's an array of strings
}

interface MarketProps {
  markets: Market[]; // Assuming Market is your interface for market data
  setMarkets: React.Dispatch<React.SetStateAction<Market[]>>;
}

const MarketPage = ({ markets, setMarkets }: MarketProps) => {
    const [filter, setFilter] = useState<string>('All');

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                const result = await axios.get(`${Config.apiBaseUrl}/subgraph/markets`);
                console.log("result ", result.data.result);
                const subMarkets = result.data.result;
                await Promise.all(
                    subMarkets.map(async (market: Market, i: number) => {
                        const decodeHash = await axios.post(`${Config.apiBaseUrl}/event/decode`, {
                            eventHash: market.eventHash
                        });
                        console.log("decode values ", decodeHash.data.result);
                        subMarkets[i].title = decodeHash.data.result[0];
                        subMarkets[i].options = decodeHash.data.result[1];
                        // subMarkets[i].startTime = new Date(parseInt(subMarkets[i].startTime) * 1000).toISOString();
                        subMarkets[i].expirationTime = new Date(parseInt(subMarkets[i].expirationTime) * 1000).toISOString();
                    })
                );
                console.log("final markets ", subMarkets);
                setMarkets(subMarkets);
            } catch (err) {
                console.log(err);
                alert("Error");
            }
        };
        fetchMarkets().then(r => {});
    }, [setMarkets]);

    const filterMarkets = (markets: Market[]) => {
        const now = new Date();
        switch (filter) {
            // case 'Latest':
            //     return markets.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
            case 'Ending Soon':
                return markets.filter(market => new Date(market.expirationTime) > now)
                    .sort((a, b) => new Date(a.expirationTime).getTime() - new Date(b.expirationTime).getTime());
            case 'Ended':
                return markets.filter(market => new Date(market.expirationTime) <= now)
                    .sort((a, b) => new Date(b.expirationTime).getTime() - new Date(a.expirationTime).getTime());
            case 'All':
            default:
                return markets;
        }
    };

    const filteredMarkets = filterMarkets(markets);

    return (
        <div>
            <div className="filter-container">
                <label htmlFor="filter" className="filter-label">Filter: </label>
                <select id="filter" className="filter-select" value={filter}
                        onChange={(e) => setFilter(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Latest">Latest</option>
                    <option value="Ending Soon">Ending Soon</option>
                    <option value="Ended">Ended</option>
                </select>
            </div>
            <div>
                {filteredMarkets.length > 0 ? (
                    <div>
                        {filteredMarkets.map((market, i) => (
                            <div key={market.id}>
                                <Link to={`/market/${i}/${market.id}`}>
                                    <MarketCard market={market}/>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>Loading.....</div>
                )}
            </div>
        </div>
    );
}

export default MarketPage;
