import React, { useEffect } from 'react';
import * as echarts from 'echarts';

const ScatterChart: React.FC = () => {
  useEffect(() => {
    const chartDom = document.getElementById('scatter-chart')!;
    const myChart = echarts.init(chartDom);
    const option = {
      title: {
        text: 'Conductividad Eléctrica vs pH del Suelo'
      },
      tooltip: {
        trigger: 'item'
      },
      xAxis: {
        name: 'pH del Suelo',
        min: 4,
        max: 9
      },
      yAxis: {
        name: 'Conductividad Eléctrica (dS/m)',
        min: 0,
        max: 3
      },
      series: [{
        name: 'Parcelas',
        type: 'scatter',
        data: [
          [5.5, 1.2],
          [6.0, 0.9],
          [6.5, 1.5],
          [7.0, 2.0],
          [7.5, 1.8],
          [8.0, 2.5],
          [8.5, 1.3]
        ],
        itemStyle: {
          color: '#67a9cf'
        }
      }]
    };
    myChart.setOption(option);
  }, []);

  return <div id="scatter-chart" style={{ width: '600px', height: '400px' }}></div>;
};

export default ScatterChart;
