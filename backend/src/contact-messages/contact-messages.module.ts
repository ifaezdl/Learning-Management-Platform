import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContactMessagesController } from './contact-messages.controller';
import { ContactMessagesService } from './contact-messages.service';

@Module({
  controllers: [ContactMessagesController],
  providers: [ContactMessagesService, PrismaService],
})
export class ContactMessagesModule {}
