import React, {useEffect, useState} from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDataContext, useFetchData } from '../data/DataProvider';
import { ApiConnectionError } from '../api-client/client';
import ConnectButton from './ConnectWalletButton';


export default function MyToolbar() {    
 
  const {last_refresh_time} = useDataContext();
  const {fetchData} = useFetchData();

  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [refreshTime, setRefreshTime] = useState('Not refreshed');

  const handleClose = () => {
    setOpen(false);
    setErrorMessage('');
  };

  const handleFetchDataError = (error: Error) => {
    if (error instanceof ApiConnectionError) {
      setErrorTitle("API connection error")
      setErrorMessage(`You may not be connected to Arbitrage API - check if connection is estabilished`);
    } else {
      setErrorTitle(`${error.name}`)
      setErrorMessage(`${error.message}`);
    }
    //setOpen(true);
  };

  const refreshData = async () => {
    try{
      await fetchData();
    } catch (err){
      if (err instanceof Error){
        handleFetchDataError(err)      
      }
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    setRefreshTime(last_refresh_time.toLocaleTimeString());
  }, [last_refresh_time]);

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{errorTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          Arbirage UI
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 0 }}>
            <Typography variant="body1">
              Recent data fetch time:
            </Typography>
            <Typography variant="body2">
              {refreshTime}
            </Typography>
          </Box>

          <Tooltip title="Fetch latest data and refresh grids">
            <IconButton sx = {{mr : 2}} color="inherit" onClick={refreshData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <ConnectButton  />
        </Box>
      </Toolbar>
    </>
  );
}