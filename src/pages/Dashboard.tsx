import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ShipmentCard from '@/components/dashboard/ShipmentCard';
import { Input } from '@/components/ui/input';
import { Search, Download, FileKey, FileText } from 'lucide-react';
import { useShipments } from '@/services/shipmentService';
import { useSignPersonalMessage, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SuiClient } from '@mysten/sui/client';
import { SealClient, SessionKey, EncryptedObject } from '@mysten/seal';
import { Decryptor } from '@/lib/decrypt';
import { Button } from '@/components/ui/button';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex } from '@mysten/sui/utils';

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
  
  // Function to just read blob without decrypting
  const handleReadBlob = async (shipmentId: string) => {
    setProcessingShipment(shipmentId);
    try {
      // Get blob IDs for this shipment
      toast.info(`Fetching blob IDs for shipment ${shipmentId}...`);
      const path = `${baseUrl}/bundle?transportationId=${shipmentId}`;
      
      const response = await fetch(path, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const blobIds = await response.json();
      if (!Array.isArray(blobIds) || blobIds.length === 0) {
        toast.error('No blob IDs found');
        throw new Error('Invalid blob IDs received');
      }
      
      toast.success(`Found ${blobIds.length} blob IDs`);
      const firstBlobId = blobIds[0];
      
      // Create decryptor instance
      const decryptor = new Decryptor(suiClient);
      
      // Try to read the blob (without decrypting)
      toast.info(`Reading blob ${firstBlobId}...`);
      try {
        // Access the private readBlob method directly
        // @ts-ignore - accessing private method
        const blobData = await decryptor.readBlob(firstBlobId);
        toast.success(`Successfully read blob! Size: ${blobData.byteLength} bytes`);
        
        // Try to parse the EncryptedObject to get the full ID
        try {
          const fullId = EncryptedObject.parse(new Uint8Array(blobData)).id;
          toast.success(`Parsed blob ID: ${fullId}`);
        } catch (parseError) {
          toast.warning(`Could not parse as EncryptedObject: ${parseError.message}`);
        }
        
        console.log('Blob data (raw):', blobData);
      } catch (readError) {
        toast.error(`Failed to read blob: ${readError.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error reading blob:', error);
      toast.error(`Error: ${error.message}`);
      return false;
    } finally {
      setProcessingShipment(null);
    }
  };
  
// Function to create session, sign, and decrypt (simplified test version)
const handleDecryptBlob = async (shipmentId: string) => {
  setProcessingShipment(shipmentId);
  try {
    // 1. Set up logging for debugging
    console.log('Starting blob decryption test for shipment:', shipmentId);
    console.log('Sui Address:', suiAddress);
    console.log('Package ID:', packageId);
    // 3. Create decryptor with the properly initialized SealClient
    const decryptor = new Decryptor(suiClient);
    
    // 4. Create session key
    const sessionKey = new SessionKey({
      address: suiAddress,
      packageId,
      ttlMin: 10,
    });
    
    // 5. Sign the message
    try {
      await signPersonalMessage(
        {
          message: sessionKey.getPersonalMessage(),
        },
        {
          onSuccess: async (result: { signature: string; }) => {
            await sessionKey.setPersonalMessageSignature(result.signature);
            
            // 8. Fetch blob IDs - simplified
            try {
              const path = `${baseUrl}/bundle?transportationId=${shipmentId}`;
              console.log('Fetching blob IDs from:', path);
              
              const response = await fetch(path);
              const blobIds = await response.json();
              
              if (!Array.isArray(blobIds) || blobIds.length === 0) {
                toast.warning('No blob IDs found for this shipment');
                return;
              }
              
              console.log('Retrieved blob IDs:', blobIds);
              toast.success(`Found ${blobIds.length} blob(s)`);
              
              // 9. Test with just the first blob ID
              const firstBlobId = blobIds[0];
              
              // 10. Manually read blob (testing both direct access and via proxy)
              try {
                // First try direct URL (bypassing proxy for testing)
                const directResponse = await fetch(`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${firstBlobId}`, {
                  method: 'GET',
                  headers: { 'Accept': 'application/octet-stream' }
                });
                
                if (directResponse.ok) {
                  const blobData = await directResponse.arrayBuffer();
                  console.log(`Direct URL: Successfully read blob (${blobData.byteLength} bytes)`);
                  toast.success(`Direct URL read successful: ${blobData.byteLength} bytes`);
                  
                  // 11. Try parsing the encrypted object
                  try {
                    const encryptedObj = EncryptedObject.parse(new Uint8Array(blobData));
                    const fullId = encryptedObj.id;

                    toast.success(`Parsed encrypted object ID: ${fullId}`);
                    console.log('Parsed encrypted object ID:', fullId);
                    
                    // 12. Construct transaction bytes for approval
                    const txBytes = await decryptor.constructTxBytes("allowlist", [fullId]);
                    toast.success(`Transaction bytes created: ${txBytes.length} bytes`);
                    console.log('Transaction bytes created, length:', txBytes.length);
                    
                    // 13. Attempt decryption
                    console.log('Attempting decryption with:', {
                      dataLength: blobData.byteLength,
                      sessionKeyAddress: sessionKey.getAddress(),
                      sessionKeyPackageId: sessionKey.getPackageId(),
                      txBytesLength: txBytes.length
                    });
                    
                    try {
                      const decryptedBytes = await decryptor.client.decrypt({
                        data: new Uint8Array(blobData),
                        sessionKey,
                        txBytes
                      });
                      
                      toast.success(`Successfully decrypted ${decryptedBytes.length} bytes!`);
                      
                      // 14. Try to parse as JSON
                      const textDecoder = new TextDecoder('utf-8');
                      const jsonString = textDecoder.decode(decryptedBytes);
                      
                      try {
                        const jsonData = JSON.parse(jsonString);
                        toast.success('Successfully parsed decrypted JSON!');
                      } catch (jsonError) {
                        toast.error('Failed to parse JSON from decrypted data');
                      }
                    } catch (decryptError) {
                      toast.error(`Decryption failed: ${decryptError.message}`);
                    }
                  } catch (parseError) {
                    toast.error(`Parse error: ${parseError.message}`);
                  }
                } else {
                  toast.error(`Direct URL fetch failed: ${directResponse.status}`);
                }
              } catch (fetchError) {
                toast.error(`Blob fetch error: ${fetchError.message}`);
              }
            } catch (blobIdError) {
              toast.error(`Error fetching blob IDs: ${blobIdError.message}`);
            }
          },
          onError: (error) => {
            toast.error(`Failed to sign message: ${error.message}`);
          }
        },
      );
    } catch (signError) {
      toast.error(`Failed to sign message: ${signError.message}`);
    }
  } catch (error) {
    console.error('General error in handleDecryptBlob:', error);
    toast.error(`Error: ${error.message}`);
  } finally {
    setProcessingShipment(null);
  }
  
  return false;
};

  // Original view detail function
  const handleViewDetail = async (shipmentId: string) => {
    try {

      const decryptor = new Decryptor(suiClient);

      const sessionKey = new SessionKey({
        address: suiAddress,
        packageId,
        ttlMin: 10,
      });
      
      toast.info('Please sign the message in your wallet to continue');
      
      await signPersonalMessage({
        message : sessionKey.getPersonalMessage(),
      },
    {
        onSuccess: async (result) => {
          await sessionKey.setPersonalMessageSignature(result.signature);
          console.log('Signature set successfully');
        },
        onError: (error) => {
          console.error('Error signing message:', error);
          toast.error('Failed to sign message');
        }
    });
      
      toast.success('Signature verified, accessing shipment details');

      // fetch blobIds
      const path = `${baseUrl}/bundle?transportationId=${shipmentId}`;
      console.log('Fetching sensor data from:', path);
      
      const response = await fetch(path, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const blobIds = await response.json();
      if (!Array.isArray(blobIds) || blobIds.length === 0) {
        toast.error('No blob IDs found');
        throw new Error('Invalid blob IDs received');
      }
      toast.success(`Blob IDs retrieved successfully ${blobIds.length} items`);

      await decryptor.retrieveBlobs(blobIds, sessionKey)
        .then((jsonData) => {
          console.log("Decrypted data:", jsonData);
        })
        .catch((error) => {
          console.error("Error retrieving blobs:", error);
          toast.error('Failed to retrieve blobs',error);
        });

      
      
      // Use navigate instead of direct window.location for better React integration
      // Also add a small delay to ensure the toast is visible
      // setTimeout(() => {
      //   navigate(`/shipment/${shipmentId}`);
      // }, 500);
      
      return true;
    } catch (error) {
      console.error('Error signing message:', error);
      toast.error('Failed to sign message');
      return false;
    }
  };

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
              <div key={shipment.id} className="relative">
                <ShipmentCard
                  id={shipment.id}
                  name={shipment.name}
                  status={shipment.status}
                  origin={shipment.origin}
                  destination={shipment.destination}
                  lastUpdated={shipment.lastUpdated}
                  onViewDetail={() => handleViewDetail(shipment.id)}
                />
                
                {/* Add test buttons */}
                <div className="absolute top-14 right-4 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 hover:bg-blue-100 text-xs h-8 px-2 py-1"
                    onClick={() => handleReadBlob(shipment.id)}
                    disabled={processingShipment === shipment.id}
                  >
                    <FileText size={14} className="mr-1" />
                    Read Blob
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-50 hover:bg-green-100 text-xs h-8 px-2 py-1"
                    onClick={() => handleDecryptBlob(shipment.id)}
                    disabled={processingShipment === shipment.id}
                  >
                    <FileKey size={14} className="mr-1" />
                    Decrypt
                  </Button>
                </div>
                
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
