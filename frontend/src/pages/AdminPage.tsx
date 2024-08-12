import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import "./AdminPage.css";

interface UserDetailsProps {
  user: string;
}

interface teamInfo {
    id: string,
    title: string,
    logo: string
}

const AdminPage: React.FC<UserDetailsProps> = ({ user }) => {
  const [owner, setOwner] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<teamInfo[] | null>(null);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const { data } = await axios.get(`${config.apiBaseUrl}/market/admin`);
        setOwner(data.result ?? null); // Use nullish coalescing to handle undefined
      } catch (err) {
        setError("Error fetching owner data.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOwner();
    } else {
      setLoading(false); // No need to fetch owner if user is not provided
    }
  }, [user]);

  useEffect(() => {
    try {
        const fetchTeams = async () => {
            const { data } = await axios.get(`${config.apiBaseUrl}/game/teams`);
            console.log("teams ",data);
            setTeams(data.result);
        }
        fetchTeams();
    } catch(err) {
        setError("Error fetching teams data.");
    } finally {
        setLoading(false);
    }
  },[]);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    console.log("Team 1:", team1);
    console.log("Team 2:", team2);
    console.log("End Time:", endTime);
    // Handle form submission logic here
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Please connect MetaMask</div>;
  }

  if(owner != user){
    <div>Invalid user</div>
  }

  return  <div>
    <div className="create-event-area">
        <h3>Create Event</h3>
        <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="team1">Select Team 1:</label>
        <select
          id="team1"
          value={team1}
          onChange={(e) => setTeam1(e.target.value)}
        >
          <option value="">--Select Team 1--</option>
          {teams ? teams.map((team, index) => (
            <option key={index} value={team.id}>
              {team.title}
            </option>
          )) : <option>No teams</option>}
        </select>
      </div>
      <div>
        <label htmlFor="team2">Select Team 2:</label>
        <select
          id="team2"
          value={team2}
          onChange={(e) => setTeam2(e.target.value)}
        >
          <option value="">--Select Team 2--</option>
          {teams ? teams.map((team, index) => (
            <option key={index} value={team.id}>
              {team.title}
            </option>
          )) : <option>No teams</option>}
        </select>
      </div>
      <div>
        <label htmlFor="endTime">End Time:</label>
        <input
          type="datetime-local"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
    </div>
  </div>;
};

export default AdminPage;