import React, { useEffect, useState } from 'react';
import './MarketCard.css';
import { Card, CardActionArea, CardContent, Typography, Box, Button } from '@mui/material';
import axios from 'axios';
import Config from "../config";
// import MarketInfo from '../pages/MarketInfo';
import { useTheme } from '@emotion/react';

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
  const [matchInfo, setMatchInfo] = useState<MarketInfo | undefined>(undefined);
  const [totalBidInfo, setTotalBidInfo] = useState<TotalOptions>({
    totalBidAmount: 0,
    options: [],
    optionRatios: []
  });
  const [teamScores, setTeamScores] = useState<TeamScores>({});
  const [isMarketCanceled, setIsMarketCanceled] = useState(false);

  const getStatus = () => {
    const expirationTime = new Date(market.expirationTime);
    const currentTime = new Date();
    const timeDifference = expirationTime.getTime() - currentTime.getTime();
    
    if (isMarketCanceled) {
      return { status: 'Canceled', color: 'error.main' }; // Red color
    } else if (timeDifference <= 0) {
      return { status: 'Closed', color: 'text.disabled' }; // Gray color
    } else if (timeDifference > 24 * 60 * 60 * 1000) {
      return { status: 'Open', color: 'success.main' }; // Green color
    } else {
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  
      if (hours > 0) {
        return { status: `${hours}h left`, color: 'warning.main' }; // Yellow color
      } else {
        return { status: `${minutes}m left`, color: 'info.main' }; // Blue color
      }
    }
  };

  const { status, color } = getStatus();

  useEffect(() => {
    const getMatchInfo = async () => {
      try {
        const result = await axios.get<{ result: { awayTeam: string, homeTeam: string, gameInfo: string } }>(`${Config.apiBaseUrl}/game/info?date=${market.expirationTime.split('T')[0]}&title=${market.options[0] + ' vs ' + market.options[1]}`);
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

      } catch (err) {
        console.log("error while getting match info ", err);
      }
    }
    if (market.options[0] != 'Yes') {
      getMatchInfo()
    }
  }, []);

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
          console.log("ratio", optionAmount, result.totalBidAmount, ratio)
          return ratio;
        });
        setTotalBidInfo(result);
        console.log("State Updated: ", response.data.result); // Add this line
      } catch (err) {
        console.log("Error fetching total bet info", err);
      }
    };
    totalBetsInfo();
  }, []);

  useEffect(() => {
      const getMarketIsCanceled = async () => {
        try {
          const response = await axios.get(`${Config.apiBaseUrl}/market/isCanceled?market=${market.marketAddress}`);
          console.log("Market canceled ", response.data.result);
          const result = response.data.result;
          setIsMarketCanceled(result);

        } catch (err) {
          console.log("Error fetching market is canceled or not ", err);
        }
      } 
      getMarketIsCanceled();
  },[])

 

  return (
    <Card
      sx={{
        borderRadius: '20px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        maxWidth: 345,
        padding: '16px',
        backgroundColor: '#fff',
        textDecorationLine: 'none'
      }}
    >
      <CardActionArea>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src={market?.teamDetails?.[0][3] || 'https://www.mlbstatic.com/team-logos/team-cap-on-light/141.svg'}
                alt="Team Logo"
                style={{ width: '48px', height: '48px', marginBottom: '8px' }}
              />
              <Typography variant="body1" style={{ textDecoration: 'none' }}>{ market.options?.[0]}</Typography>
            </Box>
            <Box
              sx={{
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                {status == 'close' ? matchInfo?.gameInfo : '0 : 0'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {status == 'close' ? '' : matchInfo?.gameInfo}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src={market?.teamDetails?.[1][3] || 'https://www.mlbstatic.com/team-logos/team-cap-on-light/141.svg'}
                alt="Team Logo"
                style={{ width: '48px', height: '48px', marginBottom: '8px' }}
              />
              <Typography variant="body1" >{market.options?.[1]}</Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <Typography sx={{ padding: '0px 20px', textDecoration: 'none' }} variant="body2">{totalBidInfo?.optionRatios?.[0]}</Typography>
            <Typography sx={{ padding: '0px 20px' }} variant="body2">{totalBidInfo?.optionRatios?.[1]}</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* <Button
            variant="contained"
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              borderRadius: '20px',
              padding: '8px 24px',
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#FFC107',
              },
            }}
          >
            Place Bet
          </Button> */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '16px',
              }}
            >
              <Typography variant="body2" color={color} fontWeight={'bold'}>
                {status}
              </Typography>
              <Box
                sx={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  marginLeft: '8px',
                }}
              ></Box>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MarketCard;
