import { DataGrid, GridColDef, GridColumnGroupingModel, GridRenderCellParams, GridSortDirection, GridTreeNodeWithRender } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { DealResponseWrapper } from '../data/DataModels';
import { NetworkIcon, TokenIcon } from '@web3icons/react';
import { useDataContext } from '../data/DataProvider';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link, Tooltip } from '@mui/material';
import { BarChart } from '@mui/icons-material';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MyBarChart from './MyBarChart';
import {BridgeAggregatorDialog } from './BridgeAggregator';

type MyDataGridProps = {
  data: DealResponseWrapper[];
};

export default function MyDataGrid({ data }: MyDataGridProps) {  
  const [rows, setRows] = useState<{ id: number }[]>([]);
  const [open, setOpen] = React.useState(false);
  const [openBridgeDialog, setOpenBridgeDialog] = React.useState(false);
  const [clickedChartRow, setClickedChartRow] = React.useState<DealResponseWrapper>();
  const [clickedBridgeRow, setClickedBridgeRow] = React.useState<DealResponseWrapper>();
  const {history, getSupportedDexName, getSupportedDexSite, getSupportedChainID} = useDataContext();
  const iconWidth = 20;
  const iconHeight = 20;

  useEffect(() => {
    const formattedRows = data.map((deal, index) => ({
      id: index + 1,
      ...deal,       
    }));
    setRows(formattedRows);
  }, [data]);

  const handleShowChartClick = (rowData: DealResponseWrapper) => {
    setClickedChartRow(rowData);
    setOpen(true)
  };

  const handleOpenBridgeDialog = (rowData: DealResponseWrapper) => {
    setClickedBridgeRow(rowData)
    setOpenBridgeDialog(true);
  };

  const handleCloseBridgeDialog = () => {
    setOpenBridgeDialog(false);
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
          {getChainIcon(params.value)}
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
            <Link target="_blank" href={getSupportedDexSite(params.value)}>{params.value}</Link>
          </div>
        </div>
    );
  }

  const columns: GridColDef[] = [
    { field: 'pair', headerName: 'Tokens pair', width: 120 },
    { field: 'buy_chain', headerName: 'Chain', width: 130, renderCell: renderChainCell },
    { field: 'buy_dex', headerName: 'DEX', width: 130, renderCell: renderDexCell },
    { field: 'sell_chain', headerName: 'Chain', width: 130, renderCell: renderChainCell },
    { field: 'sell_dex', headerName: 'DEX', width: 130, renderCell: renderDexCell },
    {
      field: 'profit',
      headerName: 'Profit',
      width: 80,
      type: 'number',
      renderCell: (params) => {
        const value = params.value as number;
        const historyList = history.get(params.row.key);
        let color = 'black'; 
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
            color = 'blue';
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
        const sameChains = row.sell_chain === row.buy_chain
        const supportedSellChainID = getSupportedChainID(row.sell_chain)
        const supportedBuyChainID = getSupportedChainID(row.buy_chain)
        const bothSupported = supportedBuyChainID !== -1 && supportedSellChainID !== -1

        return (
          !sameChains && bothSupported && <IconButton
          color= {bothSupported ? "default" : "error"}
          size="small"
          onClick={() => handleOpenBridgeDialog(params.row)}
        >
          <OpenInBrowserIcon />
        </IconButton>
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
        <IconButton
        color="default"
        size="small"
        onClick={() => handleShowChartClick(params.row)}
      >
        <BarChart />
      </IconButton>
      ),
      headerAlign: 'center',
      renderHeader: (params) => (
        <span style={{ fontSize: '0.75rem' }}>{params.colDef.headerName}</span>
      ),
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
    { field: 'pair_address', headerName: 'Pair Address', width: 120 },
  ];
  
  const columnGroupingModel: GridColumnGroupingModel = [
    {
      groupId: 'Buy',
      children: [{ field: 'buy_token' },{ field: 'buy_chain' }, { field: 'buy_dex' }],
    },
    {
      groupId: 'Sell',
      children: [{ field: 'sell_token' },{ field: 'sell_chain' }, { field: 'sell_dex' }],
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
      children: [{ field: 'date' }, { field: 'pair_address' }],
    },
  ];
  
  return (
    <><BridgeAggregatorDialog 
        open={openBridgeDialog}  
        onClose={handleCloseBridgeDialog} 
        defaultDestinationChainID={getSupportedChainID(clickedBridgeRow?.sell_chain || "")}
        defaultSourceChainID={getSupportedChainID(clickedBridgeRow?.buy_chain || "")} 
        defaultDestinationTokenAddress={clickedBridgeRow?.buy_token_address || ""}
        defaultSourceTokenAddress={clickedBridgeRow?.sell_token_address || ""}
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
      </Dialog></>
  );
}
