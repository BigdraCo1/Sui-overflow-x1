import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import StatusLineGraph from '@/components/dashboard/StatusLineGraph';
import DataQualityPieChart from '@/components/dashboard/DataQualityPieChart';
import RouteMap from '@/components/dashboard/RouteMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Share2, ChevronLeft, Mail, X } from 'lucide-react';
import { toast } from 'sonner';

// Define types for API response
interface ShipmentApiResponse {
  id: string;
  device_id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  accountId: string;
  origin: string;
  destination: string;
  status: string;
}

// Convert API response to our shipment format
const mapApiResponseToShipment = (response: ShipmentApiResponse) => {
  return {
    id: response.id,
    name: response.name,
    status: response.status.toLowerCase() as 'active' | 'completed' | 'issue',
    origin: response.origin,
    destination: response.destination,
    lastUpdated: new Date(response.updatedAt).toLocaleString(),
    startDate: new Date(response.createdAt).toLocaleDateString(),
    // Estimate arrival 3 days after creation
    estimatedArrival: new Date(new Date(response.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    // Default temperature thresholds for medical shipments
    minTemp: 2,
    maxTemp: 8,
    tempUnit: '°C',
    // Additional fields from API
    device_id: response.device_id,
    accountId: response.accountId
  };
};

const ShipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [shipment, setShipment] = useState<any>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  
  // Extract sensor and temperature data from location state
  const sensorData = location.state?.sensorData || [];
  const preformattedTempData = location.state?.temperatureData || [];
  
  // Calculate data quality
  const [dataQuality, setDataQuality] = useState({ normal: 0, abnormal: 0 });
  
  // Function to handle exporting shipment data
  const createShipmentDataJson = (shipmentData: any) => {
    // Create an export object with all relevant data
    const exportData = {
      shipment: {
        ...shipment,
        exportedAt: new Date().toISOString()
      },
      sensorData: sensorData || [],
      temperatureReadings: preformattedTempData || [],
      dataQuality
    };
      
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Return both JSON string and object format
    return {
      jsonString,
      data: exportData
    };
  };
  
  // Function to handle exporting shipment data
  const handleExport = () => {
    try {
      const { jsonString } = createShipmentDataJson(shipment);
      
      // Create a blob with the JSON data
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `shipment-${shipment.id}-${new Date().toISOString().split('T')[0]}.json`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the URL object
      URL.revokeObjectURL(url);
      
      toast.success('Shipment data exported successfully');
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error('Failed to export shipment data');
    }
  };
  
  // Function to handle exporting limited data for fallback view
  const handleLimitedExport = (fallbackShipment: any) => {
    try {
      const exportData = {
        shipment: fallbackShipment,
        sensorData: sensorData || [],
        temperatureReadings: preformattedTempData || [],
        exportedAt: new Date().toISOString()
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `limited-shipment-${id}-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('Limited shipment data exported');
    } catch (err) {
      console.error('Error exporting limited data:', err);
      toast.error('Failed to export data');
    }
  };
  
  // Function to handle sharing via Gmail with attachment
  const handleGmailShare = () => {
    try {
      if (!shipment) {
        toast.error('No shipment data to share');
        return;
      }
      
      // Generate JSON data
      const { jsonString, data } = createShipmentDataJson(shipment);
      
      // Create file for attachment
      const file = new Blob([jsonString], { type: 'application/json' });
      const fileUrl = URL.createObjectURL(file);
      
      // Format email body content
      const subject = encodeURIComponent(`Shipment Details: ${shipment.name} (${shipment.id})`);
      const body = encodeURIComponent(`
Hello,

I'd like to share details about the following shipment with you:

Shipment: ${shipment.name}
ID: ${shipment.id}
Status: ${shipment.status}
From: ${shipment.origin}
To: ${shipment.destination}
Device ID: ${shipment.device_id || 'N/A'}
Number of sensor readings: ${sensorData?.length || 0}
Last updated: ${shipment.lastUpdated}

This shipment is currently being monitored using ISOPOD's blockchain tracking system.

I've attached the complete shipment data file for more detailed information.

Best regards,
ISOPOD Tracking System
      `);
      
      // Create a downloadable version for the user
      toast.info('Preparing shipment data file...');
      
      // Download the file first (Gmail doesn't allow direct attachments from JS)
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `shipment-${shipment.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Remind user to attach the downloaded file
      toast.success('File downloaded. Please attach it to your Gmail message.');
      
      // Open Gmail compose window with pre-filled content
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`, '_blank');
      
      setShowShareOptions(false);
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 1000);
    } catch (err) {
      console.error('Error sharing via Gmail:', err);
      toast.error('Failed to prepare email');
    }
  };
  
  // Function to handle Gmail share for fallback view with attachment
  const handleLimitedGmailShare = (fallbackShipment: any) => {
    try {
      const exportData = {
        shipment: fallbackShipment,
        sensorData: sensorData || [],
        temperatureReadings: preformattedTempData || [],
        exportedAt: new Date().toISOString()
      };
      
      // Create file for attachment
      const jsonString = JSON.stringify(exportData, null, 2);
      const file = new Blob([jsonString], { type: 'application/json' });
      const fileUrl = URL.createObjectURL(file);
      
      // Format email
      const subject = encodeURIComponent(`Limited Shipment Data: ${fallbackShipment.id}`);
      const body = encodeURIComponent(`
Hello,

I'd like to share limited data about the following shipment:

Shipment ID: ${fallbackShipment.id}
Sensor readings: ${sensorData?.length || 0}

I've attached the shipment data file with all available information.

This is partial data from the ISOPOD tracking system.

Best regards,
ISOPOD Tracking System
      `);
      
      // Download the file first for the user to attach
      toast.info('Preparing limited shipment data file...');
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `limited-shipment-${fallbackShipment.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('File downloaded. Please attach it to your Gmail message.');
      
      // Open Gmail compose
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`, '_blank');
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 1000);
    } catch (err) {
      console.error('Error sharing limited data via Gmail:', err);
      toast.error('Failed to prepare email');
    }
  };
  
  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch shipment data directly from API
  useEffect(() => {
    const fetchShipmentData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Direct API call to fetch shipment data
        const response = await fetch(`http://127.0.0.1:3000/blockchain-retriever/transportation/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Map API response to our shipment format
        const mappedShipment = mapApiResponseToShipment(data);
        setShipment(mappedShipment);
        
        // Calculate data quality if we have temperature data
        if (preformattedTempData.length > 0) {
          let normal = 0;
          let abnormal = 0;
          
          preformattedTempData.forEach((item: any) => {
            if (item.value >= mappedShipment.minTemp && item.value <= mappedShipment.maxTemp) {
              normal++;
            } else {
              abnormal++;
            }
          });
          
          setDataQuality({ normal, abnormal });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching shipment:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch shipment data'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchShipmentData();
  }, [id, preformattedTempData]);
  
  // Update debug info whenever relevant data changes
  useEffect(() => {
    console.log("[ShipmentDetail] Location state:", location.state);
    console.log("[ShipmentDetail] Sensor data:", sensorData?.length || 0, "readings");
    console.log("[ShipmentDetail] Temperature data:", preformattedTempData?.length || 0, "readings");
    console.log("[ShipmentDetail] Direct API shipment:", shipment);
    
    const shipmentName = shipment?.name || 'N/A';
    
    setDebugInfo(`Shipment Name: ${shipmentName}, 
                  ID: ${id || 'unknown'},
                  State: ${location.state ? 'Available' : 'Unavailable'}, 
                  Sensor data: ${sensorData?.length || 0}, 
                  Temp data: ${preformattedTempData?.length || 0},
                  Direct API shipment: ${shipment ? 'Yes' : 'No'}`);
  }, [location.state, shipment, id, sensorData, preformattedTempData]);

  // Loading state
  if (loading) {
    return (
      <MainLayout title="Loading Shipment...">
        <div className="flex justify-center items-center h-40">
          <p className="text-med-gray">Loading shipment details...</p>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error && !shipment) {
    return (
      <MainLayout title="Error">
        <div className="flex flex-col justify-center items-center h-40 space-y-4">
          <p className="text-med-red">Error loading shipment: {error.message}</p>
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg max-w-md whitespace-pre-wrap">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            {debugInfo}
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Fallback if no shipment data
  if (!shipment) {
    return (
      <MainLayout title="Shipment Not Found">
        <div className="flex flex-col justify-center items-center h-40 space-y-4">
          <p className="text-med-gray">Shipment not found</p>
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg max-w-md">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  // Main content when we have everything

  // Main content when we have everything
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
                <p>Device ID: <span className="font-medium">{shipment.device_id}</span></p>
                <p className="mt-1">Sensor readings: <span className="font-medium">{sensorData?.length || 0}</span></p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 text-primary border-primary hover:bg-primary/10"
                onClick={handleExport}
              >
                <Download size={16} />
                <span>Export</span>
              </Button>
              <div className="relative" ref={shareMenuRef}>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 text-primary border-primary hover:bg-primary/10"
                  onClick={() => setShowShareOptions(!showShareOptions)}
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </Button>
                
                {/* Share options dropdown */}
                {showShareOptions && (
                  <div className="absolute right-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px]">
                    <div className="flex justify-between items-center px-4 pb-2 mb-1 border-b">
                      <span className="font-medium text-sm">Share via</span>
                      <button 
                        onClick={() => setShowShareOptions(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                      onClick={handleGmailShare}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <Mail size={16} className="text-red-500" />
                      </div>
                      <span>Gmail</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Status graph */}
        {preformattedTempData.length > 0 && (
          <div className="border border-gray-300 rounded-lg">
            <StatusLineGraph
              data={preformattedTempData}
              minThreshold={shipment.minTemp !== undefined ? shipment.minTemp : 2}
              maxThreshold={shipment.maxTemp !== undefined ? shipment.maxTemp : 8}
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
              origin={shipment.origin || "Unknown Origin"}
              destination={shipment.destination || "Unknown Destination"}
            />
          </div>
        </div>
        
        {/* Add debug information at the bottom for developers */}
        <details className="text-sm text-gray-500">
          <summary className="cursor-pointer p-2 hover:bg-gray-50 rounded">Show Debug Information</summary>
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
          </div>
        </details>
      </div>
    </MainLayout>
  );
};

export default ShipmentDetail;
