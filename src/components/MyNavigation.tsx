import React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PaidIcon from '@mui/icons-material/Paid';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from 'react-router-dom';

export default function MyNavigation() {
  return (
    <List>
      <ListItemButton component={Link} to="/">
        <ListItemIcon sx={{ minWidth: '40px' }}>
          <PaidIcon fontSize="large" />
        </ListItemIcon>
        <ListItemText primary="Deals" />
      </ListItemButton>
      <ListItemButton component={Link} to="/settings">
        <ListItemIcon sx={{ minWidth: '40px' }}>
          <SettingsIcon fontSize="large" />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItemButton>
    </List>
  );
}
