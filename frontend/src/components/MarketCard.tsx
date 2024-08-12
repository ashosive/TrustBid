import React, { useEffect, useState } from 'react';
import './MarketCard.css';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

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
  };
}

const MarketCard = ({ market }: MarketCardProps) => {
  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };
  const [team1, setTeam1] = useState({});
  const [team2, setTeam2] = useState({});


  useEffect(() => {
    const getTeams = async () => {
      try {

      } catch(err:any) {
        console.log("error while getting team info",err.message);
      }
    }
  },[]);

  return (
    <Card className="market-card">
      <CardActionArea>
        <CardContent>
          <Box className="market-team-and-score-details">
            <Box className="team1">

            </Box>
            <Box className="teams-scores"></Box>
            <Box className="team2"></Box>
          </Box>
          <Box className="market-bit-ratio-and-status">
            <Box className="prediction-ratio"></Box>
            <Box className="market-status"></Box>
          </Box>
          <Typography variant="h6" component="div" className="market-title">
            {market.title}
          </Typography>
          <Box className="market-details">
            <Typography variant="body2" color="textSecondary">
              Options: {market.numberOfOptions}
            </Typography>
            {/* <Typography variant="body2" color="textSecondary">
              Start: {parseDate(market.startTime)}
            </Typography> */}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MarketCard;
