import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Import your custom CSS file
import PieChart from '../components/PieChart';
import Config from "../config";

interface EventData {
  event: string;
  market: string;
  isResolved: boolean;
  values : {
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
}


const Dashboard: React.FC<UserDetailsProps> = ({user}) => {
  const [dashboardData, setDashboardData] = useState<{
    totalAmountInvested: number;
    details: EventData[];
  } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await axios.get(`${Config.apiBaseUrl}/event/interactions/all?user=${user}`); // Replace with your API endpoint
        console.log("result ", result.data.result)
        setDashboardData(result.data.result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Handle error as needed
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

  return (
    <div className="dashboard-container">
      {user ? dashboardData ? (
        <>
          <h1>My Dashboard</h1>
          <div className="summary">
            <h2>Total Amount Invested</h2>
            <p>{formatTokenAmount(dashboardData.totalAmountInvested.toString())} USDT</p>
          </div>
          <PieChart details={dashboardData.details}/>
          <div className="events-list">
            <h2>Recent Events</h2>
            <div className="event-items">
              {dashboardData.details.map((event, index) => (
                <div key={index} className="event-item">
                  <p><strong>Event:</strong> {event.event}</p>
                  <p><strong>Market:</strong> {event.market}</p>
                  <p><strong>Amount:</strong> {formatTokenAmount(event.values.amount)} USDT</p>
                  <p><strong>Timestamp:</strong> {new Date(event.timestamp * 1000).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      ) : <div>Connect Wallet</div> }
    </div>
  );
};

export default Dashboard;
