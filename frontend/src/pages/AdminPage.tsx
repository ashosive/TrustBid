import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./AdminPage.css";
import { Tabs, Tab, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import dayjs from 'dayjs';

interface UserDetailsProps {
  user: string;
}

interface TeamInfo {
  id: string;
  title: string;
  logo: string;
}

interface Match {
  awayTeam: string;
  homeTeam: string;
  gameInfo: string;
  date: string;
  day: string;
  awayTeamLogo?: string;
  homeTeamLogo?: string;
}

interface EventData {
  id: string;
  marketAddress: string;
  numberOfOptions: number;
  expirationTime: string;
  owner: string;
  eventTitle: string;
  teams: string[];
  teamDetails: {
    id: string;
    symbol: string;
    name: string;
    logo: string;
  }[];
}

const AdminPage: React.FC<UserDetailsProps> = ({ user }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamInfo[] | null>(null);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [gameTime, setGameTime] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await axios.get(`${config.apiBaseUrl}/game/teams`);
        setTeams(data.result);
      } catch (err) {
        setError("Error fetching teams data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchMatches = async () => {
      try {
        const { data } = await axios.get(`${config.apiBaseUrl}/game/matches/upcoming/3-days`, {
          params: { date: new Date().toISOString().split('T')[0] }
        });

        const matchData: Match[] = [];

        const fetchTeamLogo = async (teamSymbol: string) => {
          try {
            const { data } = await axios.get(`${config.apiBaseUrl}/game/team-info`, {
              params: { teamSymbol },
            });
            return data.result.logo;
          } catch (err) {
            console.error("Error fetching team logo:", err);
            return "";
          }
        };

        for (const matchDay of data.result) {
          for (const game of matchDay.games) {
            const homeTeamLogo = await fetchTeamLogo(game.homeTeam);
            const awayTeamLogo = await fetchTeamLogo(game.awayTeam);

            const matchWithLogos: Match = {
              ...game,
              date: matchDay.date,
              homeTeamLogo,
              awayTeamLogo,
            };

            matchData.push(matchWithLogos);
          }
        }

        setMatches(matchData);

      } catch (err) {
        setError("Error fetching matches data.");
      }
    };

    const fetchEvents = async () => {
      try {
        const { data: marketData } = await axios.get(`${config.apiBaseUrl}/subgraph/markets`);
        console.log("Market Data:", marketData);

        const eventPromises = marketData.result.map(async (market: any) => {
          try {
            const { data: decodedData } = await axios.post(`${config.apiBaseUrl}/event/decode`, {
              eventHash: market.eventHash
            });
            console.log("Decoded Data:", decodedData);

            return {
              id: market.id,
              marketAddress: market.marketAddress,
              numberOfOptions: market.numberOfOptions,
              expirationTime: market.expirationTime,
              owner: market.owner,
              eventTitle: decodedData.result[0],
              teams: decodedData.result[1],
              teamDetails: decodedData.result[2].map((teamDetail: any) => ({
                id: teamDetail[0],
                symbol: teamDetail[1],
                name: teamDetail[2],
                logo: teamDetail[3]
              }))
            };
          } catch (decodeError) {
            console.error(`Error decoding event for market ${market.id}:`, decodeError);
            return null; // Return null for this event if decoding fails
          }
        });

        const eventData = await Promise.all(eventPromises);
        setEvents(eventData.filter(event => event !== null)); // Filter out any null events
      } catch (err) {
        console.error("Error fetching events data:", err);
        setError("Error fetching events data.");
      }
    };

    fetchTeams();
    fetchMatches();
    fetchEvents();
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Team 1:", team1);
    console.log("Team 2:", team2);
    console.log("Game Time:", gameTime);
    // Handle form submission logic here
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
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

  return (
    <div className="admin-page">
      <div className="form-section">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="team1" className="form-label">Select Team A:</label>
            <select
              id="team1"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              className="form-select"
            >
              <option value="">Blue jays</option>
              {teams ? (
                teams.map((team, index) => (
                  <option key={index} value={team.id}>
                    {team.title}
                  </option>
                ))
              ) : (
                <option>No teams</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="team2" className="form-label">Select Team B:</label>
            <select
              id="team2"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              className="form-select"
            >
              <option value="">Yankees</option>
              {teams ? (
                teams.map((team, index) => (
                  <option key={index} value={team.id}>
                    {team.title}
                  </option>
                ))
              ) : (
                <option>No teams</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="gameTime" className="form-label">Select Game Time:</label>
            <select
              id="gameTime"
              value={gameTime}
              onChange={(e) => setGameTime(e.target.value)}
              className="form-select"
            >
              <option value="">11:20 AM</option>
              <option value="2:00 PM">2:00 PM</option>
              <option value="3:00 PM">3:00 PM</option>
              <option value="4:00 PM">4:00 PM</option>
            </select>
          </div>
          <div className="button-group">
            <button type="button" className="clear-btn">clear</button>
            <button type="submit" className="save-btn">save</button>
          </div>
        </form>
      </div>

      <div className="matches-section">
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="matches tabs">
          <Tab label="Matches" />
          <Tab label="Events" />
        </Tabs>

        <TabPanel value={tabIndex} index={0}>
          <div className="matches">
            <h2>Matches</h2>
            <TableContainer component={Paper}>
              <Table className="matches-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Home Team</TableCell>
                    <TableCell>Away Team</TableCell>
                    <TableCell>Game Info</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches.length > 0 ? (
                    matches.map((match, index) => (
                      <TableRow key={index}>
                        <TableCell>{match.date}</TableCell>

                        <TableCell className="table-cell-teams">
                          <div className="team-info">
                            <img src={match.homeTeamLogo} alt={match.homeTeam} className="team-logo-small" />
                            <span>{match.homeTeam}</span>
                          </div>
                        </TableCell>
                        <TableCell className="table-cell-teams">
                          <div className="team-info">
                            <img src={match.awayTeamLogo} alt={match.awayTeam} className="team-logo-small" />
                            <span>{match.awayTeam}</span>
                          </div>
                        </TableCell>
                        <TableCell>{match.gameInfo}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No matches available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <div className="events-section">
            <h2>Events</h2>
            <TableContainer component={Paper}>
              <Table className="event-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Event Title</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Expiration Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Teams</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.length > 0 ? (
                    events.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>{event.eventTitle}</TableCell>
                        <TableCell>{event.owner}</TableCell>
                        <TableCell>{dayjs.unix(parseInt(event.expirationTime)).format('YYYY-MM-DD HH:mm')}</TableCell>
                        <TableCell>{dayjs().isBefore(dayjs.unix(parseInt(event.expirationTime))) ? 'Active' : 'Expired'}</TableCell>
                        <TableCell className="table-cell-teams">
                          {event.teamDetails.map((team, idx) => (
                            <div key={idx} className="team-info">
                              <img src={team.logo} alt={team.name} className="team-logo-small" />
                              <span>{team.name}</span>
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No events available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </TabPanel>
      </div>
    </div>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default AdminPage;
