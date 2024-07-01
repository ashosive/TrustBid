import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import {Chart, ArcElement} from 'chart.js'
Chart.register(ArcElement);

interface DetailData {
    event: string;
    market: string;
    isResolved: boolean;
    values : {
        amount: string;
        user: string;
        option: string;
    }
    transactionHash: string;
    timestamp: number;
}
interface ChartProps {
    details: DetailData[];
  }

const PieChart = ({ details }: ChartProps) => {

    const labels = details.map(event => event.event);
    const datas = details.map(event => parseFloat(event.values.amount))


    // Prepare data for pie chart
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "# of invested",
        data: datas,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  return (
    <div className="chart-container" style={{ height: '300px', alignItems: 'center', display: 'flex', justifyContent: 'space-evenly' }}>
  <Doughnut data={chartData} height={300} width={400} />
</div>
  );
};

export default PieChart;
