import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { GetContactMessagesDto } from './dto/get-contact-messages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  // Public — anyone can send a message from the contact-us page
  @Post()
  create(
    @Body() dto: CreateContactMessageDto,
    @CurrentUser() user?: any,
  ) {
    return this.contactMessagesService.create(dto, user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  @Get()
  findAll(@Query() query: GetContactMessagesDto) {
    return this.contactMessagesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactMessagesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  @Put(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number) {
    return this.contactMessagesService.markRead(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  @Put(':id/unread')
  markUnread(@Param('id', ParseIntPipe) id: number) {
    return this.contactMessagesService.markUnread(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactMessagesService.remove(id);
  }
}
