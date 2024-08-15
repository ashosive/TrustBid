import React, { useEffect, useState } from 'react';
import './ButtonTabs.css'; // Import the CSS file
import EventActivityTable, { EventActivityTableProps } from './EventActivityTable';
import axios from 'axios';
import config from '../config';
import { Avatar, Box, Card, CardContent, Grid, List, ListItem, ListItemAvatar, Typography } from '@mui/material';
import dayjs from 'dayjs';

// Define a type for the tab names
type TabName = 'marketDetail' | 'claim' | 'gameDetails';

type marketInfo = EventActivityTableProps & {
    gameDetails: GameDetails | null;
    setGameDetails: React.Dispatch<React.SetStateAction<GameDetails | null>>;
    eventDetails: DecodedEvent | null;
    setEventDetails: React.Dispatch<React.SetStateAction<DecodedEvent | null>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    owner: string;
    expireTime: string

}

const ButtonTabs: React.FC<marketInfo> = ({ market, eventData, setEvents, gameDetails, setGameDetails, eventDetails, setEventDetails, loading, setLoading, error, setError, owner, expireTime }) => {
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
                    className={`tab-button ${activeTab === 'gameDetails' ? 'active' : ''}`}
                    onClick={() => handleTabClick('gameDetails')}
                >
                    Game Details
                </button>
            </div>

            <div className="table-container">
                {activeTab === 'marketDetail' && <MarketDetailTable setEvents={setEvents} market={market} eventData={eventData} />}
                {activeTab === 'gameDetails' && <GameDetailsTable market={market} setError={setError} error={error} setEventDetails={setEventDetails} eventDetails={eventDetails} setGameDetails={setGameDetails} gameDetails={gameDetails} setLoading={setLoading} loading={loading} expireTime={expireTime} owner={owner} />}
            </div>
        </div>
    );
};

// Example tables for demonstration purposes
const MarketDetailTable: React.FC<EventActivityTableProps> = ({ market, eventData, setEvents }) => (
    <EventActivityTable
        market={market}
        eventData={eventData}
        setEvents={setEvents}
    />
);

interface GameDetails {
    marketResolved: boolean,
    winningOption: number,
    liquidityPool: number,
    numberOfOptions: number,
    endTime: number,
    eventHash: string,
}

interface DecodedEvent {
    eventName: string;
    teams: string[];
    teamDetails: {
      id: string;
      code: string;
      name: string;
      logoUrl: string;
    }[];
}

type gameDetails = {
    gameDetails: GameDetails | null;
    setGameDetails: React.Dispatch<React.SetStateAction<GameDetails | null>>;
    eventDetails: DecodedEvent | null;
    setEventDetails: React.Dispatch<React.SetStateAction<DecodedEvent | null>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    market: string
    owner: string;
    expireTime: string
}

const GameDetailsTable: React.FC<gameDetails> = ({ market, gameDetails, setGameDetails, eventDetails, setEventDetails, error, setError, loading, setLoading, owner, expireTime }) => {
    const [status, setStatus] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const now = dayjs();
        setCurrentDate(now.format('YYYY-MM-DD'));

        const expiration = dayjs(new Date(parseInt(String(gameDetails?.endTime)) * 1000).toISOString());
        setStatus(now.isBefore(expiration) ? 'Active' : 'Expired');
    }, [gameDetails?.endTime]);
    

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const getStatusDotClass = () => (status === 'Active' ? 'dot blinking' : 'dot stable');

    const getStatus = () => {
        const expirationTime = new Date(expireTime);
        const currentTime = new Date();
        const timeDifference = expirationTime.getTime() - currentTime.getTime();
    
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
          const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      
        if (hours > 0) {
            return { timeLeft: `${hours}h left`, color: 'warning.main' }; // Yellow color
        } else {
            return { timeLeft: `${minutes}m left`, color: 'info.main' }; // Blue color
        }
    }

    const {timeLeft} = getStatus()

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Game Details</Typography>
                        {gameDetails && (
                            <div>
                               
                                <Typography variant="body1">Winning Option: {gameDetails.marketResolved ? gameDetails.winningOption : "Not yet resolved"}</Typography>
                                <Typography variant="body1">Liquidity Pool: {gameDetails.liquidityPool > 0 ? gameDetails.liquidityPool / 1e18 : gameDetails.liquidityPool } USDC</Typography>
                                <Typography variant="body1">Expires in : { timeLeft } </Typography>
                                <Typography variant="body1">Market : { market } </Typography>
                                <Typography variant="body1">Owner : { owner } </Typography>
                                <Typography display={'flex'} alignItems={'center'}>
                                <Typography variant="body1" component="strong" mr={1}>Status:</Typography>
                                <Box className={getStatusDotClass()} sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'currentColor', mr: 1 }}/>
                                <Typography variant="body1" className="">
                                    {status}
                                </Typography>
                                </Typography>
                        
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Event Details</Typography>
                        {eventDetails && (
                            <div>
                                <Typography variant="body1"><strong>{eventDetails.eventName}</strong></Typography>
                                <List>
                                    {eventDetails.teamDetails.map((team) => (
                                        <ListItem key={team.id}>
                                            <ListItemAvatar>
                                                <Avatar src={team.logoUrl} alt={team.name} />
                                            </ListItemAvatar>
                                            <Typography variant="body1">
                                                {team.name} ({team.code})
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default ButtonTabs;
