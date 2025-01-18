import { Box, Card, CardContent, CardHeader, Grid2 } from '@mui/material';
import MyDataGrid from '../components/MyDataGrid';
import { useDataContext } from '../data/DataProvider';

export default function WelcomePage() {  

  const {ethDerivativesDeals, altcoinsDeals, stablecoinsDeals} = useDataContext();

  return (
    <Grid2 container direction="column" spacing={2} sx={{ width: '100%' }}>

      <Grid2 sx={{ width: '100%' }}>
        <Card square elevation={0} sx={{border: 2, borderColor: 'grey.400' }}>
          <CardHeader
            title="Altcoins"
            titleTypographyProps={{ variant: "h5" }}
          />
          <CardContent>
            <Box sx={{ height: 500, width: '100%' }}>
              <MyDataGrid data={altcoinsDeals}/>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 sx={{ width: '100%' }}>
        <Card square elevation={0} sx={{ border: 2, borderColor: 'grey.400' }}>
          <CardHeader
            title="ETH derivatives"
            titleTypographyProps={{ variant: "h5" }}
          />
          <CardContent>
            <Box sx={{ height: 500, width: '100%' }}>
              <MyDataGrid data={ethDerivativesDeals}/>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 sx={{ width: '100%' }}>
        <Card square elevation={0} sx={{ border: 2, borderColor: 'grey.400' }}>
          <CardHeader
            title="Stablecoins"
            titleTypographyProps={{ variant: "h5" }}
          />
          <CardContent>
            <Box sx={{ height: 500, width: '100%' }}>
              <MyDataGrid data={stablecoinsDeals}/>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

    </Grid2>
  );
}
