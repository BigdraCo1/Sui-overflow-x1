
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ShipmentCard from '@/components/dashboard/ShipmentCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useShipments } from '@/services/shipmentService';

const Dashboard = () => {
  const { shipments, isLoading, error } = useShipments();
  const [searchQuery, setSearchQuery] = useState('');

  // กรองการค้นหา
  const filteredShipments = shipments.filter((shipment) => 
    shipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout title="Your Shipments">
      <div className="space-y-6">
        {/* Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-med-gray" size={18} />
            <Input 
              placeholder="Search shipments..." 
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* แสดงข้อความกำลังโหลด */}
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <p className="text-med-gray">Loading shipments...</p>
          </div>
        )}

        {/* แสดงข้อความเมื่อเกิดข้อผิดพลาด */}
        {error && (
          <div className="flex justify-center items-center h-40">
            <p className="text-med-red">Error loading shipments: {error.message}</p>
          </div>
        )}

        {/* แสดงข้อความเมื่อไม่พบข้อมูลที่ค้นหา */}
        {!isLoading && !error && filteredShipments.length === 0 && (
          <div className="flex justify-center items-center h-40">
            <p className="text-med-gray">No shipments found</p>
          </div>
        )}
        
        {/* Shipment cards grid */}
        {!isLoading && !error && filteredShipments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShipments.map((shipment) => (
              <ShipmentCard
                key={shipment.id}
                id={shipment.id}
                name={shipment.name}
                status={shipment.status}
                origin={shipment.origin}
                destination={shipment.destination}
                lastUpdated={shipment.lastUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
