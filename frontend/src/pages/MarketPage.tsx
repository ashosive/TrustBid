import React, { useEffect, useState } from 'react'
import "./MarketPage.css"
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
  startTime: string;
  blockTimestamp: string;
  title: string; // Added title field
  options: string[]; // Added options field, assuming it's an array of strings
}

interface MarketProps {
  markets: Market[]; // Assuming Market is your interface for market data
  setMarkets: React.Dispatch<React.SetStateAction<Market[]>>;
}

const MarketPage = ({markets, setMarkets}: MarketProps) => {

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
            console.log("date ",new Date(parseInt("1719111365") * 1000))
            subMarkets[i].startTime = String(new Date(parseInt(subMarkets[i].startTime) * 1000));
            subMarkets[i].expirationTime = String(new Date(parseInt(subMarkets[i].expirationTime) * 1000));
          })
        );
        console.log("final markets ", subMarkets);
        setMarkets(subMarkets);
      } catch (err) {
        console.log(err);
        alert("Error");
      }
    };
    fetchMarkets();
  }, []);

  return (
    <div>
      <div>
        {markets.length > 0 ? (
          <div>
            {markets.map((market, i) => (
              <div key={market.id}>
                <Link to={`/market/${i}/${market.id}`}>
                  <MarketCard market={market} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div>Loading.....</div>
        )}
      </div>
    </div>
  )
}

export default MarketPage;
