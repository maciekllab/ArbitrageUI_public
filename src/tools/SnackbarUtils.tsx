import { useSnackbar, SnackbarKey } from 'notistack';
import React from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const useSnackbarUtils = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showSnackbar = (message: string, variant: 'default' | 'error' | 'success' | 'warning' | 'info' = 'default') => {
    try {
      enqueueSnackbar(message, {
        variant,
        action: (key: SnackbarKey) => (
          <IconButton
            onClick={() => closeSnackbar(key)}
            color="inherit"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        ),
      });
    } catch {
    }
  };

  return { showSnackbar };
};

export default useSnackbarUtils;
