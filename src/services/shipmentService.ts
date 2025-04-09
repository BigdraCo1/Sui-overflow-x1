import { useState, useEffect } from 'react';

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
export const fetchShipments = async (): Promise<Shipment[]> => {
  // TODO: Replace with real API call
  // Example: 
  // const response = await fetch('YOUR_API_ENDPOINT/shipments');
  // return await response.json();
  
  // Using mockup data for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockShipments);
    }, 500);
  });
};

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
export const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getShipments = async () => {
      try {
        setIsLoading(true);
        // This function should be replaced with real API call
        const data = await fetchShipments();
        setShipments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    getShipments();
  }, []);

  return { shipments, isLoading, error };
};

export const useShipmentDetail = (id: string) => {
  const [shipment, setShipment] = useState<Shipment | undefined>(undefined);
  const [temperatureData, setTemperatureData] = useState<any[]>([]);
  const [dataQuality, setDataQuality] = useState<{ normal: number; abnormal: number }>({ normal: 0, abnormal: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getShipmentDetail = async () => {
      try {
        setIsLoading(true);
        // This function should be replaced with real API call
        const data = await fetchShipmentById(id);
        setShipment(data);

        if (data) {
          // This would be real sensor data in production
          const tempData = generateTemperatureData();
          setTemperatureData(tempData);

          // Calculate data quality from real data in production
          if (data.minTemp !== undefined && data.maxTemp !== undefined) {
            const quality = calculateDataQuality(tempData, data.minTemp, data.maxTemp);
            setDataQuality(quality);
          }
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    getShipmentDetail();
  }, [id]);

  return { shipment, temperatureData, dataQuality, isLoading, error };
};
