import React, { useEffect, useState } from 'react';
import { Container, Typography, FormControlLabel, Checkbox, TextField, Box, Paper, Button, Stack } from '@mui/material';
import { useDataContext, useSettings } from '../data/DataProvider';
import { APISettings, UISettings } from '../data/DataModels';
import { useSystemNotification } from '../tools/SystemNotification';
import useSnackbarUtils from '../tools/SnackbarUtils';
import { useLoading } from '../components/LoadingScreen';
import SaveIcon from '@mui/icons-material/Save';
import AttachEmailIcon from '@mui/icons-material/AttachEmail';
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';


export default function SettingsPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showOnlyCrosschain, setShowOnlyCrosschain] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState('');
  const [apiScanInterval, setApiScanInterval] = useState('');
  const [refreshError, setRefreshError] = useState(false);
  const [apiScanError, setApiScanError] = useState(false);
  const [altcoinsMinProfit, setAltcoinsMinProfit] = useState("");
  const [altcoinsMinProfitError, setAltcoinsMinProfitError] = useState(false);
  const [stablecoinsMinProfit, setStablecoinsMinProfit] = useState("");
  const [stablecoinsMinProfitError, setStablecoinsMinProfitError] = useState(false);
  const [ethDerivativesMinProfit, setEthDerivativesMinProfit] = useState("");
  const [ethDerivativesMinProfitError, setEthDerivativesMinProfitError] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [notificationsMinProfit, setNotificationsMinProfit] = useState('');
  const [notificationsProfitError, setNotificationsProfitError] = useState(false);
  const {setSettings} = useSettings();
  const { settings, loadSettings, saveSettings, subscribe_notifications, unsubscribe_notifications} = useDataContext();
  const {requestPermission ,sendNotification} = useSystemNotification();
  const {showSnackbar} = useSnackbarUtils(); 
  const {showLoadingScreen, hideLoadingScreen} = useLoading();

  useEffect(() => {
    const loadSettingsData = async () => {
      setPushNotifications(settings.uiSettings.pushNotifications);
      setAutoRefresh(settings.uiSettings.autoRefresh);
      setShowOnlyCrosschain(settings.uiSettings.showOnlyCrosschain);
      setRefreshInterval(settings.uiSettings.refreshInterval.toString());

      showLoadingScreen();
      await loadSettings();
      hideLoadingScreen();
      setApiScanInterval(settings.apiSettings.apiScanInterval.toString());
      setAltcoinsMinProfit(settings.apiSettings.altcoinsMinProfit.toString());
      setStablecoinsMinProfit(settings.apiSettings.stablecoinsMinProfit.toString());
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

    const parsedStablecoinsMinProfit = parseFloat(stablecoinsMinProfit);
    if (isNaN(parsedStablecoinsMinProfit) || parsedStablecoinsMinProfit <= 0){
      setStablecoinsMinProfitError(true);
      isOK = false;
    } else {
      setStablecoinsMinProfitError(false);
      setStablecoinsMinProfit(parsedStablecoinsMinProfit.toString());
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
    localStorage.setItem('showOnlyCrosschain', showOnlyCrosschain.toString());
  }

  const saveSettingsToDatabase = async () => {
    showLoadingScreen();
    let isOK = false;
    try{
      isOK = await saveSettings('apiScanInterval', apiScanInterval);
      isOK = await saveSettings('altcoinsMinProfit', altcoinsMinProfit) && true;
      isOK = await saveSettings('stablecoinsMinProfit', stablecoinsMinProfit) && true;
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
  const handleShowOnlyCrosschainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowOnlyCrosschain(event.target.checked);
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
  const handleStablecoinsMinProfitIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setStablecoinsMinProfit(value);
  };
  const handleEthDerivativesMinProfitIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEthDerivativesMinProfit(value);
  };
  const handleNotificationsMinProfitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNotificationsMinProfit(value);
  };
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserEmail(event.target.value);
  };

  const handleSaveSettings = async () => {
    if (pushNotifications){
      requestPermission();
    }
    if (validate_settings()) {
      const apiSettings : APISettings = {
        apiScanInterval: parseInt(apiScanInterval),
        altcoinsMinProfit: parseFloat(altcoinsMinProfit),
        stablecoinsMinProfit: parseFloat(stablecoinsMinProfit),
        ethDerivativesMinProfit: parseFloat(ethDerivativesMinProfit)
      }
      const uiSettings : UISettings = {
        pushNotifications: pushNotifications,
        autoRefresh: autoRefresh,
        refreshInterval: Number(refreshInterval),
        showOnlyCrosschain: showOnlyCrosschain
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

  const handleSubscribe = async () => {

    const parsedNotificationsMinProfit = parseFloat(notificationsMinProfit);
    if (isNaN(parsedNotificationsMinProfit) || parsedNotificationsMinProfit <= 0){
      setNotificationsProfitError(true);
      showSnackbar("Given notifications profit is invalid", "error");
      return;
    } else {
      setNotificationsProfitError(false);
      setNotificationsMinProfit(parsedNotificationsMinProfit.toString());
    }

    showLoadingScreen();
    try{
      const result = await subscribe_notifications(userEmail, parsedNotificationsMinProfit);
      if (result.status == 200){
        showSnackbar("Activation link has been sent, please, verify your email", "success");
      } else if (result.status == 202 || result.status == 409){
        showSnackbar(result.info, "info");
      } else {
        showSnackbar(result.info, "error");
      }
    } finally {
      hideLoadingScreen();
    }
  };

  const handleUnsubscribe = async () => {
    showLoadingScreen();
    try{
      const result = await unsubscribe_notifications(userEmail);
      if (result.status == 200){
        showSnackbar("Email unregistered successfully", "success");
      } else if (result.status == 404){
        showSnackbar(result.info, "info");
      } else {
        showSnackbar(result.info, "error");
      }
    } finally {
      hideLoadingScreen();
    }
  };

  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 2, mt: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
          Arbitrage UI settings
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 1 }}>
          Auto refresh
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <TextField
            label="Auto refresh frequency (seconds)"
            value={refreshInterval}
            onChange={handleRefreshIntervalChange}
            type="number"
            error={refreshError}
            helperText={refreshError ? 'Please enter a valid positive number' : ''}
            sx={{ marginBottom: 0.5 }}
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
            label="Auto refresh"
            sx={{ marginBottom: 0.5 }}
          />
        </Box>
        <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 1 }}>
          Data filtering
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          {/* <TextField
            label="Auto refresh frequency (seconds)"
            value={refreshInterval}
            onChange={handleRefreshIntervalChange}
            type="number"
            error={refreshError}
            helperText={refreshError ? 'Please enter a valid positive number' : ''}
            sx={{ marginBottom: 0.5 }}
          /> */}
          <FormControlLabel
            control={
              <Checkbox
                checked={showOnlyCrosschain}
                onChange={handleShowOnlyCrosschainChange}
                name="showOnlyCrosschain"
                color="primary"
              />
            }
            label="Show only crosschain deals"
            sx={{ marginBottom: 0.5 }}
          />
        </Box>
      </Paper>
      <Paper elevation={3} sx={{ padding: 3, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
            Arbitrage scanner settings
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
                label="Stablecoins minimum profit (%)"
                value={stablecoinsMinProfit}
                onChange={handleStablecoinsMinProfitIntervalChange}
                type="number"
                error={stablecoinsMinProfitError}
                helperText={stablecoinsMinProfitError ? 'Please enter a valid positive number' : ''}
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

      <Box display="flex" justifyContent="center" mt={3} mb={4}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save settings
        </Button>
      </Box>

      <Paper elevation={3} sx={{ padding: 2, mt: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
          Notifications
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 1 }}>
          System notifications
        </Typography>
        <Box display="flex" alignItems="center" mt={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={pushNotifications}
                onChange={handlePushNotificationsChange}
                name="pushNotifications"
                color="primary"
              />
            }
            label="Send system notifications when new data arrives"
          />
        </Box>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Email notifications
        </Typography>
        <Stack direction="row" spacing={2}>
            <TextField
                label="Email"
                value={userEmail}
                onChange={handleEmailChange}
                type="email"
                sx={{ width: '32%' }}
            />
            <TextField
              label="Notify when profit above (%)"
              value={notificationsMinProfit}
              onChange={handleNotificationsMinProfitChange}
              type="number"
              error={notificationsProfitError}
              helperText={notificationsProfitError ? 'Please enter a valid positive number' : ''}
              sx={{ marginBottom: 0.5, width:'32%' }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AttachEmailIcon />}
              onClick={handleSubscribe}
              sx={{textTransform: "none" }}
            >
              Subscribe
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<UnsubscribeIcon />}
              onClick={handleUnsubscribe}
              sx={{textTransform: "none" }}
            >
              Unsubscribe
            </Button>
        </Stack>
      </Paper>

    </Container>
  );
}
