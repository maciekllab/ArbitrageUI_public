import React from 'react';
import './App.css';
import { AppBar, Box, CssBaseline, Drawer, Toolbar, Typography } from '@mui/material';
import AppRoutes from './AppRoutes';
import MyNavigation from './components/MyNavigation';
import MyToolbar from './components/MyToolbar';
import { DataProvider } from './data/DataProvider';
import { AutoRefresh } from './data/AutoRefresh';
import { SnackbarProvider } from 'notistack';
import { LoadingProvider } from './components/LoadingScreen';

const drawerWidth = 200;

function App() {

  return (
    <SnackbarProvider maxSnack={4}>
      <LoadingProvider>
        <DataProvider>
          <AutoRefresh/>
          <Box sx={{ display: 'flex'}}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
              <MyToolbar/> 
            </AppBar>
            <Drawer
              PaperProps={{
                sx: {
                  backgroundColor: "grey.50",
                }
              }}
              variant="permanent"
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
              }}
            >
              <Toolbar />
              <Box sx={{ overflow: 'auto' }}>
                <MyNavigation />
              </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 4, marginTop:8, overflowX: 'hidden'}}>
              <AppRoutes />
            </Box>
        </Box>
        </DataProvider>
      </LoadingProvider>
    </SnackbarProvider>
  );
}

export default App;
