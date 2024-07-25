import axios from 'axios';
import React, { useEffect, useState } from 'react'
import './EventActivityTable.css'
import Config from "../config";

// Define types for event data
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

const EventActivityTable = ({market}: {market: string}) => {
    const [events, setEvents] = useState<EventData[]>([]);

    useEffect(() => {
        const getActivities = async () => {
            try {
                const result = await axios.get(`${Config.apiBaseUrl}/event/interactions/all?market=${market}`);
                console.log("result ", result.data.result);
                setEvents(result.data.result);

            } catch(err: any) {
                console.log("error fetching activities of market ", err);
                alert(err.message);
            }
        }

        if(market){
            getActivities();
        }
    },[market]);

    const convertBlockNumberToTime = (timestamp: string) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleString();
    };

    return (
        <>
            {
                events.length > 0 ? events.map((event, index) => (
                    <div key={index} className="event">
                        <div className="event-row">
                            <p><strong>Event Name:</strong> {event.eventName}</p>
                            {event.eventName === "MarketCreated" && (
                                <>
                                    <p><strong>Number of Options:</strong> {event.values.numberOfOptions}</p>
                                    <p><strong>at</strong> {convertBlockNumberToTime(event.timestamp)}</p>
                                </>
                            )}
                            {event.eventName === "BetPlaced" && (
                                <>
                                    <p><strong>User:</strong> {event.values.user ? `${event.values.user.substring(0, 5)}...${event.values.user.substring(event.values.user.length - 5)}` : 'N/A'}</p>
                                    <p><strong>Amount:</strong> {Number(event.values.amount) / 10**18}</p>
                                    <p><strong>Option:</strong> {event.values.option}</p>
                                    <p><strong>at</strong> {convertBlockNumberToTime(event.timestamp)}</p>
                                </>
                            )}
                        </div>
                    </div>
                )) : <div className="loading">Loading.....</div>
            }
        </>
    );
}

export default EventActivityTable
