import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useDataContext } from '../data/DataProvider';

type MyBarChartProps = {
  dealKey: string;
};

export default function MyBarChart({ dealKey }: MyBarChartProps) {
    const { history } = useDataContext();
    const historyList = history.get(dealKey);

    let datesWithTimes: string[] = [];
    let profitsByDate: number[][] = [];

    if (historyList) {
        const profitByDateTime = new Map<string, number[]>();

        historyList.forEach(item => {
            const dateTime = new Date(item.date).toLocaleString();
            const profit = parseFloat(item.profit.toFixed(2));

            if (!profitByDateTime.has(dateTime)) {
                profitByDateTime.set(dateTime, []);
            }
            profitByDateTime.get(dateTime)!.push(profit);
        });

        datesWithTimes = Array.from(profitByDateTime.keys());
        profitsByDate = Array.from(profitByDateTime.values());
    }

    const series = profitsByDate[0].map((_, seriesIndex) => ({
        data: profitsByDate.map(profits => profits[seriesIndex] || 0)
    }));

    return (
        <BarChart
            xAxis={[{ 
                scaleType: 'band', 
                data: datesWithTimes
            }]}
            series={series}
            width={1000}
            height={300}
            yAxis={[{ label: 'Profit %' }]}
            grid={{horizontal: true }}
            margin={{ top: 20, bottom: 60, left: 60, right: 20 }}
        />
    );
}
