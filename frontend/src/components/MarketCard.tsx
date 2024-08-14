import React, { useEffect, useState } from 'react';
import './MarketCard.css';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import axios from 'axios';
import Config from "../config";

interface MarketCardProps {
  market: {
    eventHash: string;
    expirationTime: string;
    id: string;
    marketAddress: string;
    numberOfOptions: number;
    owner: string;
    // startTime: string;
    blockTimestamp: string;
    title: string;
    options: string[];
    teamDetails: string[] | null
  };
}

interface MarketInfo {
  awayTeam: string, homeTeam: string, gameInfo: string
}

interface TotalOptions {
  totalBidAmount: number;
  options: number[];
  optionRatios: number[];
}

interface MarketTotalBetsInfoResponse {
  totalBidAmount: number;
  options: number[];
}

// Define the type for the result including optionRatios
interface MarketTotalBetsInfoResult extends MarketTotalBetsInfoResponse {
  optionRatios: number[];
}

interface TeamScores {
  [symbol: string]: number;
}

const MarketCard = ({ market }: MarketCardProps) => {
  const [matchInfo, setMatchInfo] = useState<MarketInfo | undefined >(undefined);
  const [totalBidInfo, setTotalBidInfo] = useState<TotalOptions>({
    totalBidAmount: 0,
    options: [],
    optionRatios: []
});
const [teamScores, setTeamScores] = useState<TeamScores>({});
  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  useEffect(() => {
    const getMatchInfo = async () => {
      try {
        const result = await axios.get<{result: {awayTeam: string, homeTeam: string, gameInfo: string}}>(`${Config.apiBaseUrl}/game/info?date=${market.expirationTime.split('T')[0]}&title=${market.options[0] +' vs '+market.options[1]}`);
        console.log("match info ", result.data.result);
        setMatchInfo(result.data.result);
        const scores = result.data.result.gameInfo.split(',').map(item => item.trim());

        const scoresObj: TeamScores = {};

        scores.forEach(score => {
          const [teamSymbol, teamScore] = score.split(' ');
          if (teamSymbol && teamScore) {
            scoresObj[teamSymbol] = parseInt(teamScore, 10);
          }
        });

        setTeamScores(scoresObj);

      } catch(err) {
        console.log("error while getting match info ",err);
      }
    }
    if(market.options[0] != 'Yes'){
      getMatchInfo()
    }
  },[]);

  useEffect(() => {
    const totalBetsInfo = async () => {
        try {
            const response = await axios.post<{ result: MarketTotalBetsInfoResult }>(`${Config.apiBaseUrl}/market/totalBetsInfo`, {
                market: market.marketAddress,
            });
            console.log("Market Total Bet ", response.data.result);
            const result = response.data.result;
            result.optionRatios = result.options.map((optionAmount, index) => {
              const ratio = result.totalBidAmount > 0 ? optionAmount / result.totalBidAmount : 0;
              console.log("ratio",optionAmount,result.totalBidAmount,ratio)
              return ratio;
            });
            setTotalBidInfo(result);
            console.log("State Updated: ", response.data.result); // Add this line
        } catch (err) {
            console.log("Error fetching total bet info", err);
        }
    };
    totalBetsInfo();
  },[])

  return (
    <Card className="market-card">
      <CardActionArea>
        <CardContent>
          <Box className="market-team-and-score-details">
            <Box className="team1">
            `  <img 
                src={market?.teamDetails?.[0][3] || 'https://www.mlbstatic.com/team-logos/team-cap-on-light/141.svg'} 
                alt="Team Logo" 
              />
              {market.options[0]}
            </Box>
            <Box className="teams-scores">{matchInfo ? new Date(market.expirationTime) > new Date() ? "0.0" : "" : ""}</Box>
            <Box className="team2">
              <img 
                  src={market?.teamDetails?.[1][3] || 'https://www.mlbstatic.com/team-logos/team-cap-on-light/141.svg'} 
                  alt="Team Logo" 
                />
                {market.options[1]}
            </Box>
          </Box>
          <Box className="market-bit-ratio-and-status">
            <Box className="prediction-ratio">{totalBidInfo ? totalBidInfo.optionRatios[0] : ""}{totalBidInfo ? totalBidInfo.optionRatios[1] : ""}</Box>
            <Box className="market-status"></Box>
          </Box>
          {/* <Typography variant="h6" component="div" className="market-title">
            {market.title}
          </Typography>
          <Box className="market-details">
            <Typography variant="body2" color="textSecondary">
              Options: {market.numberOfOptions}
            </Typography>
            {/* <Typography variant="body2" color="textSecondary">
              Start: {parseDate(market.startTime)}
            </Typography> */}
          {/* </Box> */} 
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MarketCard;
