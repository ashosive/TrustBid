import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import PieChart from '../components/PieChart'; // Assuming PieChart is a custom component
import Config from "../config";
import { Grid, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs } from '@mui/material';
import { Market } from '../App';

interface EventData {
  event: string;
  market: string;
  isResolved: boolean;
  values: {
      amount: string;
      user: string;
      option: string;
  }
  transactionHash: string;
  timestamp: number;
}

// Define a TypeScript interface for props
interface UserDetailsProps {
    user: string;
    markets: Market[]
}

const StyledDashboard = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '20px',
  backgroundColor: '#f5f5f5',
});

const SummaryCard = styled(Card)({
  backgroundColor: '#fff',
  marginBottom: '20px',
});

// Custom styles for the table cells
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '14px',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}



function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const positionsData = [
  { market: 'Market 1', avg: 50, current: 55, value: 1000 },
  { market: 'Market 2', avg: 60, current: 62, value: 1500 },
  // Add more data as needed
];

// Function to fetch total bets info for a given market
async function getTotalBetsInfo(marketAddress: string): Promise<TotalBetsInfo | null> {
  try {
    const response = await axios.post('http://localhost:3000/market/totalBetsInfo', {
      market: marketAddress,
    });

    console.log(response.data)
    if (response.data.result) {
      return {totalBetAmount: response.data.result.totalBidAmount, betAmountsByOption: response.data.result.options}  as TotalBetsInfo;
    } else {
      console.error('Invalid response format:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching total bets info:', error);
    return null;
  }
}

async function calculatePositions(details: EventData[], markets: Market[]): Promise<Position[]> {
  const marketPositions: Position[] = [];

  await Promise.all(details.map(async (detail) => {
    if (detail.event === 'BetPlaced') {
      const marketData = markets.find(market => market.marketAddress === detail.market);
      if (marketData) {
        const marketName = marketData.title;
        const amountInEther = parseFloat(detail.values.amount) / 1e18;
        if(new Date(marketData.expirationTime) > new Date()){
          const totalBetInfo = await getTotalBetsInfo(marketData.marketAddress);
          const optionIndex = detail.values.option == marketData.options[0] ? 0 : 1;
          const nonOptionIndex =  detail.values.option == '1' ? 1 : 0;
          // Safely access properties and perform calculations
          const totalBetAmount = parseFloat(totalBetInfo?.totalBetAmount.toString() || '0') / 1e18; // Convert from wei to ether
          const totalOptionBetAmount = parseFloat(totalBetInfo?.betAmountsByOption[Number(detail.values.option)].toString() || '0') / 1e18; // Convert from wei to ether
          const totalNonOptionBetAmount = parseFloat(totalBetInfo?.betAmountsByOption[nonOptionIndex].toString() || '0') / 1e18; // Convert from wei to ether
          console.log(totalOptionBetAmount === 0 ? 0 : totalNonOptionBetAmount === 0 ? Number(detail.values.amount) / 1e18 : (amountInEther * totalNonOptionBetAmount) / totalOptionBetAmount,totalOptionBetAmount, totalNonOptionBetAmount , totalBetInfo?.betAmountsByOption, detail.values.option)
          const userMarketInfo: Position = {
            current: amountInEther,
            market: marketData.title,
            option: marketData.options[Number(detail.values.option)],
            totalBetAmount: totalBetAmount,
            totalOptionBetAmount: totalOptionBetAmount,
            expect: totalOptionBetAmount === 0 ? 0 : totalNonOptionBetAmount === 0 ? amountInEther : (amountInEther * totalNonOptionBetAmount) / totalOptionBetAmount
          };

          marketPositions.push(userMarketInfo)
        }
      }
    }
  }));

  return marketPositions;
}

interface Activity {
  market: string,
  amount: string,
  type: string
}

interface Position {
  market: string;
  current: number;
  expect: number;
  totalBetAmount: number;
  totalOptionBetAmount: number;
  option: string;
}

interface TotalBetsInfo {
  totalBetAmount: number;
  betAmountsByOption: Record<string, number>;
}

const Dashboard: React.FC<UserDetailsProps> = ({user, markets}) => {
  const [dashboardData, setDashboardData] = useState<{
    totalAmountInvested: number;
    details: EventData[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = React.useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [positionValue, setPositionValue] = useState(0);
  const [profitOrLoss, setProfitOrLoss] = useState(0);
  const [volumeTraded, setVolumeTraded] = useState(0);
  const [marketTraded, setMarketTraded] = useState(0);

  const ActivityTable = () => (
  <TableContainer component={Paper} sx={{ backgroundColor: '#f5f5f5', boxShadow: 0 }}>
    <Table>
      <TableHead>
        <TableRow>
          <StyledTableCell>Market</StyledTableCell>
          <StyledTableCell align="right">Amount</StyledTableCell>
          <StyledTableCell align="right">Type</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {activity.map((row, index) => (
          <TableRow
            key={index}
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <TableCell component="th" scope="row">
              {row.market}
            </TableCell>
            <TableCell align="right">{row.amount}</TableCell>
            <TableCell align="right">{row.type}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const PositionsTable = () => (
  <TableContainer component={Paper} sx={{ backgroundColor: '#f5f5f5', boxShadow: 0 }}>
    <Table>
      <TableHead>
        <TableRow>
          <StyledTableCell>Market</StyledTableCell>
          <StyledTableCell align="right">Option</StyledTableCell>
          <StyledTableCell align="right">Current</StyledTableCell>
          <StyledTableCell align="right">Value</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {positions.map((row, index) => (
          <TableRow
            key={index}
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <TableCell component="th" scope="row">
              {row.market}
            </TableCell>
            <TableCell align="right">{row.option}</TableCell>
            <TableCell align="right">{row.current}</TableCell>
            <TableCell align="right">{row.expect}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);


  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const result = await axios.get(`${Config.apiBaseUrl}/event/interactions/user/all?user=${user}`);
        setDashboardData(result.data.result);
        const activities = filterActivityData(result.data.result.details,markets)
        const positions = await calculatePositions(result.data.result.details,markets);
        setActivity(activities);
        setPositions(positions);
        setMarketTraded(activities.length);
        const totalAmount = activities.reduce((total, activity) => {
          // Convert amount from string to number (assuming it's in wei)
          if(activity.type == 'Buy'){
            const amountInNumber = Number(activity.amount) ; // Convert wei to ether
            return total + amountInNumber;
          } else {
            return total
          }
        }, 0);
        setVolumeTraded(totalAmount);
        const positionValue = positions.reduce((total,postion) => {
          return total + postion.expect
        }, 0);
        setPositionValue(positionValue);
        setProfitOrLoss(positionValue);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Handle error as needed
      } finally {
        setIsLoading(false);
      }
    };
    if(user){
        fetchDashboardData();
    }
  }, [user]);

  const formatTokenAmount = (amount: string): string => {
    // Example conversion from wei to ETH
    const amountInEth = parseFloat(amount) / 10**18;
    return amountInEth.toFixed(2); // Format as needed
  };

  function filterActivityData(details: EventData[], markets: Market[]): Activity[] {
    return details.map(detail => {
      // Find the corresponding market name using the market address
      const marketData = markets.find(market => market.marketAddress === detail.market);
      const marketName = marketData ? marketData.title : 'Unknown Market';
      console.log(markets,detail.market)
      console.log("market data ",marketName,marketData?.title,marketData)
      
      // Convert the amount from wei to ether (assuming 18 decimal places)
      const amountInEther =(parseFloat(detail.values.amount) / 1e18).toString();

      // Format the filtered data
      return {
        market: marketName,
        amount: amountInEther,
        type: detail.event === 'BetPlaced' ? 'Buy' : detail.event === 'Claimed' ? 'Sell' : 'Withdraw', // Adjust this based on the event type
        // user: detail.values.user,
        // transactionHash: detail.transactionHash,
        // timestamp: new Date(detail.timestamp * 1000).toLocaleString(), // Convert timestamp to human-readable date
        // option: detail.values.option,
        // isResolved: detail.isResolved
      };
    });
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  interface UserStatsProps {
    title: string;
    value: string;
  }
  
  const UserStats = ({ title, value }: UserStatsProps) => {
    return (
      <Card sx={{ minWidth: 100, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="body2" component="div">
            {title}
          </Typography>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <StyledDashboard >
      {user ? (
        <>
          <Typography variant='h5'>Dashboard</Typography>
          <SummaryCard sx={{ boxShadow: 'none' }}>
            <Grid container spacing={0} sx={{ backgroundColor: '#f5f5f5', justifyContent: 'center' }}>
              <Grid
                item
                xs={2}
                sx={{
                  backgroundColor: '#fff',
                  margin: 2,
                  borderRadius: '8px',
                }}
              >
                <UserStats title="Positions value" value={"$"+positionValue} />
              </Grid>
              <Grid
                item
                xs={2}
                sx={{
                  backgroundColor: '#fff',
                  margin: 2,
                  borderRadius: '8px',
                }}
              >
                <UserStats title="Profit/Loss" value={"$"+profitOrLoss} />
              </Grid>
              <Grid
                item
                xs={2}
                sx={{
                  backgroundColor: '#fff',
                  margin: 2,
                  borderRadius: '8px',
                }}
              >
                <UserStats title="Volume traded" value={'$'+volumeTraded.toString()} />
              </Grid>
              <Grid
                item
                xs={2}
                sx={{
                  backgroundColor: '#fff',
                  margin: 2,
                  borderRadius: '8px',
                }}
              >
                <UserStats title="Markets traded" value={(marketTraded).toString()} />
              </Grid>
            </Grid>
          </SummaryCard>

          {isLoading ? (
            <CircularProgress />
          ) : (
            <Box>
              <Box sx={{ mt: 2 }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={value} onChange={handleChange} aria-label="basic tabs example"  textColor="secondary" indicatorColor="secondary">
                    <Tab label="Positions" {...a11yProps(0)} sx={{}}/>
                    <Tab label="Activity" {...a11yProps(1)} />
                  </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                  <PositionsTable/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                  <ActivityTable/>
                </CustomTabPanel>
                </Box>
              </Box> 
            </Box>
          )}
        </>
      ) : (
        <Box height={'70vh'} display={'flex'} justifyContent={'center'} alignItems={'center'}>Connect Wallet</Box>
      )}
    </StyledDashboard>
  );
};

export default Dashboard;