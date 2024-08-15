import React, {useEffect, useState} from 'react';
import './MarketInfo.css';
import axios from 'axios';
import getReason from '../utils/getReason';
import sendTxn from '../utils/sendTxn';
import EventActivityTable from '../components/EventActivityTable';
import Config from "../config";
import dayjs from 'dayjs';
import {Line} from 'react-chartjs-2';
import {CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip, Filler} from 'chart.js';
import ButtonTabs from "../components/ButtonTabs";
import { Box, Tabs, Tab } from '@mui/material';


ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend,Filler);

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
    teamDetails: string[] | null
}

interface TotalOptions {
    totalBidAmount: number;
    options: number[];
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
const MarketInfo = ({
    blockTimestamp,
    eventHash,
    expirationTime,
    id,
    marketAddress,
    numberOfOptions,
    owner,
    // startTime,
    title,
    options,
    from,
    teamDetails
}: Market) => {
    const [selectedOption, setSelectedOption] = useState<string | null>('0');
    const [amount, setAmount] = useState<number>(0);
    const [userBidInfo, setUserBidInfo] = useState<number[]>([])
    const [totalBidInfo, setTotalBidInfo] = useState<TotalOptions>({
        totalBidAmount: 0,
        options: []
    });
    const [currentDate, setCurrentDate] = useState('');
    const [status, setStatus] = useState('');
    const [events, setEvents] = useState<EventData[]>([]);

    const handleOptionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        console.log("selected option ", selectedValue)
        setSelectedOption(selectedValue);
    };

    const getBidTxn = async () => {
        try {
            if (!from) {
                return alert("connect wallet")
            }
            if (amount <= 0) {
                return alert("amount cannot be zero");
            }
            if (!selectedOption) {
                return alert("invalid option")
            }
            const result = await axios.post(`${Config.apiBaseUrl}/market/bet`, {
                market: marketAddress,
                amount: String(amount * 10**18),
                option: selectedOption,
                from: from
            });

            console.log("txn ", result.data.result)

            const sendResult = await sendTxn(result.data.result);

        } catch (err: any) {
            console.log('error fetching bid txn', err);
            alert(getReason(err.response.data.msg))
        }
    };

    const getClaimTxn = async () => {
        try {
            // get the users address,
            if (!from) {
                return alert("connect wallet")
            }

            // get txn
            const result = await axios.post(`${Config.apiBaseUrl}/market/claim`, {
                market: marketAddress,
                from: from
            });

            console.log("txn ", result.data.result);

            const resultTxn = await sendTxn(result.data.result)

        } catch (err: any) {
            console.log('error fetching bid txn', err);
            alert(getReason(err.response.data.msg));
        }
    }


    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value; // This is a string
        const parsedValue = parseFloat(value); // Convert string to number

        if (!isNaN(parsedValue)) {
            setAmount(parsedValue); // Update amount state with the parsed number
        } else {
            setAmount(0); // Or handle invalid input accordingly
        }
    };
    const totalBetsInfo = async () => {
        try {
            const response = await axios.post(`${Config.apiBaseUrl}/market/totalBetsInfo`, {
                market: marketAddress,
                user: from
            });
            console.log("Market Total Bet ", response.data.result);
            setTotalBidInfo(response.data.result);
            console.log("State Updated: ", response.data.result); // Add this line
        } catch (err) {
            console.log("Error fetching total bet info", err);
        }
    };


    useEffect(() => {
        const getBidInfo = async () => {
            try {
                // check user has bid or not
                const userBidInfo = await axios.post(`${Config.apiBaseUrl}/market/userBetInfo`, {
                    market: marketAddress,
                    user: from
                })
                console.log("userInfo ", userBidInfo.data.result);
                setUserBidInfo(userBidInfo.data.result);
            } catch (err) {
                console.log("error fetching user bet info", err);
            }
        }
        if(from){
            getBidInfo();
        }
        totalBetsInfo().then(r => {});
    }, [from]);

    useEffect(() => {
        const now = dayjs();
        const formattedDate = now.format('YYYY-MM-DD');
        setCurrentDate(formattedDate);

        // const start = dayjs(startTime);
        const expiration = dayjs(expirationTime);

       if (now.isBefore(expiration)) {
            setStatus('Active');
        } else {
            setStatus('Expired');
        }
    }, [expirationTime]);
    const getStatusDotClass = () => {
        if (status === 'Active') {
            return 'dot blinking';
        } else {
            return 'dot stable';
        }
    };

    const convertBlockNumberToDate = (timestamp: string) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleDateString();
    };

    const getEndDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString(); // Format the date as "MM/DD/YYYY"
    }

    const startingDate = convertBlockNumberToDate(blockTimestamp);
    const endDate = getEndDate(expirationTime);
    const generateDateArray = (startDate: string, endDate: string): string[] => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dateArray: string[] = [];
        let currentDate = start;
        while (currentDate <= end) {
            dateArray.push(currentDate.toLocaleDateString());
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dateArray;
    };
    const dateArray = generateDateArray(startingDate, endDate);
    console.log("events",events);
    const processedData = events.filter(event => event.eventName === "BetPlaced").map(event => {
        return parseFloat(event.values.amount) / 1e18;
    });
    console.log(processedData,"processedData");
    type TeamDetails = string;

    const generateLabels = (teamDetails?: TeamDetails[] | null) => {
        return (teamDetails ?? []).map((team) => `${team[1]}`);
    };

    const labels = generateLabels(teamDetails);

    interface Result {
        [key: number]: (string | number)[];
    }

