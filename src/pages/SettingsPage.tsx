import React, { useEffect, useState } from 'react';
import { Container, Typography, FormControlLabel, Checkbox, TextField, Box, Paper, Button, Grid, Stack } from '@mui/material';
import { useDataContext, useSettings } from '../data/DataProvider';
import { APISettings, UISettings } from '../data/DataModels';
import { useSystemNotification } from '../data/SystemNotification';
import useSnackbarUtils from '../components/SnackbarUtils';
import { useLoading } from '../components/LoadingScreen';

export default function SettingsPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState('');
  const [apiScanInterval, setApiScanInterval] = useState('');
  const [refreshError, setRefreshError] = useState(false);
  const [apiScanError, setApiScanError] = useState(false);
  const [altcoinsMinProfit, setAltcoinsMinProfit] = useState("");
  const [altcoinsMinProfitError, setAltcoinsMinProfitError] = useState(false);
  const [ethDerivativesMinProfit, setEthDerivativesMinProfit] = useState("");
  const [ethDerivativesMinProfitError, setEthDerivativesMinProfitError] = useState(false);
  const {setSettings} = useSettings();
  const { settings, loadSettings, saveSettings} = useDataContext();
  const {requestPermission ,sendNotification} = useSystemNotification();
  const {showSnackbar} = useSnackbarUtils(); 
  const {showLoadingScreen, hideLoadingScreen} = useLoading();

  useEffect(() => {
    const loadSettingsData = async () => {
      setPushNotifications(settings.uiSettings.pushNotifications);
      setAutoRefresh(settings.uiSettings.autoRefresh);
      setRefreshInterval(settings.uiSettings.refreshInterval.toString());

      showLoadingScreen();
      await loadSettings();
      hideLoadingScreen();
      setApiScanInterval(settings.apiSettings.apiScanInterval.toString());
      setAltcoinsMinProfit(settings.apiSettings.altcoinsMinProfit.toString());
      setEthDerivativesMinProfit(settings.apiSettings.ethDerivativesMinProfit.toString());
  };

  loadSettingsData();
  }, []);

  const validate_settings = () => {
    let isOK = true;
    const parsedRefreshInterval = parseInt(refreshInterval);
    if (isNaN(parsedRefreshInterval) || parsedRefreshInterval < 1 ){
      setRefreshError(true);
      isOK = false;
    } else {
      setRefreshError(false);
      setRefreshInterval(parsedRefreshInterval.toString());
    }

    const parsedApiScanInterval = parseInt(apiScanInterval);
    if (isNaN(parsedApiScanInterval) || parsedApiScanInterval < 60){
      setApiScanError(true);
      isOK = false;
    } else {
      setApiScanError(false);
      setApiScanInterval(parsedApiScanInterval.toString());
    }

    const parsedAltcoinsMinProfit = parseFloat(altcoinsMinProfit);
    if (isNaN(parsedAltcoinsMinProfit) || parsedAltcoinsMinProfit <= 0){
      setAltcoinsMinProfitError(true);
      isOK = false;
    } else {
      setAltcoinsMinProfitError(false);
      setAltcoinsMinProfit(parsedAltcoinsMinProfit.toString());
    }

    const parsedEthDerivativesMinProfit = parseFloat(ethDerivativesMinProfit);
    if (isNaN(parsedEthDerivativesMinProfit) || parsedEthDerivativesMinProfit <= 0){
      setEthDerivativesMinProfitError(true);
      isOK = false;
    } else {
      setEthDerivativesMinProfitError(false);
      setEthDerivativesMinProfit(parsedEthDerivativesMinProfit.toString());
    }

    return isOK;
  }

  const saveSettingsToMemory = () => {
    localStorage.setItem('pushNotifications', JSON.stringify(pushNotifications));
    localStorage.setItem('autoRefresh', JSON.stringify(autoRefresh));
    localStorage.setItem('refreshInterval', refreshInterval.toString());
  }

  const saveSettingsToDatabase = async () => {
    showLoadingScreen();
    let isOK = false;
    try{
      isOK = await saveSettings('apiScanInterval', apiScanInterval);
      isOK = await saveSettings('altcoinsMinProfit', altcoinsMinProfit) && true;
      isOK = await saveSettings('ethDerivativesMinProfit', ethDerivativesMinProfit) && true;
    }
    catch(error){

    } finally {
      hideLoadingScreen();
    }
    return isOK;
  }

  const handlePushNotificationsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPushNotifications(event.target.checked);
  };
  const handleAutoRefreshChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoRefresh(event.target.checked);
  };
  const handleRefreshIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const value = event.target.value;
    setRefreshInterval(value);
  };
  const handleApiScanIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setApiScanInterval(value);
  };
  const handleAltcoinsMinProfitIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAltcoinsMinProfit(value);
  };
  const handleEthDerivativesMinProfitIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEthDerivativesMinProfit(value);
  };

  const handleSaveSettings = async () => {
    if (pushNotifications){
      requestPermission();
    }
    if (validate_settings()) {
      const apiSettings : APISettings = {
        apiScanInterval: parseInt(apiScanInterval),
        altcoinsMinProfit: parseFloat(altcoinsMinProfit),
        ethDerivativesMinProfit: parseFloat(ethDerivativesMinProfit)
      }
      const uiSettings : UISettings = {
        pushNotifications: pushNotifications,
        autoRefresh: autoRefresh,
        refreshInterval: Number(refreshInterval)
      }
      setSettings({
        apiSettings: apiSettings,
        uiSettings: uiSettings
      });
      saveSettingsToMemory();
      const dbSuccess = await saveSettingsToDatabase();
      if (dbSuccess){
        showSnackbar('Settings saved successfully!', 'success');
      } else {
        showSnackbar('Failed to save settings to database', 'error' );
      }
    }
  };

  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 3, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
            UI settings
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <TextField
            label="Auto refresh frequency (seconds)"
            value={refreshInterval}
            onChange={handleRefreshIntervalChange}
            type="number" 
            error={refreshError}
            helperText={refreshError ? 'Please enter a valid positive number' : ''}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={autoRefresh}
                onChange={handleAutoRefreshChange}
                name="autoRefresh"
                color="primary"
              />
            }
            label="Auto Refresh"
          />
        </Box>

        <Box display="flex" alignItems="center" mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={pushNotifications}
                onChange={handlePushNotificationsChange}
                name="pushNotifications"
                color="primary"
              />
            }
            label="Push notifications about new deals"
          />
        </Box>
      </Paper>
      <Paper elevation={3} sx={{ padding: 3, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
            Arbitrage API Settings
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            General
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
                label="Interval between scans (seconds)"
                value={apiScanInterval}
                onChange={handleApiScanIntervalChange}
                type="number"
                error={apiScanError}
                helperText={apiScanError ? 'Please enter a valid positive number greater or equal 60' : ''}
                fullWidth
            />
        </Stack>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Deals minimum profit filter
        </Typography>
        <Stack direction="row" spacing={2}>
            <TextField
                label="Altcoins minimum profit (%)"
                value={altcoinsMinProfit}
                onChange={handleAltcoinsMinProfitIntervalChange}
                type="number"
                error={altcoinsMinProfitError}
                helperText={altcoinsMinProfitError ? 'Please enter a valid positive number' : ''}
                fullWidth
            />
            <TextField
                label="ETH derivatives minimum profit (%)"
                value={ethDerivativesMinProfit}
                onChange={handleEthDerivativesMinProfitIntervalChange}
                type="number"
                error={ethDerivativesMinProfitError}
                helperText={ethDerivativesMinProfitError ? 'Please enter a valid positive number' : ''}
                fullWidth
            />
        </Stack>
      </Paper>

      <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Box>
    </Container>
  );
}
