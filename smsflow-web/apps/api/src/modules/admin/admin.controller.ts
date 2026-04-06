import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Stats ─────────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide stats (admin only)' })
  getStats(@Request() req: any) {
    return this.adminService.getStats(req.user.role);
  }

  // ─── Users ─────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List all users (admin only)' })
  listUsers(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers(req.user.role, page || 1, limit || 20, search);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details (admin only)' })
  getUser(@Request() req: any, @Param('id') id: string) {
    return this.adminService.getUser(req.user.role, id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role (admin only)' })
  updateUserRole(@Request() req: any, @Param('id') id: string, @Body('role') role: string) {
    return this.adminService.updateUserRole(req.user.role, id, role);
  }

  @Patch('users/:id/subscription')
  @ApiOperation({ summary: 'Update user subscription (admin only)' })
  updateUserSubscription(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateUserSubscription(req.user.role, id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user (admin only)' })
  deleteUser(@Request() req: any, @Param('id') id: string) {
    return this.adminService.deleteUser(req.user.role, id);
  }

  // ─── Impersonation ────────────────────────────────────

  @Post('users/:id/impersonate')
  @ApiOperation({ summary: 'Get tokens to log in as a user (admin only)' })
  impersonate(@Request() req: any, @Param('id') id: string) {
    return this.adminService.impersonate(req.user.role, id);
  }

  // ─── Plans ────────────────────────────────────────────

  @Get('plans')
  @ApiOperation({ summary: 'List all plans (admin only)' })
  listPlans(@Request() req: any) {
    return this.adminService.listPlans(req.user.role);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create a plan (admin only)' })
  createPlan(@Request() req: any, @Body() dto: any) {
    return this.adminService.createPlan(req.user.role, dto);
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update a plan (admin only)' })
  updatePlan(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.adminService.updatePlan(req.user.role, id, dto);
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete a plan (admin only)' })
  deletePlan(@Request() req: any, @Param('id') id: string) {
    return this.adminService.deletePlan(req.user.role, id);
  }
}