// Initialize result with the correct type
    const result: Result = {
        0: [""], // Labels for index 0
        1: [],     // Amounts for option 0
        2: []      // Amounts for option 1
    };
    result[0] = labels;

// Convert amounts and process events
    events.forEach((event) => {
        if (event.eventName === "BetPlaced" && event.values.option) {
            const amount = parseInt(event.values.amount, 10) / 1e18; // Convert amount and divide by 1e18
            const option = parseInt(event.values.option, 10);
            if (option === 0) {
                result[1].push(amount); // Save amount at index 1
            } else if (option === 1) {
                result[2].push(amount); // Save amount at index 2
            }
        }
    });

    const datasets = Object.keys(result)
        .filter(key => key !== '0') // Exclude labels from datasets
        .map((key, index) => {
            // Ensure that the key is a number
            const datasetKey = parseInt(key, 10);
            const data = result[datasetKey] || []; // Handle cases where result[datasetKey] might be undefined

            return {
                label: ` ${key}`, // Label for the dataset
                backgroundColor: index % 2 === 0 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)',
                borderColor: index % 2 === 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                data: data as number[], // Ensure data is treated as number[]
                fill: true,
                tension: 0.4,
            };
        });


    const chartData = {
        labels: dateArray,
        datasets: datasets,
    };
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const, // Explicitly stating 'top' as a constant string
            },
            tooltip: {
                mode: 'index' as const, // Use 'index' as a constant string literal
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

    return (
        <div className="">
            <div className="bid-info-container">
                <h3>{title}</h3>
                {totalBidInfo.options.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <div>Loading chart...</div>
                )}
            </div>
            <ButtonTabs />
            {/*<div className="market-detail">*/}
            {/*    <strong>Expiration Time:</strong> {expirationTime}*/}
            {/*</div>*/}
            {/*<div className="market-detail">*/}
            {/*    <strong>Status: <span className={getStatusDotClass()}><span*/}
            {/*        className="status">{status}</span></span></strong>*/}
            {/*</div>*/}
            {/*<div className="market-detail">*/}
            {/*    <strong>Market Address:</strong> {marketAddress}*/}
            {/*</div>*/}
            {/*<div className="market-detail">*/}
            {/*    <strong>Number of Options:</strong> {numberOfOptions}*/}
            {/*</div>*/}
            {/*<div className="market-detail">*/}
            {/*    <strong>Owner:</strong> {owner}*/}
            {/*</div>*/}
            {/*/!* <div className="market-detail">*/}
            {/*    <strong>Start Time:</strong> {startTime}*/}
            {/*</div> *!/*/}
            {/*<div className="market-select">*/}
            {/*    <label htmlFor="options">Choose an option:</label>*/}
            {/*    <select*/}
            {/*        id="options"*/}
            {/*        value={selectedOption || ''}*/}
            {/*        onChange={handleOptionSelect}*/}
            {/*    >*/}
            {/*        {options.map((option, i) => (*/}
            {/*            <option value={i} key={i}>*/}
            {/*                {option + " - " + String(totalBidInfo.options[i] + ' USDT')}*/}
            {/*            </option>*/}
            {/*        ))}*/}
            {/*    </select>*/}
            {/*</div>*/}
            {/*<div className="market-bid">*/}
            {/*    <input type="number" placeholder="Enter your bid" onChange={handleAmountChange}/>*/}
            {/*    <button onClick={getBidTxn}*/}
            {/*            disabled={userBidInfo[0] > 0 ? true : false}>{userBidInfo[0] > 0 ? 'bidded' : 'Bid'}</button>*/}
            {/*    <button onClick={getClaimTxn}>Claim</button>*/}
            {/*</div>*/}
            {/*<div className="user-info">*/}
            {/*    User Bet Info*/}
            {/*    <div className="user-bid-info">*/}
            {/*        {userBidInfo.length > 0 ? (*/}
            {/*            userBidInfo[0] === 0 && userBidInfo[1] === 0 ? (*/}
            {/*                <div className="not-bid">Not Bid Yet!</div>*/}
            {/*            ) : (*/}
            {/*                <div>*/}
            {/*                    <div>Option: <span className="option">{options[userBidInfo[1]]}</span></div>*/}
            {/*                    <div>Amount: <span className="amount">{userBidInfo[0] / 10 ** 18}</span></div>*/}
            {/*                </div>*/}
            {/*            )*/}
            {/*        ) : from ? (*/}
            {/*            <div className="loading">Loading....</div>*/}
            {/*        ) : (*/}
            {/*            <div className='loading'>Connect Metamask</div>*/}
            {/*        )}*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/*<div className="bid-info-container">*/}
            {/*    TotalBid amount here {totalBidInfo.totalBidAmount}*/}
            {/*</div>*/}

            <EventActivityTable
                market={marketAddress}
                eventData={events}
                setEvents={setEvents}
            />
        </div>
    );
};
export default MarketInfo;
