import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockchainRetrieverDto } from './create-blockchain-retriever.dto';

export class UpdateBlockchainRetrieverDto extends PartialType(CreateBlockchainRetrieverDto) {}
