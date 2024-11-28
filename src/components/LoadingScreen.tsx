import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

interface LoadingContextType {
  showLoadingScreen: () => void;
  hideLoadingScreen: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoadingScreen = () => setLoading(true);
  const hideLoadingScreen = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoadingScreen: showLoadingScreen, hideLoadingScreen: hideLoadingScreen }}>
      {children}
      <Backdrop
        sx={(theme) => ({ color: 'blue', zIndex: theme.zIndex.drawer + 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', pointerEvents: 'none',  })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </LoadingContext.Provider>
  );
};
