import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { BlockchainRetrieverService } from './blockchain-retriever.service';
import { CreateBlockchainRetrieverDto } from './dto/create-blockchain-retriever.dto';
import { UpdateBlockchainRetrieverDto } from './dto/update-blockchain-retriever.dto';

@Controller('blockchain-retriever')
export class BlockchainRetrieverController {
  constructor(private readonly blockchainRetrieverService: BlockchainRetrieverService) {}

  @Post()
  create(@Body() createBlockchainRetrieverDto: CreateBlockchainRetrieverDto) {
    return this.blockchainRetrieverService.create(createBlockchainRetrieverDto);
  }

  @Get()
  retrieveAndDecrypt(
   // @Query('allowlistId') allowlistId: string, 
    @Query('blobId') blobId: string
  ) {
    if (//!allowlistId ||
     !blobId) {
      throw new BadRequestException('Both allowlistId and blobId query parameters are required');
    }
    return this.blockchainRetrieverService.retrieveAndDecrypt(blobId//, allowlistId

    );
  }

  @Get('bundle')
  async bundleBlob(@Query('transportationId') transportationId: string) {
    if (!transportationId) {
      throw new BadRequestException('transportationId query parameter is required');
    }
    return this.blockchainRetrieverService.bundleBlob(transportationId);
  }

  @Get('transportation/:id')
  async bundleBlobByTransportationId(@Param('id') transportationId: string) {
    if (!transportationId) {
      throw new BadRequestException('transportationId path parameter is required');
    }
    return this.blockchainRetrieverService.retriveTransportation(transportationId);
  }

  @Get('debug')
  debugReadblob(@Query('blobId') blobId: string) {
    if (!blobId) {
      throw new BadRequestException('blobId query parameter is required');
    }
    return this.blockchainRetrieverService.debugReadblob(blobId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockchainRetrieverDto: UpdateBlockchainRetrieverDto) {
    return this.blockchainRetrieverService.update(+id, updateBlockchainRetrieverDto);
  }

  @Get(':id')
  retriveAccountTrasportation(@Param('id') id: string) {
    return this.blockchainRetrieverService.retriveAccountTrasportation(id);
  }
}
