
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DataQualityPieChartProps {
  normal: number;
  abnormal: number;
}

const DataQualityPieChart: React.FC<DataQualityPieChartProps> = ({ normal, abnormal }) => {
  const data = [
    { name: 'Pass', value: normal, color: '#06D6A0' },
    { name: 'Fail', value: abnormal, color: '#FF5A5F' },
  ];

  const COLORS = ['#06D6A0', '#FF5A5F'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>
            {`${payload[0].name}: ${payload[0].value}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {`${((payload[0].value / (normal + abnormal)) * 100).toFixed(1)}% of total`}
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full h-full shadow-md animate-fade-in animation-delay-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Data Quality</CardTitle>
        <CardDescription>
          Percentage of readings within safe range vs. outside
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataQualityPieChart;
