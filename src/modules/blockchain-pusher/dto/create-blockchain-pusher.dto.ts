import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsEnum,
  IsNumber, 
  IsObject, 
  IsOptional,
  IsString, 
  ValidateNested 
} from 'class-validator';
import { TransactionStatus } from '@/shared/enums';

export class MetadataDto {
  @IsString()
  device_id: string;

  @IsNumber()
  timestamp: number;

  @IsString()
  data_hash: string;

  @IsString()
  name: string;

  @IsString()
  origin: string;

  @IsString()
  destination: string;
}

export class PayloadItemDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;

  @IsString()
  encrypted_data: string;
}

export class CreateBlockchainPusherDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayloadItemDto)
  batch: PayloadItemDto[];

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus = TransactionStatus.PENDING;
}