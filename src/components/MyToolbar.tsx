import React, {useEffect, useState} from 'react';
import { Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDataContext } from '../data/DataProvider';
import ConnectButton from './ConnectWalletButton';
import { Padding } from '@mui/icons-material';


export default function MyToolbar() {    
 
  const {last_refresh_time, fetchData} = useDataContext();

  const [refreshTime, setRefreshTime] = useState('Not refreshed');

  const refreshData = async () => {
    try{
      await fetchData();
    } catch (err){
    }
  }

  useEffect(() => {
    const emptyDate = new Date(0);

    if (last_refresh_time.getTime() === emptyDate.getTime()){
      setRefreshTime('Not refreshed');
    } else {
      setRefreshTime(last_refresh_time.toLocaleTimeString());
    }
  }, [last_refresh_time]);

  return (
    <>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <img src={`${process.env.PUBLIC_URL}/favicon.ico`} width={36} height={36}></img>
        <Typography variant="h6" component="div"  sx={{ml:1}}>
         ArbitrageUI
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