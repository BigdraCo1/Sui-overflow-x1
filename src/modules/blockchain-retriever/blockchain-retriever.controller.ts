import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  findAll() {
    return this.blockchainRetrieverService.findAll();
  }

  @Get(':id')
  retrieveAndDecrypt(@Param('id') id: string) {
    return this.blockchainRetrieverService.retrieveAndDecrypt(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockchainRetrieverDto: UpdateBlockchainRetrieverDto) {
    return this.blockchainRetrieverService.update(+id, updateBlockchainRetrieverDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockchainRetrieverService.remove(+id);
  }
}
