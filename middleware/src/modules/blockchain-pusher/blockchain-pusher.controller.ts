import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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

  @Get('allow')
  createAllow(@Query('allowlistId') allowlistId: string, @Query('address') address: string) {
    return this.blockchainPusherService.createAllow(allowlistId, address);
  }

  @Get(':id')
  pushBatch(@Param('id') id: string) {
    return this.blockchainPusherService.pushBatch(id);
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
