import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ShipmentCardProps {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'issue';
  origin: string;
  destination: string;
  lastUpdated: string;
  onViewDetail?: () => Promise<boolean>;
}

const ShipmentCard: React.FC<ShipmentCardProps> = ({
  id,
  name,
  status,
  origin,
  destination,
  lastUpdated,
  onViewDetail
}) => {
  const navigate = useNavigate();

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-med-blue text-white';
      case 'completed':
        return 'bg-med-green text-white';
      case 'issue':
        return 'bg-med-red text-white';
      default:
        return 'bg-med-gray text-white';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <Clock size={14} />;
      case 'completed':
        return <Check size={14} />;
      case 'issue':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  // Custom handler to ensure we don't navigate if signing fails
  const handleViewDetail = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default navigation
    
    if (onViewDetail) {
      // If signing is successful, the navigation will happen in the parent component
      // If it fails, we stay on the current page
      await onViewDetail();
    } else {
      // Only navigate directly if there's no signing function
      navigate(`/shipment/${id}`);
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{name}</CardTitle>
          <Badge className={`${getStatusColor()} flex items-center gap-1`}>
            {getStatusIcon()}
            <span className="capitalize">{status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-med-gray">
            <span className="font-medium">Shipment ID:</span>
            <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded">{id}</span>
          </div>
          <div className="relative pt-4">
            <div className="flex justify-between items-center text-sm">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center z-10">
                <span className="font-medium">A</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center z-10">
                <span className="font-medium">B</span>
              </div>
            </div>
            
            <div className="absolute top-[30px] left-10 right-10 h-0.5 bg-slate-200"></div>
            
            <div className="flex justify-between mt-2 text-xs text-med-gray">
              <div className="max-w-[100px] truncate">{origin}</div>
              <div className="max-w-[100px] truncate text-right">{destination}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t">
        <div className="text-xs text-med-gray">
          Last updated: {lastUpdated}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-primary border-primary hover:bg-primary/10 hover:text-primary"
          onClick={handleViewDetail}
        >
          View details <ArrowRight size={14} className="ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShipmentCard;
