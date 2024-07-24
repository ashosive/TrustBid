import React from 'react';
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

  return (
    <Card className="market-card">
      <CardActionArea>
        <CardContent>
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
