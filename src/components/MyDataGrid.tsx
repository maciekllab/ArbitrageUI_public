import { DataGrid, GridColDef, GridColumnGroupingModel, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { DealResponseWrapper } from '../data/DataModels';
import { NetworkIcon, TokenIcon } from '@web3icons/react';
import { useDataContext } from '../data/DataProvider';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, IconButtonProps, Link, Modal, Tooltip, Typography } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { BarChart } from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MyBarChart from './MyBarChart';
import {BridgeAggregatorDialog } from './BridgeAggregator';
import InfoIcon from '@mui/icons-material/Info';
import { useEthersProvider } from "./WalletProvider";
import useSnackbarUtils from './SnackbarUtils';

type MyDataGridProps = {
  data: DealResponseWrapper[];
};

export default function MyDataGrid({ data }: MyDataGridProps) {  
  const [rows, setRows] = useState<{ id: number }[]>([]);
  const [open, setOpen] = React.useState(false);
  const [openBridgeDialog, setOpenBridgeDialog] = React.useState(false);
  const [isBridgeInverted, setIsBridgeInverted] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [clickedChartRow, setClickedChartRow] = React.useState<DealResponseWrapper>();
  const [clickedModalRow, setClickedModalRow] = React.useState<DealResponseWrapper>();
  const [clickedBridgeRow, setClickedBridgeRow] = React.useState<DealResponseWrapper>();
  const {history, getSupportedDexName, getSupportedDexSite, getSupportedChainID, isTokenSupportedForChain, getStargateBridgeLink, settings} = useDataContext();
  const {switchNetwork} = useEthersProvider();
  const {showSnackbar} = useSnackbarUtils();
  const iconWidth = 20;
  const iconHeight = 20;

  useEffect(() => {
    let visibleData = data;
    if (settings.uiSettings.showOnlyCrosschain)
      visibleData = data.filter(item => item.dest_chain != item.source_chain)
    const formattedRows = visibleData.map((deal, index) => ({
      id: index + 1,
      ...deal,       
    }));
    setRows(formattedRows);
  }, [data]);

  const handleShowChartClick = (rowData: DealResponseWrapper) => {
    setClickedChartRow(rowData);
    setOpen(true)
  };

  const handleOpenStargate = (rowData: DealResponseWrapper, event: React.MouseEvent<HTMLButtonElement>) => {
    setIsBridgeInverted(event.ctrlKey);
    const url = getStargateBridgeLink(rowData, event.ctrlKey);
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenBridgeDialog = async (supportedQuote: boolean, supportedBase: boolean, rowData: DealResponseWrapper, event: React.MouseEvent<HTMLButtonElement>) => {
    const bridgeSupported = supportedQuote && !event.ctrlKey || supportedBase && event.ctrlKey;
    if (bridgeSupported){
      const chainToSwitch = event.ctrlKey ? rowData.dest_chain : rowData.source_chain;
      await switchNetwork(chainToSwitch);
    } else {
      showSnackbar("Bridge not supported", "info");
    }
    setIsBridgeInverted(event.ctrlKey);
    setClickedBridgeRow(rowData);
    setOpenBridgeDialog(true);
  };

  const handleCloseBridgeDialog = () => {
    setOpenBridgeDialog(false);
  };

  const handleOpenModal = (rowData: DealResponseWrapper) => {
    setClickedBridgeRow(rowData);
    setClickedModalRow(rowData);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const getSupportedNetworkName = (chainName: string) => {
    switch (chainName) {
      case 'arbitrum':
        return "arbitrum-one";
      default:
        return chainName; 
    }
  }

  const getChainIcon = (chainName: string) => {
    const networkName = getSupportedNetworkName(chainName);
    try {
      return <NetworkIcon network={networkName} variant="branded" width={iconWidth} height={iconHeight} />;
    } catch (error) {
      return null;
    }
  };

  const getDexIcon = (dexName: string) => {
    let comp = null;
    try {
      const symbolName = getSupportedDexName(dexName);
      comp =  <TokenIcon symbol={symbolName} variant="branded" width={iconWidth} height={iconHeight} />;
    } catch (error) {
    }
    return comp;
  };

  const renderChainCell = (params:  GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ textAlign: 'center', width: '60%' }}>
          <span>{params.value}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '40%' }}>
          { params.value === 'canto' ? getDexIcon(params.value) : getChainIcon(params.value)}
        </div>
      </div>
    );
  };

  const renderDexCell  = (params:  GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
    return(
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', width: '40%' }}>
            {getDexIcon(params.value)}
          </div>
          <div style={{ textAlign: 'center', width: '60%' }}>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={getSupportedDexSite(params.value)}
          >
            {params.value}
          </Link>
          </div>
        </div>
    );
  }

  const columns: GridColDef[] = [
    { field: 'pair', headerName: 'Pair', width: 120 },
    { field: 'source_token', headerName: 'Swap', width: 55 },
    { field: 'source_chain', headerName: 'Chain', width: 130, renderCell: renderChainCell },
    { field: 'source_dex', headerName: 'DEX', width: 130, renderCell: renderDexCell },
    { field: 'dest_token', headerName: 'Swap', width: 55 },
    { field: 'dest_chain', headerName: 'Chain', width: 130, renderCell: renderChainCell },
    { field: 'dest_dex', headerName: 'DEX', width: 130, renderCell: renderDexCell },
    
    {
      field: 'profit',
      headerName: 'Profit',
      width: 80,
      type: 'number',
      renderCell: (params) => {
        const value = params.value as number;
        const historyList = history.get(params.row.key);
        let color = 'white'; 
        let show_question_icon = false;
        if (historyList && historyList.length > 1) {
          const firstInHistory = historyList[0];
          const uniqueValues = new Set(historyList.map(item => item.date));
          show_question_icon = uniqueValues.size != historyList.length;
          if (firstInHistory.profit < value){
            color = 'green';
          } else if (firstInHistory.profit > value) {
            color = 'orange';
          } else {
            color = 'lightblue';
          }
        }
  
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ color, textAlign: 'left', width: '100%' }}>
              {`${value.toFixed(2)}%`}
            </span>
            {show_question_icon ? (
              <Tooltip title="Duplicate dates in history">
                <HelpOutlineIcon style={{ marginLeft: '1px', color: 'default', fontSize: '14px' }} />
              </Tooltip>
            ) : (
              value > 10 && <WhatshotIcon style={{ marginLeft: '1px', color: 'red', fontSize: '14px' }} />
            )}
          </div>
        );
      },
    },
    {
      field: 'bridge',
      headerName: 'Bridge',
      width: 70,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row;
        const qouteTokenSupportedOnSourceChain = isTokenSupportedForChain(row.source_chain_buy_token_address, row.source_chain);
        const quoteTokenSupportedOnDestChain = isTokenSupportedForChain(row.dest_chain_sell_token_address, row.dest_chain);
        const bothSupportedForQuote = quoteTokenSupportedOnDestChain && qouteTokenSupportedOnSourceChain;
        const firstDirectionSupportedText = bothSupportedForQuote ? "OK" : "NOT SUPPORTED"
        const directionText: string = `${row.source_token} / ${row.dest_token}  -  ${firstDirectionSupportedText}`;

        const baseTokenSupportedOnDestChain = isTokenSupportedForChain(row.dest_chain_buy_token_address, row.dest_chain);
        const baseTokenSupportedOnSourceChain = isTokenSupportedForChain(row.source_chain_sell_token_address, row.source_chain);
        const bothSupportedForBase = baseTokenSupportedOnDestChain && baseTokenSupportedOnSourceChain;
        const invertedDirectionSupportedText = bothSupportedForBase ? "OK" : "NOT SUPPORTED"
        const invertedDirectionText: string = `${row.dest_token} / ${row.source_token}  -  ${invertedDirectionSupportedText}`;
        
        let color: IconButtonProps["color"] = "error";
        if(bothSupportedForQuote || bothSupportedForBase){
          color = "primary";
        }
        if (bothSupportedForQuote && bothSupportedForBase){
          color = "success";
        }

        return (
          <>
            <Tooltip
              title={
                <div style={{ textAlign: "center" }}>
                  <strong>Bridge plugin</strong>
                  <br/>
                  {directionText}
                  <br/>
                  {invertedDirectionText}
                  <br />
                  <em style={{ fontSize: "smaller" }}>CTRL to reverse bridge direction</em>
                </div>
              }
            >
              <IconButton
                color={color}
                size="small"
                onClick={(event) => handleOpenBridgeDialog(bothSupportedForQuote, bothSupportedForBase, params.row, event)}
              >
                <CurrencyExchangeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={
                <div style={{ textAlign: "center" }}>
                  <strong>LayerZero bridge</strong>
                  <br/>
                  <em style={{ fontSize: "smaller" }}>CTRL to reverse bridge direction</em>
                </div>
              }>
              <IconButton
                color="default"
                size="small"
                onClick={(event) => handleOpenStargate(params.row, event)}
              >
                <LaunchIcon />
              </IconButton>
            </Tooltip>
          </>
        )
      }
    },
    {
      field: 'history',
      headerName: 'Count',
      width: 25,
      type: 'number',
      valueGetter: (value, row) => {
        const historyList = history.get(row.key);
        if (historyList) {
           return historyList.length;
        }
        return 0;
      },
      headerAlign: 'center',
      renderHeader: (params) => (
        <span style={{ fontSize: '0.75rem' }}>{params.colDef.headerName}</span>
      ),
    },
    {
      field: 'avg',
      headerName: 'Average profit',
      width: 90,
      type: 'number',
      valueGetter: (value, row) => {
        const historyList = history.get(row.key);
        if (historyList && historyList.length > 0) {
          const avg = historyList.reduce((sum, item) => sum + item.profit, 0) / historyList.length;
          return avg;
        }
        return row.profit;
      },
      renderCell: (params: GridRenderCellParams) => {
        const value = params.value as number;
        return `${value.toFixed(2)}%`;
      },
      headerAlign: 'center',
      renderHeader: (params) => (
        <span style={{ fontSize: '0.75rem' }}>{params.colDef.headerName}</span>
      ),
    },
    {
      field: 'chart',
      headerName: 'Chart',
      width: 30,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title = "Show profit history data">
          <IconButton
                  color="default"
                  size="small"
                  onClick={() => handleShowChartClick(params.row)}
                >
                  <BarChart />
          </IconButton>
        </Tooltip>
      ),
      headerAlign: 'center',
      renderHeader: (params) => (
        <span style={{ fontSize: '0.75rem' }}>{params.colDef.headerName}</span>
      ),
    },
    {
      field: 'detail',
      headerName: 'Details',
      width: 65,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row;

        return (
          <Tooltip title="Show deal's detail info">
            <IconButton
              color="default"
              size="small"
              onClick={() => handleOpenModal(params.row)}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        )
      }
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120, 
      type: 'date',
      valueGetter: (val) => new Date(val),
      valueFormatter: (val) => {
        const date = val as Date;
        const timeFormatter = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
      
        const dateFormatter = new Intl.DateTimeFormat('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(date);
      
        return `${dateFormatter}   ${timeFormatter}`;
      },
    },
    { field: 'source_pair_address', headerName: 'Source pair', width: 120 },
    { field: 'source_chain_sell_token_address', headerName: 'Source sell', width: 120 },
    { field: 'source_chain_buy_token_address', headerName: 'Source buy', width: 120 },
    { field: 'dest_pair_address', headerName: 'Dest pair', width: 120 },
    { field: 'dest_chain_sell_token_address', headerName: 'Dest sell', width: 120 },
    { field: 'dest_chain_buy_token_address', headerName: 'Dest buy', width: 120 },
  ];
  
  const columnGroupingModel: GridColumnGroupingModel = [
    {
      groupId: 'Source',
      children: [{ field: 'source_token' },{ field: 'source_chain' }, { field: 'source_dex' }],
    },
    {
      groupId: 'Destination',
      children: [{ field: 'dest_token' },{ field: 'dest_chain' }, { field: 'dest_dex' }],
    },
    {
      groupId: 'Arbitrage',
      children: [{ field: 'profit' },{ field: 'bridge' }],
    },
    {
      groupId: 'Historical data analysis',
      children: [{ field: 'history' }, { field: 'avg' }, { field: 'chart' }],
    },
    {
      groupId: 'Others',
      children: [{ field: 'date' }, { field: 'source_pair_address' }, { field: 'source_chain_sell_token_address' }, { field: 'source_chain_buy_token_address' }, { field: 'dest_pair_address' }, { field: 'dest_chain_sell_token_address' }, { field: 'dest_chain_buy_token_address' }],
    },
  ];
  
  return (
    <><BridgeAggregatorDialog 
        open={openBridgeDialog}  
        onClose={handleCloseBridgeDialog} 
        defaultDestinationChainID={getSupportedChainID(!isBridgeInverted ? clickedBridgeRow?.dest_chain || "" : clickedBridgeRow?.source_chain || "")}
        defaultSourceChainID={getSupportedChainID(!isBridgeInverted ? clickedBridgeRow?.source_chain || "" : clickedBridgeRow?.dest_chain || "")} 
        defaultDestinationTokenAddress={!isBridgeInverted ? clickedBridgeRow?.dest_chain_sell_token_address || "" : clickedBridgeRow?.source_chain_sell_token_address || "" }
        defaultSourceTokenAddress={!isBridgeInverted ? clickedBridgeRow?.source_chain_buy_token_address || "" : clickedBridgeRow?.dest_chain_buy_token_address || ""}
      />
      <DataGrid
      rows={rows}
      columns={columns}
      columnGroupingModel={columnGroupingModel}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 100,
          },
        },
      }}
      pageSizeOptions={[10, 25, 50, 100]}
      disableRowSelectionOnClick
      checkboxSelection
      rowHeight={35}
      columnHeaderHeight={40}
      sx={{
        '& .MuiDataGrid-columnHeaders': {
          textAlign: 'center',
        },
        '& .MuiDataGrid-columnHeaderTitleContainer': {
          justifyContent: 'center',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          textAlign: 'center',
        },
        '& .MuiDataGrid-cell': {
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '0.8rem'
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: '#a3490d',
        },
        minWidth: '100%',
        maxWidth: '100%',
        overflowX: 'auto',
      }} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Profit historical analysis</DialogTitle>
        <DialogContent>
          {clickedChartRow && <MyBarChart dealKey={clickedChartRow.key} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Zamknij</Button>
        </DialogActions>
      </Dialog>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                maxWidth: '90%', 
                maxHeight: '90%',
                overflow: 'auto',
            }}
        >
              <Typography variant="h6" component="h2">
                  Deal details
              </Typography>
              <Box sx={{ mt: 2 }}>
                  {clickedModalRow &&
                      Object.entries(clickedModalRow).map(([key, value]) => (
                          <Typography key={key}>
                              <strong>{key}:</strong> {value instanceof Date ? value.toLocaleString() : value.toString()}
                          </Typography>
                      ))}
              </Box>
              <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
                  Close
              </Button>
          </Box>
        </Modal>
      </>
  );
}
