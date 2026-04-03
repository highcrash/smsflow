import {
  Controller, Get, Patch, Delete, Body, UseGuards, Request, Post, Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@Request() req: any, @Body() body: { name?: string; avatarUrl?: string }) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  deleteAccount(@Request() req: any) {
    return this.usersService.deleteAccount(req.user.id);
  }

  @Get('team')
  @ApiOperation({ summary: 'List team members' })
  listTeam(@Request() req: any) {
    return this.usersService.getTeamMembers(req.user.id);
  }

  @Post('team/invite')
  @ApiOperation({ summary: 'Invite a team member' })
  invite(
    @Request() req: any,
    @Body('email') email: string,
    @Body('role') role: 'ADMIN' | 'MEMBER' | 'VIEWER',
  ) {
    return this.usersService.inviteTeamMember(req.user.id, email, role);
  }

  @Delete('team/:memberId')
  @ApiOperation({ summary: 'Remove a team member' })
  removeTeamMember(@Request() req: any, @Param('memberId') memberId: string) {
    return this.usersService.removeTeamMember(req.user.id, memberId);
  }
}
