import React, { useEffect, useState } from 'react';
import './MarketInfo.css';
import axios from 'axios';
import getReason from '../utils/getReason';
import waitForTransactionConfirmation from '../utils/waitForTxn';
import sendTxn from '../utils/sendTxn';
import EventActivityTable from '../components/EventActivityTable';
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
    title: string;
    options: string[];
    from: string;
}

interface TotalOptions {
    totalBidAmount: number;
    options: number[];
}

const MarketInfo = ({
    blockTimestamp,
    eventHash,
    expirationTime,
    id,
    marketAddress,
    numberOfOptions,
    owner,
    startTime,
    title,
    options,
    from
}: Market) => {
    const [selectedOption, setSelectedOption] = useState<string | null>('0');
    const [amount, setAmount] = useState<number>(0);
    const [userBidInfo, setUserBidInfo] = useState<number[]>([])
    const [totalBidInfo, setTotalBidInfo] = useState<TotalOptions>({
        totalBidAmount: 0,
        options: []
    });

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
        getBidInfo();
        totalBetsInfo().then(r => {});
    }, []);

    return (
        <div className="market-info">
            <h2 className="market-title">{title}</h2>
            <div className="market-detail">
                <strong>Expiration Time:</strong> {expirationTime}
            </div>
            <div className="market-detail">
                <strong>Market Address:</strong> {marketAddress}
            </div>
            <div className="market-detail">
                <strong>Number of Options:</strong> {numberOfOptions}
            </div>
            <div className="market-detail">
                <strong>Owner:</strong> {owner}
            </div>
            <div className="market-detail">
                <strong>Start Time:</strong> {startTime}
            </div>
            <div className="market-select">
                <label htmlFor="options">Choose an option:</label>
                <select
                    id="options"
                    value={selectedOption || ''}
                    onChange={handleOptionSelect}
                >
                    {options.map((option, i) => (
                        <option value={i} key={i}>
                            {option + " - " + String(totalBidInfo.options[i] + ' USDT')}
                        </option>
                    ))}
                </select>
            </div>
            <div className="market-bid">
                <input type="number" placeholder="Enter your bid" onChange={handleAmountChange} />
                <button onClick={getBidTxn} disabled={userBidInfo[0] > 0 ? true : false}>{userBidInfo[0] > 0 ? 'bidded' : 'Bid'}</button>
                <button onClick={getClaimTxn}>Claim</button>
            </div>
            <div className="user-info">
                User Bet Info
                <div className="user-bid-info">
                    {userBidInfo.length > 0 ? (
                        userBidInfo[0] === 0 && userBidInfo[1] === 0 ? (
                            <div className="not-bid">Not Bid Yet!</div>
                        ) : (
                            <div>
                                <div>Option: <span className="option">{options[userBidInfo[1]]}</span></div>
                                <div>Amount: <span className="amount">{userBidInfo[0] / 10**18}</span></div>
                            </div>
                        )
                    ) : (
                        <div className="loading">Loading....</div>
                    )}
                </div>
            </div>
            <div className="bid-info-container">
              TotalBid amount here {totalBidInfo.totalBidAmount}
            </div>
            <EventActivityTable market={marketAddress}/>
        </div>
    );
};

//   {/* {Object.keys(totalBidInfo).length > 0 ? (
//                     bidAmount === 0 && bidOption === 0 ? (
//                         <div className="not-bid">Not Bid Yet!</div>
//                     ) : (
//                         <div className="bid-info">
//                             {/*<div>Option: <span className="option">{options[bidOption]}</span></div>*/}
//                             <div>Total Bet Amount: <span className="amount">{bidAmount / 10**18}</span></div>
//                         </div>
//                     )
//                 ) : (
//                     <div className="loading">Loading....</div>
//                 )} */}


export default MarketInfo;
