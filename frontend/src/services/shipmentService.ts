import { useState, useEffect } from 'react';


let baseUrl = '/blockchain-retriever';
// Define types for shipment data
export interface Shipment {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'issue';
  origin: string;
  destination: string;
  lastUpdated: string;
  updatedAt: string;   // Raw timestamp from backend
  startDate?: string;
  estimatedArrival?: string;
  minTemp?: number;
  maxTemp?: number;
  tempUnit?: string;
}

// *********************************************
// REAL API INTEGRATION SECTION
// Replace these functions with actual API calls
// *********************************************

// Function to fetch all shipments from API
// Function to fetch all shipments from API
export const fetchShipments = async (address): Promise<Shipment[]> => {
  if (!address) {
    console.warn('No address provided to fetchShipments');
  }
  
  try {
    const path = `${baseUrl}/${address}`;
    console.log('Fetching shipments from:', path);
    
    const response = await fetch(path, {
      headers: { 
        'Accept': 'application/json',
      },
    });
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const rawData = await response.json();
    console.log('Raw API response:', rawData);
    
    if (!Array.isArray(rawData)) {
      console.error('API did not return an array:', rawData);
    }
    
// Map the complex API response to the expected Shipment interface
// Add this to your mappedShipments logic:
const mappedShipments: Shipment[] = rawData.map(item => {
  // Calculate estimatedArrival (createdAt + 3 days)
  const createdDate = item.createdAt ? new Date(item.createdAt) : null;
  let estimatedDate = null;
  
  if (createdDate) {
    estimatedDate = new Date(createdDate);
    estimatedDate.setDate(estimatedDate.getDate() + 3); // Add 3 days
  }
  
  // Create a properly formatted Shipment object from the API data
  return {
    id: item.id || 'unknown-id',
    name: item.name || 'Unnamed Shipment',
    status: convertStatus(item.status), // Convert string status to our enum
    origin: item.origin || 'Unknown origin',
    destination: item.destination || 'Unknown destination',
    lastUpdated: formatRelativeTime(item.updatedAt) || 'Unknown',
    updatedAt: item.updatedAt, // Store the raw updatedAt date
    // Use createdAt as startDate and calculate estimatedArrival
    startDate: createdDate ? formatDate(createdDate.toISOString()) : undefined,
    estimatedArrival: estimatedDate ? formatDate(estimatedDate.toISOString()) : undefined,
    // You could also add these fields for temperature tracking if needed
    minTemp: 2, // Default values for medication
    maxTemp: 8,
    tempUnit: '°C',
  };
});
    
    console.log('Mapped shipments:', mappedShipments);
    return mappedShipments;
  } catch (error) {
    console.error('Error fetching shipments:', error);
    console.log('Falling back to mock data');
  }
};

// Helper function to format timestamps into relative time (e.g., "2 hours ago")
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Convert negative differences (future dates) to "just now"
    if (diffInSeconds < 0) return 'just now';
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    
    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    
    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
    
    // Less than a month
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    }
    
    // Less than a year
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    }
    
    // More than a year
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  } catch (e) {
    console.error('Error formatting relative time:', e);
    return dateString; // Return original if parsing fails
  }
}

// Helper function to convert API status to our status enum
function convertStatus(status: string): 'active' | 'completed' | 'issue' {
  if (!status) return 'active';
  
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('active') || lowerStatus.includes('transit')) {
    return 'active';
  } else if (lowerStatus.includes('complete') || lowerStatus.includes('delivered')) {
    return 'completed';
  } else if (lowerStatus.includes('issue') || lowerStatus.includes('problem') || lowerStatus.includes('error')) {
    return 'issue';
  }
  
  return 'active'; // Default
}

// Helper function to format dates
function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString; // Return original if parsing fails
  }
}

// Function to fetch a single shipment by ID
export const fetchShipmentById = async (id: string): Promise<Shipment | undefined> => {
  // TODO: Replace with real API call
  // Example:
  // const response = await fetch(`YOUR_API_ENDPOINT/shipments/${id}`);
  // return await response.json();
  
  // Using mockup data for now
  return new Promise((resolve) => {
    setTimeout(() => {
    }, 500);
  });
};

// END OF REAL API INTEGRATION SECTION
// *********************************************

// Calculate data quality
export const calculateDataQuality = (data: any[], minThreshold: number, maxThreshold: number) => {
  let normal = 0;
  let abnormal = 0;
  
  data.forEach(item => {
    if (item.value >= minThreshold && item.value <= maxThreshold) {
      normal++;
    } else {
      abnormal++;
    }
  });
  
  return { normal, abnormal };
};

// Custom hooks that would use the real API in production
export const useShipments = (address) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't try to fetch if address is undefined or null
    if (!address) {
      console.log("No address provided, using mock data");
      setIsLoading(false);
      return;
    }

    const getShipments = async () => {
      try {
        setIsLoading(true);
        console.log(`Attempting to fetch shipments for address: ${address}`);
        
        try {
          const data = await fetchShipments(address);
          console.log('Fetch successful:', data);
          setShipments(data);
        } catch (fetchError) {
          console.warn('API fetch failed, using mock data:', fetchError);
          throw fetchError; // Rethrow to set the error state
        }
      } catch (err) {
        console.error('Error in useShipments:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    getShipments();
  }, [address]); // Add address as a dependency so it refetches if address changes

  return { shipments, isLoading, error };
};

