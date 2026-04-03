import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CompletePairingDto {
  @ApiProperty() @IsString() token: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() model: string;
  @ApiProperty() @IsString() osVersion: string;
  @ApiProperty() @IsString() appVersion: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(3) simCount: number;
  @ApiPropertyOptional() @IsOptional() simDetails?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsString() fcmToken?: string;
}

class HeartbeatDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) batteryLevel?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(4) signalStrength?: number;
}

class UpdateDeviceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isEnabled?: boolean;
}

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('pair/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Generate a QR code for device pairing' })
  async generatePairing(@Request() req: any) {
    return this.devicesService.generatePairingQr(req.user.id);
  }

  @Post('pair')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete device pairing (called by Android app)' })
  async completePairing(@Body() dto: CompletePairingDto) {
    return this.devicesService.completePairing(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all devices' })
  async listDevices(@Request() req: any) {
    return this.devicesService.listDevices(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get device details' })
  async getDevice(@Request() req: any, @Param('id') id: string) {
    return this.devicesService.getDevice(req.user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update device name or enabled status' })
  async updateDevice(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    return this.devicesService.updateDevice(req.user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove a device' })
  async deleteDevice(@Request() req: any, @Param('id') id: string) {
    return this.devicesService.deleteDevice(req.user.id, id);
  }

  @Post(':id/ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Device heartbeat ping (called by Android app)' })
  async ping(@Param('id') id: string, @Body() dto: HeartbeatDto) {
    await this.devicesService.updateHeartbeat(id, dto);
    return { ok: true, timestamp: new Date().toISOString() };
  }
}
