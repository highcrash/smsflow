import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MessagesService, SendMessageDto, SendBulkDto } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a single SMS message' })
  async sendMessage(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(req.user.id, dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send bulk SMS messages' })
  async sendBulk(@Request() req: any, @Body() dto: SendBulkDto) {
    return this.messagesService.sendBulk(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List messages with optional filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'direction', required: false })
  @ApiQuery({ name: 'deviceId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async listMessages(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('direction') direction?: string,
    @Query('deviceId') deviceId?: string,
    @Query('search') search?: string,
  ) {
    return this.messagesService.listMessages(
      req.user.id,
      { status, direction, deviceId, search },
      { page: page || 1, limit: Math.min(limit || 20, 100) },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get message details' })
  async getMessage(@Request() req: any, @Param('id') id: string) {
    return this.messagesService.getMessage(req.user.id, id);
  }
}
