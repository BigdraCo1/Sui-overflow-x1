
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface StatusLineGraphProps {
  data: Array<{
    time: string;
    value: number;
  }>;
  minThreshold: number;
  maxThreshold: number;
  unit: string;
  title: string;
}

const StatusLineGraph: React.FC<StatusLineGraphProps> = ({
  data,
  minThreshold,
  maxThreshold,
  unit,
  title,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isWithinThreshold = value >= minThreshold && value <= maxThreshold;
      
      return (
        <div className="bg-background p-3 shadow-md rounded-md border border-gray-300">
          <p className="text-sm text-gray-600">{`Time: ${label}`}</p>
          <p className={`text-sm font-medium ${isWithinThreshold ? 'text-emerald-500' : 'text-red-500'}`}>
            {`${title}: ${value} ${unit}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isWithinThreshold ? 'Within safe range' : 'Outside safe range'}
          </p>
        </div>
      );
    }
    
    return null;
  };

  // Function to determine dot colors based on threshold values
  const CustomizedDot = (props: any) => {
    const { cx, cy, value } = props;
    const isWithinThreshold = value >= minThreshold && value <= maxThreshold;
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={isWithinThreshold ? "#06D6A0" : "#FF5A5F"} 
        stroke="white"
        strokeWidth={1.5}
      />
    );
  };

  return (
    <Card className="w-full h-full border-0 bg-transparent shadow-none">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-medium text-gray-800">{title} Monitoring</CardTitle>
            <CardDescription className="text-gray-500">
              Safe range: {minThreshold} - {maxThreshold} {unit}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#888' }} 
                tickMargin={10}
                axisLine={{ stroke: '#eee' }}
                tickLine={{ stroke: '#eee' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#888' }} 
                tickMargin={10}
                axisLine={{ stroke: '#eee' }}
                tickLine={{ stroke: '#eee' }}
                label={{ 
                  value: unit, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: 12, fill: '#888', dy: 50 } 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={maxThreshold} 
                stroke="#06D6A0" 
                strokeDasharray="3 3" 
                strokeWidth={1.5}
                label={{ 
                  value: `${maxThreshold}${unit}`, 
                  position: 'right', 
                  fill: '#06D6A0',
                  fontSize: 12 
                }}
              />
              <ReferenceLine 
                y={minThreshold} 
                stroke="#06D6A0" 
                strokeDasharray="3 3" 
                strokeWidth={1.5}
                label={{ 
                  value: `${minThreshold}${unit}`, 
                  position: 'right', 
                  fill: '#06D6A0',
                  fontSize: 12
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#81D8D0"
                strokeWidth={2}
                dot={<CustomizedDot />}
                activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1000}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusLineGraph;
