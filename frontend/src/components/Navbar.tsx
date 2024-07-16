import React, { useEffect } from 'react';
import './Navbar.css';
import Web3 from 'web3';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Config from "../config";

interface NavbarProps {
    connectedAccount: string;
    accountBalance: number;
    setConnectedAccount: React.Dispatch<React.SetStateAction<string>>;
    setAccountBalance: React.Dispatch<React.SetStateAction<number>>;
}

const Navbar = ({ connectedAccount, accountBalance, setAccountBalance, setConnectedAccount }: NavbarProps) => {

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("chainChanged", () => {
                window.location.reload();
            });
            window.ethereum.on("accountsChanged", () => {
                window.location.reload();
            });
        }
    });

    const handleConnectWallet = async () => {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const connectedAddress = accounts[0];
            setConnectedAccount(connectedAddress);

            const balance = await axios.post(`${Config.apiBaseUrl}/token/balance`, {
                account: connectedAddress,
                token: "0xab4f68A873eC164D9d52467D92469fC313Cf64F6"
            });
            setAccountBalance(Number((Number(balance.data.result) / 10 ** 18).toFixed(2)));
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
        }
    };

    const handleDisconnectWallet = () => {
        setConnectedAccount('');
        setAccountBalance(0);
    };

    return (
        <div className="navbar">
            <h1 className="navbar-title">Trust Bid</h1>
            <div className="navbar-connect">
                {connectedAccount ? (
                    <button className="disconnect-btn" onClick={handleDisconnectWallet}>
                        <div className="navbar-userinfo">
                            <div className="address">
                                {connectedAccount.substring(0, 5) + "..." + connectedAccount.substring(connectedAccount.length - 5)}
                            </div>
                            <div>/</div>
                            <div className="balance">{accountBalance} USDT</div>
                        </div>
                    </button>
                ) : (
                    <button className="connect-btn" onClick={handleConnectWallet}>
                        Connect Wallet
                    </button>
                )}
                {/* Dashboard button */}
                <Link to="/dashboard" className="dashboard-link">
                    Dashboard
                </Link>
            </div>
        </div>
    );
}

export default Navbar;
