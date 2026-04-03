import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List webhooks' })
  list(@Request() req: any) {
    return this.webhooksService.list(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a webhook' })
  create(@Request() req: any, @Body('url') url: string, @Body('events') events: string[]) {
    return this.webhooksService.create(req.user.id, url, events);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook' })
  get(@Request() req: any, @Param('id') id: string) {
    return this.webhooksService.get(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update webhook' })
  update(@Request() req: any, @Param('id') id: string, @Body() body: { url?: string; events?: string[]; isActive?: boolean }) {
    return this.webhooksService.update(req.user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete webhook' })
  delete(@Request() req: any, @Param('id') id: string) {
    return this.webhooksService.delete(req.user.id, id);
  }

  @Post(':id/rotate-secret')
  @ApiOperation({ summary: 'Regenerate webhook secret' })
  regenerateSecret(@Request() req: any, @Param('id') id: string) {
    return this.webhooksService.regenerateSecret(req.user.id, id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test webhook delivery' })
  test(@Request() req: any, @Param('id') id: string) {
    return this.webhooksService.testDelivery(req.user.id, id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get webhook delivery logs' })
  getLogs(
    @Request() req: any,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.webhooksService.getLogs(req.user.id, id, page, limit);
  }
}
