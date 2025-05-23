import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ShipmentCard from '@/components/dashboard/ShipmentCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { fetchShipmentSensorData, useShipments } from '@/services/shipmentService';
import { useSignPersonalMessage, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SessionKey } from '@mysten/seal';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const suiAddress = currentAccount?.address;
  const { shipments, isLoading, error } = useShipments(suiAddress);
  const [processingShipment, setProcessingShipment] = useState<string | null>(null);

  const navigate = useNavigate();
  const packageId = '0x0fa339e890387266ca3463d2277d2670abb9095351bd6d7c894e7a076c320d3d';
  let baseUrl = '/blockchain-retriever';

  // Simplified handleViewDetail function that focuses on proper data handling
  const handleViewDetail = async (shipmentId: string) => {
    try {
      setProcessingShipment(shipmentId);
      
      const sessionKey = new SessionKey({
        address: suiAddress,
        packageId,
        ttlMin: 10,
      });
      
      toast.info('Please sign the message in your wallet to continue');
      
      await signPersonalMessage({
        message: sessionKey.getPersonalMessage(),
      }, {
        onSuccess: async (result) => {
          try {
            await sessionKey.setPersonalMessageSignature(result.signature);
            
            toast.success('Signature verified, accessing shipment details');
        
            try {
              // Fetch data using the shared service function for consistency
              const sensorData = await fetchShipmentSensorData(shipmentId);
              
              if (!sensorData || sensorData.length === 0) {
                toast.warning('No sensor data found');
                setTimeout(() => navigate(`/shipment/${shipmentId}`), 500);
                return;
              }
              
              toast.success(`Retrieved ${sensorData.length} sensor readings`);
              
              // Format temperature data for display (pre-format for charts)
              const formattedData = sensorData.map(item => {
                try {
                  const date = new Date(item.timestamp);
                  return {
                    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: date.toLocaleDateString(),
                    value: Number(item.readings?.temperature || 0),
                    humidity: Number(item.readings?.humidity || 0),
                    pressure: Number(item.readings?.pressure || 0),
                  };
                } catch (error) {
                  console.error('Error formatting data item:', error);
                  return {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: new Date().toLocaleDateString(),
                    value: 0,
                    humidity: 0,
                    pressure: 0
                  };
                }
              });
              
              console.log("Sensor data:", sensorData.length, "points");
              console.log("Formatted data:", formattedData.length, "points");
              
              // Navigate with both the raw and formatted data
              setTimeout(() => {
                navigate(`/shipment/${shipmentId}`, {
                  state: { 
                    sensorData, 
                    temperatureData: formattedData 
                  }
                });
              }, 500);
            } catch (apiError) {
              console.error('Error fetching sensor data:', apiError);
              toast.error(`Failed to fetch sensor data: ${apiError.message}`);
              setTimeout(() => navigate(`/shipment/${shipmentId}`), 500);
            }
          } catch (signatureError) {
            console.error('Error with signature:', signatureError);
            toast.error(`Signature error: ${signatureError.message}`);
          }
        },
        onError: (error) => {
          console.error('Error signing message:', error);
          toast.error('Failed to sign message');
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error processing shipment:', error);
      toast.error(`Error: ${error.message}`);
      return false;
    } finally {
      setProcessingShipment(null);
    }
  };

  // Filter shipments based on search query
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
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <p className="text-med-gray">Loading shipments...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex justify-center items-center h-40">
            <p className="text-med-red">Error loading shipments: {error.message}</p>
          </div>
        )}

        {/* Empty search results */}
        {!isLoading && !error && filteredShipments.length === 0 && (
          <div className="flex justify-center items-center h-40">
            <p className="text-med-gray">No shipments found</p>
          </div>
        )}

        {/* Shipment cards grid */}
        {!isLoading && !error && filteredShipments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShipments.map((shipment) => (
              <div key={shipment.id} className="relative">
                <ShipmentCard
                  id={shipment.id}
                  name={shipment.name}
                  status={shipment.status}
                  origin={shipment.origin}
                  destination={shipment.destination}
                  lastUpdated={shipment.lastUpdated}
                  updatedAt={shipment.updatedAt} // Pass the raw updatedAt timestamp
                  onViewDetail={() => handleViewDetail(shipment.id)}
                />
                
                {/* Display loading indicator when processing */}
                {processingShipment === shipment.id && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
