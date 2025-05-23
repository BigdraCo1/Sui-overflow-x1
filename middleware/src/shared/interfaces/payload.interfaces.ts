export interface IMetadata {
    device_id: string;
    timestamp: number;
    data_hash: string;
  }
  
  export interface IPayloadItem {
    metadata: IMetadata;
    encrypted_data: string;
  }