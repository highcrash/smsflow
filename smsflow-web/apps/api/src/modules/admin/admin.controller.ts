import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide stats (admin only)' })
  getStats(@Request() req: any) {
    return this.adminService.getStats(req.user.role);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users (admin only)' })
  listUsers(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.listUsers(req.user.role, page, limit);
  }
}