// Updated useShipmentDetail hook
export const useShipmentDetail = (
  id: string, 
  existingShipment?: Shipment, 
  sensorData?: any[],
  preformattedTempData?: any[]
) => {
  const [shipment, setShipment] = useState<Shipment | undefined>(existingShipment);
  const [temperatureData, setTemperatureData] = useState<any[]>(preformattedTempData || []);
  const [dataQuality, setDataQuality] = useState<{ normal: number; abnormal: number }>({ normal: 0, abnormal: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getShipmentData = async () => {
      try {
        setIsLoading(true);
        
        // If we don't have existing shipment data, fetch it
        if (!shipment) {
          const shipmentData = await fetchShipmentById(id);
          setShipment(shipmentData);
        }

        let tempData = [];
        
        // Priority 1: Use preformatted temperature data if available
        if (preformattedTempData && preformattedTempData.length > 0) {
          console.log('Using preformatted temperature data:', preformattedTempData.length, 'points');
          tempData = preformattedTempData;
        }
        // Priority 2: Format sensor data if available
        else if (sensorData && sensorData.length > 0) {
          console.log('Formatting provided sensor data:', sensorData.length, 'points');
          
          tempData = sensorData.map(reading => {
            try {
              const timestamp = reading.timestamp;
              const date = new Date(timestamp);
              
              return {
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: date.toLocaleDateString(),
                value: Number(reading.readings?.temperature || 0),
                humidity: Number(reading.readings?.humidity || 0),
                pressure: Number(reading.readings?.pressure || 0),
              };
            } catch (err) {
              console.error('Error formatting sensor reading:', err, reading);
              return {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date().toLocaleDateString(),
                value: 0,
                humidity: 0,
                pressure: 0
              };
            }
          });
          
          console.log('Formatted temperature data:', tempData);
        }
        // Priority 3: Fetch from API
        else {
          console.log('Fetching sensor data from API for:', id);
          const fetchedData = await fetchShipmentSensorData(id);
          
          if (fetchedData && fetchedData.length > 0) {
            console.log('API returned sensor data:', fetchedData.length, 'points');
            
            tempData = fetchedData.map(reading => {
              const date = new Date(reading.timestamp);
              return {
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: date.toLocaleDateString(),
                value: Number(reading.readings?.temperature || 0),
                humidity: Number(reading.readings?.humidity || 0),
                pressure: Number(reading.readings?.pressure || 0)
              };
            });
          } else {
            console.warn('No sensor data available');
            // No longer fallback to generated mock data
            tempData = [];
          }
        }
        
        // Set the temperature data
        setTemperatureData(tempData);
        
        // Calculate data quality metrics
        const currentShipment = shipment || await fetchShipmentById(id);
        if (currentShipment?.minTemp !== undefined && currentShipment?.maxTemp !== undefined && tempData.length > 0) {
          const quality = calculateDataQuality(
            tempData, 
            currentShipment.minTemp, 
            currentShipment.maxTemp
          );
          setDataQuality(quality);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error in useShipmentDetail:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        
        // No longer fall back to generated mock data
        setTemperatureData([]);
      } finally {
        setIsLoading(false);
      }
    };

    getShipmentData();
  }, [id, shipment, sensorData, preformattedTempData]);

  return { shipment, temperatureData, dataQuality, isLoading, error };
};

// New function to fetch and process sensor data
export const fetchShipmentSensorData = async (transportationId: string) => {
  try {
    const path = `${baseUrl}/bundle?transportationId=${transportationId}`;
    console.log('Fetching sensor data from:', path);
    
    const response = await fetch(path, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const rawData = await response.json();
    console.log('Raw sensor data from API:', rawData);
    
    // Handle different possible formats of the data
    let data = [];
    
    // Case 1: The data is already an array of sensor readings
    if (Array.isArray(rawData)) {
      data = rawData;
    } 
    // Case 2: The data is an object with a data property containing the array
    else if (rawData && typeof rawData === 'object' && Array.isArray(rawData.data)) {
      data = rawData.data;
    }
    // Case 3: The data is a stringified JSON array
    else if (typeof rawData === 'string') {
      try {
        const parsed = JSON.parse(rawData);
        data = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse string data as JSON', e);
      }
    }
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No valid sensor data array found after parsing');
      return [];
    }
    
    // Process each item safely
    const processedData = [];
    
    for (const item of data) {
      try {
        if (!item) continue; // Skip null/undefined items
        
        // Handle different readings formats
        let readings;
        
        // If item is directly a readings object with temperature
        if (typeof item === 'object' && item.temperature !== undefined) {
          readings = item;
        }
        // If item has readings property as string or object
        else if (item.readings !== undefined) {
          readings = typeof item.readings === 'string' 
            ? JSON.parse(item.readings) 
            : item.readings;
        }
        // If item has a data property containing the readings
        else if (item.data && typeof item.data === 'object') {
          readings = item.data;
        }
        // Default empty readings object
        else {
          readings = { temperature: 0, humidity: 0, pressure: 0 };
        }
        
        // Ensure readings is an object with required properties
        if (typeof readings !== 'object' || readings === null) {
          readings = { temperature: 0, humidity: 0, pressure: 0 };
        }
        
        // Handle timestamp
        let timestamp;
        
        if (item.timestamp !== undefined) {
          timestamp = Number(item.timestamp);
          // Convert from seconds to milliseconds if needed
          if (timestamp < 10000000000) timestamp *= 1000;
        } else {
          timestamp = Date.now(); // Default to current time
        }
        
        // Create standardized sensor data object
        processedData.push({
          device_id: item.device_id || 'unknown',
          timestamp,
          readings: {
            temperature: Number(readings.temperature || 0),
            humidity: Number(readings.humidity || 0),
            pressure: Number(readings.pressure || 0)
          }
        });
      } catch (itemError) {
        console.error('Error processing sensor data item:', itemError);
        // Continue with next item
      }
    }
    
    console.log('Processed sensor data:', processedData);
    return processedData;
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return []; // Return empty array on error
  }
};
