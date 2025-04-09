
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Extend Window interface to include google property
declare global {
  interface Window {
    google: any;
  }
}

interface RouteMapProps {
  origin: string;
  destination: string;
}

const RouteMap: React.FC<RouteMapProps> = ({ origin, destination }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (!document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setMapError('Failed to load Google Maps. Please check your API key and connection.');
      document.body.appendChild(script);
    } else {
      // If the script is already loaded, just set isLoaded to true
      setIsLoaded(true);
    }

    return () => {
      // Cleanup function - only remove the script if we added it
      const script = document.getElementById('google-maps-script');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && window.google) {
      try {
        // Initialize the map
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 39.8283, lng: -98.5795 }, // Center of the US
          zoom: 4,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: "administrative",
              elementType: "geometry",
              stylers: [{ visibility: "simplified" }]
            },
            {
              featureType: "poi",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Initialize the directions service and renderer
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: map,
          polylineOptions: {
            strokeColor: '#81D8D0',
            strokeWeight: 5,
            strokeOpacity: 0.8
          },
          suppressMarkers: false,
        });

        // Create request for directions
        const request = {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING
        };

        // Get directions and display on map
        directionsService.route(request, (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          } else {
            setMapError(`Could not display directions: ${status}`);
          }
        });
      } catch (error) {
        setMapError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }, [isLoaded, origin, destination]);

  return (
    <Card className="w-full h-full shadow-md animate-fade-in animation-delay-400">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Transport Route</CardTitle>
        <CardDescription>
          {origin} to {destination}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mapError ? (
          <div className="h-[220px] bg-slate-100 rounded-md flex items-center justify-center text-med-red">
            <p>{mapError}</p>
          </div>
        ) : (
          <div 
            ref={mapRef} 
            className="h-[220px] bg-slate-200 rounded-md relative"
          >
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-med-gray">Loading map...</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteMap;
