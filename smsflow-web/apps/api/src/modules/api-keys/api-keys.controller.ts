import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService, CreateApiKeyDto } from './api-keys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateApiKeyBodyDto implements CreateApiKeyDto {
  @ApiProperty({ example: 'WordPress Integration' }) @IsString() name: string;
  @ApiPropertyOptional({ example: ['send', 'read'] }) @IsOptional() @IsArray() permissions?: string[];
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiresAt?: string;
}

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  async create(@Request() req: any, @Body() dto: CreateApiKeyBodyDto) {
    return this.apiKeysService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys (without secret)' })
  async list(@Request() req: any) {
    return this.apiKeysService.list(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.apiKeysService.delete(req.user.id, id);
  }
}
