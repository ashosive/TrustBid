import React, { useEffect, useState } from 'react';
import './MarketInfo.css';
import axios from 'axios';
import getReason from '../utils/getReason';
import sendTxn from '../utils/sendTxn';
import EventActivityTable from '../components/EventActivityTable';
import Config from "../config";
import dayjs from 'dayjs';
import { Line } from 'react-chartjs-2';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip, Filler } from 'chart.js';
import ButtonTabs from "../components/ButtonTabs";
import { Button, Card, CardContent, Typography, Grid, Select, MenuItem, InputLabel, FormControl, TextField, CircularProgress, SelectChangeEvent, Box, List, ListItem, ListItemAvatar, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

interface Market {
    eventHash: string;
    expirationTime: string;
    id: string;
    marketAddress: string;
    numberOfOptions: number;
    owner: string;
    blockTimestamp: string;
    title: string;
    options: string[];
    from: string;
    teamDetails: string[] | null;
}

interface TotalOptions {
    totalBidAmount: number;
    options: number[];
    optionRatios: number[];
  }

interface EventData {
    eventName: string;
    values: {
        user?: string;
        amount: string;
        option?: string;
        marketAddress?: string;
        numberOfOptions?: string;
        eventHash?: string;
        startTime?: string;
        expirationTime?: string;
    };
    timestamp: string;
    blockNumber: string;
    transactionHash: string;
}

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

interface MarketInfo {
    awayTeam: string, homeTeam: string, gameInfo: string
}

interface TeamScores {
    [symbol: string]: number;
}

interface MarketTotalBetsInfoResponse {
    totalBidAmount: number;
    options: number[];
  }
  
  // Define the type for the result including optionRatios
  interface MarketTotalBetsInfoResult extends MarketTotalBetsInfoResponse {
    optionRatios: number[];
  }

const MarketInfo = ({ blockTimestamp, expirationTime, marketAddress, numberOfOptions, owner, title, options, from, teamDetails }: Market) => {
    const [selectedOption, setSelectedOption] = useState<string>('0');
    const [amount, setAmount] = useState<number>(0);
    const [userBidInfo, setUserBidInfo] = useState<number[]>([]);
    const [totalBidInfo, setTotalBidInfo] = useState<TotalOptions>({
        totalBidAmount: 0,
        options: [],
        optionRatios: []
      });
    const [currentDate, setCurrentDate] = useState('');
    const [status, setStatus] = useState('');
    const [events, setEvents] = useState<EventData[]>([]);
    const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
    const [eventDetails, setEventDetails] = useState<DecodedEvent | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isMarketCanceled, setIsMarketCanceled] = useState(false);
    const [matchInfo, setMatchInfo] = useState<MarketInfo | undefined>(undefined);
    const [teamScores, setTeamScores] = useState<TeamScores>({});
    const [isFormVisible, setFormVisible] = useState(false);

    useEffect(() => {
        const now = dayjs();
        setCurrentDate(now.format('YYYY-MM-DD'));

        const expiration = dayjs(expirationTime);
        setStatus(now.isBefore(expiration) ? 'Active' : 'Expired');
    }, [expirationTime]);

    useEffect(() => {
        const fetchUserBidInfo = async () => {
            try {
                const { data } = await axios.post(`${Config.apiBaseUrl}/market/userBetInfo`, {
                    market: marketAddress,
                    user: from
                });
                console.log("user bet info",data);
                setUserBidInfo(data.result);

            } catch (error) {
                console.error("Error fetching user bet info", error);
            }
        };

        const fetchTotalBetsInfo = async () => {
            try {
                const response = await axios.post<{ result: MarketTotalBetsInfoResult }>(`${Config.apiBaseUrl}/market/totalBetsInfo`, {
                    market: marketAddress,
                    user: from
                });

                const result = response.data.result;
                result.optionRatios = result.options.map((optionAmount, index) => {
                const ratio = result.totalBidAmount > 0 ? optionAmount / result.totalBidAmount : 0;
                console.log("ratio", optionAmount, result.totalBidAmount, ratio)
                return ratio;
                });
                setTotalBidInfo(result);
                // setTotalBidInfo(data.result);
            } catch (error) {
                console.error("Error fetching total bet info", error);
            }
        };

        if (from) {
            fetchUserBidInfo();
        }
        fetchTotalBetsInfo();
    }, [from, marketAddress]);

    useEffect(() => {
        const getMatchInfo = async () => {
          try {
            const result = await axios.get<{ result: { awayTeam: string, homeTeam: string, gameInfo: string } }>(`${Config.apiBaseUrl}/game/info?date=${expirationTime.split('T')[0]}&title=${options[0] + ' vs ' + options[1]}`);
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
        if (options[0] != 'Yes') {
          getMatchInfo()
        }
      }, []);

    useEffect(() => {
        const getMarketIsCanceled = async () => {
          try {
            const response = await axios.get(`${Config.apiBaseUrl}/market/isCanceled?market=${marketAddress}`);
            console.log("Market canceled ", response.data.result);
            const result = response.data.result;
            setIsMarketCanceled(result);
  
          } catch (err) {
            console.log("Error fetching market is canceled or not ", err);
          }
        } 
        getMarketIsCanceled();
    },[])
  

    useEffect(() => {
        const fetchGameDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.post(`${Config.apiBaseUrl}/market/marketInfo`, {
                    market: marketAddress
                });

                setGameDetails(response.data.result); // Adjust based on your API response structure

                // Call decodeEvent with the eventHash from the response
                await decodeEvent(response.data.result.eventHash);
            } catch (err) {
                console.log(err)

                setError('Failed to fetch game details');
            } finally {
                setLoading(false);
            }
        };

        const decodeEvent = async (eventHash: string) => {
            try {
                setLoading(true);
                const response = await axios.post(`${Config.apiBaseUrl}/event/decode`, {
                    eventHash: eventHash
                });

                console.log(response.data.result)

                // Transform the response data to match the DecodedEvent interface
                const [eventName, teams, teamDetails] = response.data.result;
                console.log(eventName, teams, teamDetails)

                const formattedEventDetails: DecodedEvent = {
                eventName: eventName,
                teams: teams,
                teamDetails: teamDetails.map(([id, code, name, logoUrl]: [string, string, string, string]) => ({
                    id,
                    code,
                    name,
                    logoUrl
                }))
                };

                console.log(formattedEventDetails)

                setEventDetails(formattedEventDetails);

            } catch (err) {
                console.log(err)
                setError('Failed to fetch game details');
            } finally {
                setLoading(false);
            }
        }

        fetchGameDetails();
    }, []);

    const handleOptionSelect = (event: SelectChangeEvent<string>) => setSelectedOption(event.target.value);

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setAmount(!isNaN(value) ? value : 0);
    };

    const executeBidTransaction = async (amount: string, selectedOption: string) => {
        if (!from) return alert("Connect wallet");
        if (Number(amount) <= 0) return alert("Amount cannot be zero");
        if (!selectedOption) return alert("Invalid option");

        try {
            const { data } = await axios.post(`${Config.apiBaseUrl}/market/bet`, {
                market: marketAddress,
                amount: String(amount),
                option: selectedOption,
                from
            });
            await sendTxn(data.result);
        } catch (error: any) {
            console.error('Error executing bid transaction', error);
            alert(getReason(error.response.data.msg));
        }
    };

    const executeClaimTransaction = async () => {
        if (!from) return alert("Connect wallet");

        try {
            const { data } = await axios.post(`${Config.apiBaseUrl}/market/claim`, {
                market: marketAddress,
                from
            });
            return await sendTxn(data.result);
        } catch (error: any) {
            console.error('Error executing claim transaction', error);
            alert(getReason(error.response.data.msg));
        }
    };

    const getApproveTxn  = async (value: string, approver: string, spender: string, token: string) => {
        if (!from) return alert("Connect wallet");

        try {
            const { data } = await axios.post(`${Config.apiBaseUrl}/token/approve`, {
                approver,
                spender,
                token,
                value
            });
            return await sendTxn(data.result);
        } catch (error: any) {
            console.error('Error executing approve transaction', error);
            alert(getReason(error.response.data.msg));
        }
    }

    const getWithdrawTxn = async () => {
        if (!from) return alert("Connect wallet");

        try {
            const { data } = await axios.post(`${Config.apiBaseUrl}/market/withdrawBet`, {
               market: marketAddress,
               from: from
            });
            return await sendTxn(data.result);
        } catch (error: any) {
            console.error('Error executing withdraw transaction', error);
            alert(getReason(error.response.data.msg));
        }
    }

    const getIsResolveTxn = async () => {
        if (!from) return alert("Connect wallet");

        try {
            const { data } = await axios.post(`${Config.apiBaseUrl}/market/resolveMarket`, {
               market: marketAddress,
               from: from
            });
            return await sendTxn(data.result);
        } catch (error: any) {
            console.error('Error executing is resolve transaction', error);
            alert(getReason(error.response.data.msg));
        }
    }

    const generateDateArray = (startDate: string, endDate: string): string[] => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dateArray: string[] = [];

        for (let currentDate = start; currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
            dateArray.push(currentDate.toLocaleDateString());
        }

        return dateArray;
    };

    const convertBlockNumberToDate = (timestamp: string) => new Date(Number(timestamp) * 1000).toLocaleDateString();

    const startingDate = convertBlockNumberToDate(blockTimestamp);
    const endDate = new Date(expirationTime).toLocaleDateString();

    const generateLabels = (teamDetails?: string[] | null) => (teamDetails ?? []).map((team) => `${team[1]}`);

    const labels = generateLabels(teamDetails);
    const dateArray = generateDateArray(startingDate, endDate);

    const result: { [key: number]: (string | number)[] } = { 0: labels, 1: [], 2: [] };

    events.forEach(event => {
        if (event.eventName === "BetPlaced" && event.values.option) {
            const amount = parseInt(event.values.amount, 10) / 1e18;
            const option = parseInt(event.values.option, 10);
            if (option === 0) result[1].push(amount);
            else if (option === 1) result[2].push(amount);
        }
    });

    const chartData = {
        labels: dateArray,
        datasets: Object.keys(result)
            .filter(key => key !== '0')
            .map((key, index) => ({
                label: `${options[index]}`,
                backgroundColor: index % 2 === 0 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)',
                borderColor: index % 2 === 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                data: result[parseInt(key, 10)] as number[],
                fill: true,
                tension: 0.4,
            })),
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Days',
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Value',
                },
                suggestedMin: 0,
                suggestedMax: 50,
            },
        },
    };

    const handleEditBid = () => {
        setFormVisible(true);
    };

    const handlePlaceBid = () => {
        // Logic to place a bid
    };

    const handleCloseForm = () => {
        setFormVisible(false);
    };

    const handleSubmitEditBid = async () => {
        // Logic to submit the edited bid
        console.log('Submitted Option:', selectedOption+1);
        console.log('Submitted Amount:', amount);
        await getApproveTxn(String(amount * 1e18),from, marketAddress, "0xab4f68A873eC164D9d52467D92469fC313Cf64F6");
        await executeBidTransaction(String(amount),selectedOption);
        // await 
        setFormVisible(false);
        from = from

    };

    console.log("options ",options)

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>{title}</Typography>
                <Box display="flex" justifyContent="space-around" alignItems="flex-start" marginTop="16px">
                    <Box className="bid-info-container" flex={1} marginRight="16px" border={1}>
                        {totalBidInfo.options.length > 0 ? (
                            <Line data={chartData} options={chartOptions} />
                        ) : (
                            <Typography variant="body1">Loading chart...</Typography>
                        )}
                    </Box>

                    <Box flex={0.5} maxWidth={500}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
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
                                        src={eventDetails?.teamDetails[0].logoUrl || 'https://www.mlbstatic.com/team-logos/team-cap-on-light/141.svg'}
                                        alt="Team Logo"
                                        style={{ width: '48px', height: '48px', marginBottom: '8px' }}
                                    />
                                    <Typography variant="body1" style={{ textDecoration: 'none' }}>{eventDetails?.teamDetails[0].name}</Typography>
                                </Box>
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography variant="h5" fontWeight="bold">
                                        {status == 'Expired' ? matchInfo?.gameInfo : '0 : 0'}
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
                                        src={eventDetails?.teamDetails[1].logoUrl || 'https://www.mlbstatic.com/team-logos/team-cap-on-light/141.svg'}
                                        alt="Team Logo"
                                        style={{ width: '48px', height: '48px', marginBottom: '8px' }}
                                    />
                                    <Typography variant="body1" >{eventDetails?.teamDetails[1].name}</Typography>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                marginBottom: '16px',
                                }}
                            >
                                <Typography sx={{ padding: '0px 20px', textDecoration: 'none' }} variant="body2">{totalBidInfo?.optionRatios?.[0]}</Typography>
                                <Typography sx={{ padding: '0px 10px', textDecoration: 'none' }} variant="body2">{}</Typography>
                                <Typography sx={{ padding: '0px 20px' }} variant="body2">{totalBidInfo?.optionRatios?.[1]}</Typography>
                            </Box>

                            {isMarketCanceled ? (
                                <Grid item sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                                    <Grid sx={{ display: 'flex', p: '10px 5px ', flexDirection: 'column', justifyContent: 'center', border: '1px solid #e0d0d0'}}>
                                                <Typography sx={{display: 'flex', justifyContent: 'center'}} >Current Bid Info </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: "row", justifyContent: 'space-around' }}>
                                                    <Typography>Option: {options[userBidInfo[1]]}</Typography>
                                                    <Typography>Amount: {userBidInfo[0] / 1e18} USDC</Typography>
                                                </Box>
                                    </Grid>
                                    <Button variant="contained" color="secondary" onClick={getWithdrawTxn}>Withdraw</Button>
                                </Grid>
                            ) : status === "Expired" ? (
                                gameDetails?.marketResolved ? (
                                    <Grid item sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                                        <Grid sx={{ display: 'flex', p: '10px 5px ', flexDirection: 'column', justifyContent: 'center', border: '1px solid #e0d0d0'}}>
                                                <Typography sx={{display: 'flex', justifyContent: 'center'}} >Current Bid Info </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: "row", justifyContent: 'space-around' }}>
                                                    <Typography>Option: {options[userBidInfo[1]]}</Typography>
                                                    <Typography>Amount: {userBidInfo[0] / 1e18} USDC</Typography>
                                                </Box>
                                        </Grid>
                                        <Button variant="contained" color="primary" onClick={executeClaimTransaction}>Claim</Button>
                                    </Grid>
                                ) : (
                                    <Grid item sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
                                        <Typography variant={'h6'}>Market not resolved yet</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
                                            {/* <Typography>Wanna give it a try (gets updated from oracle) 👇</Typography> */}
                                            <Button variant="contained" color="primary" onClick={getIsResolveTxn}>Check is resolved</Button>
                                        </Box>
                                    </Grid>
                                )
                            ) : (
                                <>
                                    {userBidInfo && userBidInfo[0] > 0 ? userBidInfo[2] ? (<Box>Claimed!</Box>) : (
                                        <Grid item sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                                            <Grid sx={{ display: 'flex', p: '10px 5px ', flexDirection: 'column', justifyContent: 'center', border: '1px solid #e0d0d0'}}>
                                                <Typography sx={{display: 'flex', justifyContent: 'center'}} >Current Bid Info </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: "row", justifyContent: 'space-around' }}>
                                                    <Typography>Option: {options[userBidInfo[1]]}</Typography>
                                                    <Typography>Amount: {userBidInfo[0] / 1e18} USDC</Typography>
                                                </Box>
                                            </Grid>
                                            <Button variant="contained" color="primary" onClick={handleEditBid} >
                                                Edit Bid
                                            </Button>
                                        </Grid>
                                    ) : (
                                        <Grid item>
                                             <FormControl fullWidth variant="outlined" margin="normal">
                                                    <InputLabel>Select Option</InputLabel>
                                                    <Select value={selectedOption} onChange={handleOptionSelect} label="Select Option">
                                                        {options.map((option, index) => (
                                                            <MenuItem key={index} value={index.toString()}>{option}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>

                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Amount"
                                                    variant="outlined"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                    margin="normal"
                                                />

                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => executeBidTransaction(amount.toString(), selectedOption)}
                                                            disabled={!from || status === 'Expired'}
                                                        >
                                                            Bid
                                                        </Button>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            color="secondary"
                                                            onClick={executeClaimTransaction}
                                                            disabled={!from || status !== 'Expired'}
                                                        >
                                                            Claim
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                        </Grid>
                                    )}
                                    {/* Edit Bid Form Dialog */}
                                    <Dialog open={isFormVisible} onClose={handleCloseForm}>
                                        <DialogTitle>Edit Bid</DialogTitle>
                                        <DialogContent>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>Select Option</InputLabel>
                                                <Select
                                                    value={selectedOption}
                                                    onChange={(e) => setSelectedOption(e.target.value)}
                                                    label="Select Option"
                                                >
                                                    {/* Replace with actual options */}
                                                    {options.map((option,index) => (
                                                        <MenuItem key={index} value={index} >{option}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Amount"
                                                variant="outlined"
                                                value={amount}
                                                onChange={(e) => setAmount(Number(e.target.value) < 0 ? 0 : Number(e.target.value))}
                                                margin="normal"
                                                
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleCloseForm} color="secondary">
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSubmitEditBid} color="primary">
                                                Submit
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </>
                            )}
                    </Box>
                </Box>

                <ButtonTabs market={marketAddress} eventData={events} setEvents={setEvents} gameDetails={gameDetails} setGameDetails={setGameDetails} loading={loading} setLoading={setLoading} eventDetails={eventDetails} setEventDetails={setEventDetails} error={error} setError={setError} owner={owner} expireTime={expirationTime} />
            </CardContent>
        </Card>
    );
};

export default MarketInfo;
