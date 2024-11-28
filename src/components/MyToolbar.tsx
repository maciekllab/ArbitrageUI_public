import React, {useEffect, useState} from 'react';
import { Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDataContext, useFetchData } from '../data/DataProvider';
import ConnectButton from './ConnectWalletButton';


export default function MyToolbar() {    
 
  const {last_refresh_time} = useDataContext();
  const {fetchData} = useFetchData();

  const [refreshTime, setRefreshTime] = useState('Not refreshed');

  const refreshData = async () => {
    try{
      await fetchData();
    } catch (err){
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