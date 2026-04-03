import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getDashboardStats(@Request() req: any) {
    return this.analyticsService.getDashboardStats(req.user.id);
  }

  @Get('chart')
  @ApiOperation({ summary: 'Get message chart data for the last N days' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getMessageChart(@Request() req: any, @Query('days') days?: number) {
    return this.analyticsService.getMessageChart(req.user.id, Number(days) || 7);
  }
}
