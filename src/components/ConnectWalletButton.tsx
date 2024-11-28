import { useState, useEffect } from "react";
import { ethers } from 'ethers';
import Button from '@mui/material/Button';
import WalletIcon from '@mui/icons-material/WalletOutlined';
import useSnackbarUtils from "./SnackbarUtils";

function ConnectButton() {
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState<bigint | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const {showSnackbar} = useSnackbarUtils(); 

  async function requestAccount() {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts[0]);
      setWalletAddress(accounts[0]);
      setShowInfo(true);
    } catch (error) {
      console.log("Error connecting...")
    }
  }

  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(walletAddress);
        console.log(ethers.formatEther(balance));
        setBalance(balance);
      } catch (error) {
        console.log(error);
      }
    } 
    else {
      showSnackbar("Metamask browser extension is not installed", 'warning')
    }
  }

  useEffect(() => {
    if (!walletAddress) {
      connectWallet();
    }
  }, [walletAddress])

  return (
    <Button color= "secondary" variant= 'contained' onClick={connectWallet} startIcon={<WalletIcon />}>
        {walletAddress == "" ? "Connect" : "Connected"}
    </Button>
  );
}

export default ConnectButton;