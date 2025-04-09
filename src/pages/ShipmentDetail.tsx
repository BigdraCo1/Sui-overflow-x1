
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import StatusLineGraph from '@/components/dashboard/StatusLineGraph';
import DataQualityPieChart from '@/components/dashboard/DataQualityPieChart';
import RouteMap from '@/components/dashboard/RouteMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { useShipmentDetail } from '@/services/shipmentService';

const ShipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { shipment, temperatureData, dataQuality, isLoading, error } = useShipmentDetail(id || '');

  // หากกำลังโหลด
  if (isLoading) {
    return (
      <MainLayout title="Loading Shipment...">
        <div className="flex justify-center items-center h-40">
          <p className="text-med-gray">Loading shipment details...</p>
        </div>
      </MainLayout>
    );
  }

  // หากเกิดข้อผิดพลาด
  if (error) {
    return (
      <MainLayout title="Error">
        <div className="flex justify-center items-center h-40">
          <p className="text-med-red">Error loading shipment: {error.message}</p>
        </div>
      </MainLayout>
    );
  }

  // หากไม่พบข้อมูล
  if (!shipment) {
    return (
      <MainLayout title="Shipment Not Found">
        <div className="flex justify-center items-center h-40">
          <p className="text-med-gray">Shipment not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Shipment: ${shipment.name}`}>
      <div className="space-y-6">
        {/* Header with shipment details */}
        <div className="rounded-lg border border-gray-300 p-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold">{shipment.name}</h2>
                <Badge className={`${shipment.status === 'active' ? 'bg-med-blue' : shipment.status === 'completed' ? 'bg-med-green' : 'bg-med-red'} text-white`}>
                  {shipment.status === 'active' ? 'In Transit' : shipment.status === 'completed' ? 'Delivered' : 'Issue Detected'}
                </Badge>
              </div>
              <div className="text-sm text-med-gray">
                <p>Shipment ID: <span className="font-medium">{shipment.id}</span></p>
                <p>From <span className="font-medium">{shipment.origin}</span> to <span className="font-medium">{shipment.destination}</span></p>
                {shipment.startDate && shipment.estimatedArrival && (
                  <p>Started: <span className="font-medium">{shipment.startDate}</span> | ETA: <span className="font-medium">{shipment.estimatedArrival}</span></p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2 text-primary border-primary hover:bg-primary/10">
                <Download size={16} />
                <span>Export</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2 text-primary border-primary hover:bg-primary/10">
                <Share2 size={16} />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Status graph */}
        {shipment.minTemp !== undefined && shipment.maxTemp !== undefined && temperatureData.length > 0 && (
          <div className="border border-gray-300 rounded-lg">
            <StatusLineGraph
              data={temperatureData}
              minThreshold={shipment.minTemp}
              maxThreshold={shipment.maxTemp}
              unit={shipment.tempUnit || '°C'}
              title="Temperature"
            />
          </div>
        )}
        
        {/* Bottom charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataQuality.normal + dataQuality.abnormal > 0 && (
            <div className="border border-gray-300 rounded-lg">
              <DataQualityPieChart
                normal={dataQuality.normal}
                abnormal={dataQuality.abnormal}
              />
            </div>
          )}
          <div className="border border-gray-300 rounded-lg">
            <RouteMap
              origin={shipment.origin}
              destination={shipment.destination}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShipmentDetail;
