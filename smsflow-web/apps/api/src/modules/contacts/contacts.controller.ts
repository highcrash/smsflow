import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService, CreateContactDto, UpdateContactDto } from './contacts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'List contacts with filters' })
  list(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('groupId') groupId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.contactsService.list(req.user.id, { search, groupId, page, limit });
  }

  @Post()
  @ApiOperation({ summary: 'Create a contact' })
  create(@Request() req: any, @Body() dto: CreateContactDto) {
    return this.contactsService.create(req.user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact' })
  get(@Request() req: any, @Param('id') id: string) {
    return this.contactsService.get(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contact' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  delete(@Request() req: any, @Param('id') id: string) {
    return this.contactsService.delete(req.user.id, id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import contacts from Excel file' })
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.contactsService.importFromExcel(req.user.id, file.buffer);
  }

  @Get('groups/list')
  @ApiOperation({ summary: 'List contact groups' })
  listGroups(@Request() req: any) {
    return this.contactsService.listGroups(req.user.id);
  }

  @Post('groups')
  @ApiOperation({ summary: 'Create a contact group' })
  createGroup(@Request() req: any, @Body('name') name: string, @Body('color') color?: string) {
    return this.contactsService.createGroup(req.user.id, name, color);
  }

  @Post('groups/:groupId/members')
  @ApiOperation({ summary: 'Add contacts to a group' })
  addToGroup(
    @Request() req: any,
    @Param('groupId') groupId: string,
    @Body('contactIds') contactIds: string[],
  ) {
    return this.contactsService.addToGroup(req.user.id, groupId, contactIds);
  }

  @Delete('groups/:groupId')
  @ApiOperation({ summary: 'Delete a contact group' })
  deleteGroup(@Request() req: any, @Param('groupId') groupId: string) {
    return this.contactsService.deleteGroup(req.user.id, groupId);
  }
}
