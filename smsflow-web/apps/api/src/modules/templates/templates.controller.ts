import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService, CreateTemplateDto } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post() @ApiOperation({ summary: 'Create a message template' })
  create(@Request() req: any, @Body() dto: CreateTemplateDto) {
    return this.templatesService.create(req.user.id, dto);
  }

  @Get() @ApiOperation({ summary: 'List templates' })
  list(@Request() req: any) {
    return this.templatesService.list(req.user.id);
  }

  @Get(':id') @ApiOperation({ summary: 'Get template' })
  get(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.get(req.user.id, id);
  }

  @Patch(':id') @ApiOperation({ summary: 'Update template' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) {
    return this.templatesService.update(req.user.id, id, dto);
  }

  @Delete(':id') @ApiOperation({ summary: 'Delete template' })
  delete(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.delete(req.user.id, id);
  }
}
