import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { GetContactMessagesDto } from './dto/get-contact-messages.dto';

@Injectable()
export class ContactMessagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContactMessageDto, userId?: number) {
    const message = await this.prisma.contactMessages.create({
      data: {
        FullName: dto.fullName,
        Email: dto.email,
        Phone: dto.phone ?? null,
        Subject: dto.subject ?? null,
        Message: dto.message,
        User_Id: userId ?? null,
      },
    });

    return {
      message: 'پیام شما با موفقیت ارسال شد. تیم پشتیبانی در اولین فرصت با شما تماس می‌گیرد.',
      id: message.Id,
    };
  }

  async findAll(query: GetContactMessagesDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10));
    const search = (query.search ?? '').trim();
    const status = query.status ?? 'all';

    const where: any = {};

    if (status === 'unread') {
      where.IsRead = false;
    } else if (status === 'read') {
      where.IsRead = true;
    }

    if (search) {
      where.OR = [
        { FullName: { contains: search } },
        { Email: { contains: search } },
        { Phone: { contains: search } },
        { Subject: { contains: search } },
        { Message: { contains: search } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.contactMessages.count({ where }),
      this.prisma.contactMessages.findMany({
        where,
        orderBy: { CreatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      items,
    };
  }

  async findOne(id: number) {
    const message = await this.prisma.contactMessages.findUnique({
      where: { Id: id },
    });

    if (!message) {
      throw new NotFoundException('پیام مورد نظر یافت نشد.');
    }

    return message;
  }

  async markRead(id: number) {
    const message = await this.findOne(id);
    if (!message.IsRead) {
      await this.prisma.contactMessages.update({
        where: { Id: id },
        data: { IsRead: true },
      });
    }
    return { message: 'پیام به‌عنوان خوانده‌شده علامت خورد.' };
  }

  async markUnread(id: number) {
    await this.findOne(id);
    await this.prisma.contactMessages.update({
      where: { Id: id },
      data: { IsRead: false },
    });
    return { message: 'پیام به‌عنوان خوانده‌نشده علامت خورد.' };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.contactMessages.delete({ where: { Id: id } });
    return { message: 'پیام با موفقیت حذف شد.' };
  }
}
