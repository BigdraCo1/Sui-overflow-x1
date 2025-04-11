import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

interface RouteMapProps {
  origin: string;
  destination: string;
}

const RouteMap: React.FC<RouteMapProps> = ({ origin, destination }) => {
  return (
    <Card className="w-full h-full shadow-md animate-fade-in animation-delay-400">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Transport Route</CardTitle>
        <CardDescription>
          {origin} to {destination}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] bg-slate-100 rounded-md relative overflow-hidden">
          {/* Map background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50"></div>
          
          {/* Origin point */}
          <div className="absolute top-1/4 left-[15%] flex flex-col items-center">
            <div className="w-4 h-4 bg-teal-500 rounded-full z-10"></div>
            <div className="mt-1 bg-white px-2 py-1 rounded shadow-sm text-xs max-w-[100px] truncate">
              {origin}
            </div>
          </div>
          
          {/* Destination point */}
          <div className="absolute top-1/4 right-[15%] flex flex-col items-center">
            <div className="w-4 h-4 bg-teal-500 rounded-full z-10"></div>
            <div className="mt-1 bg-white px-2 py-1 rounded shadow-sm text-xs max-w-[100px] truncate">
              {destination}
            </div>
          </div>
          
          {/* Route line */}
          <div className="absolute top-1/4 left-[17%] right-[17%] h-[2px] bg-teal-500"></div>
          
          {/* Truck icon moving along the route */}
          <div className="absolute top-[calc(25%-8px)] left-[45%] animate-pulse">
            <div className="bg-white rounded-full p-1 shadow-md">
              <Truck className="h-4 w-4 text-teal-500" />
            </div>
          </div>
          
          {/* Mock map elements */}
          <div className="absolute inset-0">
            {/* Horizontal grid lines */}
            {[...Array(8)].map((_, i) => (
              <div 
                key={`h-${i}`}
                className="absolute w-full h-[1px] bg-slate-200"
                style={{ top: `${(i + 1) * 10}%` }}
              ></div>
            ))}
            
            {/* Vertical grid lines */}
            {[...Array(8)].map((_, i) => (
              <div 
                key={`v-${i}`}
                className="absolute h-full w-[1px] bg-slate-200"
                style={{ left: `${(i + 1) * 10}%` }}
              ></div>
            ))}
            
            {/* Random "city" dots */}
            {[...Array(10)].map((_, i) => (
              <div 
                key={`city-${i}`}
                className="absolute w-1 h-1 bg-slate-300 rounded-full"
                style={{ 
                  top: `${Math.random() * 80 + 10}%`, 
                  left: `${Math.random() * 80 + 10}%` 
                }}
              ></div>
            ))}
          </div>
          
          {/* Controls mockup */}
          <div className="absolute top-4 right-4 bg-white rounded shadow-sm p-1 flex flex-col gap-1">
            <div className="w-5 h-5 bg-slate-200 rounded flex items-center justify-center text-xs">+</div>
            <div className="w-5 h-5 bg-slate-200 rounded flex items-center justify-center text-xs">−</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteMap;