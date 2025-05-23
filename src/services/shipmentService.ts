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
  startDate?: string;
  estimatedArrival?: string;
  minTemp?: number;
  maxTemp?: number;
  tempUnit?: string;
}

// MOCKUP DATA - Replace with real API data in production
export const mockShipments: Shipment[] = [
  {
    id: 'MS-001-2025',
    name: 'Insulin Regular',
    status: 'active',
    origin: 'San Francisco, CA',
    destination: 'Chicago, IL',
    lastUpdated: '2 hours ago',
    startDate: '2025-04-05',
    estimatedArrival: '2025-04-10',
    minTemp: 2,
    maxTemp: 8,
    tempUnit: '°C',
  },
  {
    id: 'MS-002-2025',
    name: 'Antibiotics Batch 12',
    status: 'completed',
    origin: 'Boston, MA',
    destination: 'Dallas, TX',
    lastUpdated: 'Yesterday',
  },
  {
    id: 'MS-003-2025',
    name: 'Vaccines (COVID-19)',
    status: 'issue',
    origin: 'Atlanta, GA',
    destination: 'Seattle, WA',
    lastUpdated: '4 hours ago',
  },
  {
    id: 'MS-004-2025',
    name: 'Morphine Sulfate',
    status: 'active',
    origin: 'Denver, CO',
    destination: 'Miami, FL',
    lastUpdated: '1 hour ago',
  },
  {
    id: 'MS-005-2025',
    name: 'Asthma Medications',
    status: 'active',
    origin: 'Los Angeles, CA',
    destination: 'New York, NY',
    lastUpdated: '3 hours ago',
  },
  {
    id: 'MS-006-2025',
    name: 'Pain Relief Medicines',
    status: 'completed',
    origin: 'Phoenix, AZ',
    destination: 'Detroit, MI',
    lastUpdated: '2 days ago',
  },

];
// *********************************************
// REAL API INTEGRATION SECTION
// Replace these functions with actual API calls
// *********************************************

// Function to fetch all shipments from API
// Function to fetch all shipments from API
export const fetchShipments = async (address): Promise<Shipment[]> => {
  if (!address) {
    console.warn('No address provided to fetchShipments');
    return mockShipments;
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
      return mockShipments;
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
    return mockShipments; // Return mock data on error
  }
};

// Helper function to format timestamps into relative time (e.g., "2 hours ago")
function formatRelativeTime(dateString: string): string {
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
      const shipment = mockShipments.find(s => s.id === id);
      resolve(shipment);
    }, 500);
  });
};

// END OF REAL API INTEGRATION SECTION
// *********************************************

// Helper functions for mockup data visualization
export const generateTemperatureData = () => {
  const data = [];
  const now = new Date();
  const minThreshold = 2; // 2°C
  const maxThreshold = 8; // 8°C
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now);
    time.setHours(time.getHours() - (23 - i));
    
    // สร้างค่าที่บางครั้งจะออกนอกช่วง
    let value;
    if (i === 5 || i === 18) {
      // ค่านอกช่วงเพื่อการสาธิต
      value = i === 5 ? 1.5 : 8.5;
    } else {
      // ค่าปกติในช่วง (พร้อมความแปรปรวนบางส่วน)
      value = minThreshold + (Math.random() * (maxThreshold - minThreshold));
    }
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat(value.toFixed(1)),
    });
  }
  
  return data;
};

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
      setShipments(mockShipments);
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
          setShipments(mockShipments); // Fall back to mock data on fetch error
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

export const useShipmentDetail = (id: string, existingShipment?: Shipment) => {
  // Use the existing shipment data if provided
  const [shipment, setShipment] = useState<Shipment | undefined>(existingShipment);
  const [temperatureData, setTemperatureData] = useState<any[]>([]);
  const [dataQuality, setDataQuality] = useState<{ normal: number; abnormal: number }>({ normal: 0, abnormal: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getShipmentData = async () => {
      try {
        setIsLoading(true);
        
        // If we don't have existing shipment data, fetch it
        // This is a fallback in case the hook is used directly
        if (!shipment) {
          const shipmentData = await fetchShipmentById(id);
          setShipment(shipmentData);
        }
        
        // Fetch temperature data from API
        const sensorData = await fetchShipmentSensorData(id);
        
        // Format the temperature data for display
        const formattedData = sensorData.map(reading => ({
          time: new Date(reading.timestamp * 1000).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          value: reading.readings?.temperature || 0
        }));
        
        setTemperatureData(formattedData.length > 0 ? formattedData : generateTemperatureData());
        
        // Calculate data quality
        const currentShipment = shipment || await fetchShipmentById(id);
        if (currentShipment?.minTemp !== undefined && currentShipment?.maxTemp !== undefined) {
          const quality = calculateDataQuality(
            formattedData, 
            currentShipment.minTemp, 
            currentShipment.maxTemp
          );
          setDataQuality(quality);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        
        // Still provide mock data on error for better UX
        setTemperatureData(generateTemperatureData());
      } finally {
        setIsLoading(false);
      }
    };

    getShipmentData();
  }, [id, shipment]);

  return { shipment, temperatureData, dataQuality, isLoading, error };
};

// New function to fetch only sensor data
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
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('API did not return an array for sensor data');
      return [];
    }
    
    // Process the data to parse readings and remove device_id
    const processedData = data.map((item) => {
      // Parse readings if it's a string
      const readingsObj = typeof item.readings === 'string' 
        ? JSON.parse(item.readings) 
        : item.readings;
      
      // Convert timestamp to milliseconds if needed
      const timestampMs = item.timestamp * (item.timestamp < 10000000000 ? 1000 : 1);
      
      // Return clean object without device_id
      const cleanItem = {
        timestamp: timestampMs,
        readings: {
          temperature: readingsObj.temperature,
          humidity: readingsObj.humidity,
          pressure: readingsObj.pressure,
          timestamp: item.timestamp // Keep original timestamp in readings
        }
      };
      
      return cleanItem;
    });
    
    console.log('Processed sensor data:', processedData);
    return processedData;
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return []; // Return empty array on error
  }
};
