import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BlockchainPusherService } from './blockchain-pusher.service';
import { CreateBlockchainPusherDto } from './dto/create-blockchain-pusher.dto';

@Controller('blockchain-pusher')
export class BlockchainPusherController {
  constructor(private readonly blockchainPusherService: BlockchainPusherService) {}

  @Post()
  create(@Body() createBlockchainPusherDto: CreateBlockchainPusherDto) {
    return this.blockchainPusherService.deployVault(createBlockchainPusherDto);
  }

  @Get()
  balance() {
    return this.blockchainPusherService.balance();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blockchainPusherService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBlockchainPusherDto: UpdateBlockchainPusherDto) {
  //   return this.blockchainPusherService.update(+id, updateBlockchainPusherDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockchainPusherService.remove(+id);
  }
}
