import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Subject, map, merge } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { ChatEventsService } from './chat.events.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { TypingDto } from './dto/typing.dto';
import { ReactMessageDto } from './dto/react-message.dto';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';

const SENDER_SELECT = {
  Id: true,
  FirstName: true,
  LastName: true,
  UserName: true,
  Avatar: true,
  Role_Id: true,
};

const MESSAGE_SELECT = {
  Id: true,
  Course_Id: true,
  Content: true,
  AttachmentUrl: true,
  AttachmentName: true,
  AttachmentType: true,
  AttachmentSize: true,
  ReplyTo_Id: true,
  CreatedAt: true,
  Sender: { select: SENDER_SELECT },
  ReplyTo: {
    select: {
      Id: true,
      Content: true,
      AttachmentUrl: true,
      AttachmentName: true,
      Sender: { select: SENDER_SELECT },
    },
  },
  Reactions: { select: { User_Id: true, Reaction: true } },
};

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: ChatEventsService,
  ) {}

  // ------------------------------------------------------------------
  // Access control
  // ------------------------------------------------------------------

  private async assertAccess(user: any, courseId: number) {
    if (user.roleId === 3) return; // admins can see every course chat
    const course = await this.prisma.courses.findUnique({
      where: { Id: courseId },
      select: { Teacher_Id: true },
    });
    if (!course) throw new NotFoundException('دوره پیدا نشد');
    if (user.roleId === 2) {
      if (course.Teacher_Id !== user.id) {
        throw new ForbiddenException('شما مدرس این دوره نیستید');
      }
      return;
    }
    const enrollment = await this.prisma.enrollments.findFirst({
      where: { Course_Id: courseId, Student_Id: user.id },
      select: { Id: true },
    });
    if (!enrollment) {
      throw new ForbiddenException('شما عضو این دوره نیستید');
    }
  }

  /** All users that belong to a course chat (students + teacher + admins). */
  private async getParticipantIds(courseId: number): Promise<number[]> {
    const course = await this.prisma.courses.findUnique({
      where: { Id: courseId },
      select: { Teacher_Id: true },
    });
    if (!course) return [];
    const enrollments = await this.prisma.enrollments.findMany({
      where: { Course_Id: courseId },
      select: { Student_Id: true },
    });
    const admins = await this.prisma.users.findMany({
      where: { Role_Id: 3, IsActive: true },
      select: { Id: true },
    });
    const ids = new Set<number>([
      course.Teacher_Id,
      ...enrollments.map((e) => e.Student_Id),
      ...admins.map((a) => a.Id),
    ]);
    return Array.from(ids);
  }

  // ------------------------------------------------------------------
  // Chat list
  // ------------------------------------------------------------------

  async getUserChats(user: any) {
    let courseIds: number[];
    if (user.roleId === 3) {
      const courses = await this.prisma.courses.findMany({
        select: { Id: true },
      });
      courseIds = courses.map((c) => c.Id);
    } else if (user.roleId === 2) {
      const courses = await this.prisma.courses.findMany({
        where: { Teacher_Id: user.id },
        select: { Id: true },
      });
      courseIds = courses.map((c) => c.Id);
    } else {
      const enrollments = await this.prisma.enrollments.findMany({
        where: { Student_Id: user.id },
        select: { Course_Id: true },
      });
      courseIds = enrollments.map((e) => e.Course_Id);
    }

    if (courseIds.length === 0) return [];

    const courses = await this.prisma.courses.findMany({
      where: { Id: { in: courseIds } },
      select: {
        Id: true,
        Title: true,
        Thumbnail: true,
        IsPublished: true,
        Users: { select: { Id: true, FirstName: true, LastName: true } },
        Enrollments: { select: { Student_Id: true } },
      },
    });

    const adminCount = await this.prisma.users.count({
      where: { Role_Id: 3, IsActive: true },
    });

    // Latest message id per course
    const latest = await this.prisma.chatMessages.groupBy({
      by: ['Course_Id'],
      where: { Course_Id: { in: courseIds } },
      _max: { Id: true },
    });
    const lastIds = latest
      .map((l) => l._max.Id)
      .filter((id): id is number => id !== null);
    const lastMessages = lastIds.length
      ? await this.prisma.chatMessages.findMany({
          where: { Id: { in: lastIds } },
          select: {
            Id: true,
            Course_Id: true,
            Content: true,
            AttachmentUrl: true,
            AttachmentName: true,
            AttachmentType: true,
            CreatedAt: true,
            Sender: { select: SENDER_SELECT },
          },
        })
      : [];

    const myReads = await this.prisma.chatReads.findMany({
      where: { User_Id: user.id, Course_Id: { in: courseIds } },
      select: { Course_Id: true, LastReadMessage_Id: true },
    });
    const readMap = new Map(
      myReads.map((r) => [r.Course_Id, r.LastReadMessage_Id]),
    );

    const chats = await Promise.all(
      courses.map(async (course) => {
        const last = lastMessages.find((m) => m.Course_Id === course.Id);
        const lastRead = readMap.get(course.Id) ?? 0;
        const unread = await this.prisma.chatMessages.count({
          where: { Course_Id: course.Id, Id: { gt: lastRead } },
        });
        return {
          Id: course.Id,
          Title: course.Title,
          Thumbnail: course.Thumbnail,
          IsPublished: course.IsPublished,
          Teacher: course.Users,
          MemberCount: course.Enrollments.length + 1 + adminCount,
          LastMessage: last
            ? {
                Id: last.Id,
                Content: last.Content,
                AttachmentUrl: last.AttachmentUrl,
                AttachmentName: last.AttachmentName,
                AttachmentType: last.AttachmentType,
                CreatedAt: last.CreatedAt,
                Sender: last.Sender,
              }
            : null,
          UnreadCount: unread,
          LastReadMessageId: lastRead,
        };
      }),
    );

    chats.sort((a, b) => {
      const ta = a.LastMessage
        ? new Date(a.LastMessage.CreatedAt).getTime()
        : 0;
      const tb = b.LastMessage
        ? new Date(b.LastMessage.CreatedAt).getTime()
        : 0;
      return tb - ta;
    });
    return chats;
  }

  // ------------------------------------------------------------------
  // Messages
  // ------------------------------------------------------------------

  async getMessages(
    user: any,
    courseId: number,
    beforeId?: number,
    limit = 30,
  ) {
    await this.assertAccess(user, courseId);
    const take = Math.min(Math.max(limit, 1), 100);
    const messages = await this.prisma.chatMessages.findMany({
      where: {
        Course_Id: courseId,
        ...(beforeId ? { Id: { lt: beforeId } } : {}),
      },
      orderBy: { Id: 'desc' },
      take,
      select: MESSAGE_SELECT,
    });
    messages.reverse();

    const participants = await this.getParticipantIds(courseId);
    const reads = await this.prisma.chatReads.findMany({
      where: { Course_Id: courseId },
      select: { User_Id: true, LastReadMessage_Id: true },
    });
    const readState: Record<number, number> = {};
    reads.forEach((r) => {
      readState[r.User_Id] = r.LastReadMessage_Id;
    });

    return {
      messages,
      readState,
      participantIds: participants,
      hasMore: messages.length === take,
    };
  }

  async sendMessage(user: any, courseId: number, dto: SendMessageDto) {
    await this.assertAccess(user, courseId);
    if (!dto.content && !dto.attachmentUrl) {
      throw new BadRequestException('متن یا فایل پیام الزامی است');
    }
    const message = await this.prisma.chatMessages.create({
      data: {
        Course_Id: courseId,
        Sender_Id: user.id,
        Content: dto.content ?? null,
        AttachmentUrl: dto.attachmentUrl ?? null,
        AttachmentName: dto.attachmentName ?? null,
        AttachmentType: dto.attachmentType ?? null,
        AttachmentSize: dto.attachmentSize
          ? BigInt(dto.attachmentSize)
          : null,
        ReplyTo_Id: dto.replyToId ?? null,
      },
      select: MESSAGE_SELECT,
    });

    // The sender has obviously read their own message
    await this.upsertRead(user.id, courseId, message.Id);

    const participants = await this.getParticipantIds(courseId);
    this.events.emitToUsers(participants, 'new-message', { courseId, message });
    return message;
  }

  async deleteMessage(user: any, messageId: number) {
    const message = await this.prisma.chatMessages.findUnique({
      where: { Id: messageId },
      select: { Id: true, Course_Id: true, Sender_Id: true },
    });
    if (!message) throw new NotFoundException('پیام پیدا نشد');
    if (message.Sender_Id !== user.id && user.roleId !== 3) {
      throw new ForbiddenException('شما نمی‌توانید این پیام را حذف کنید');
    }
    await this.prisma.$transaction([
      this.prisma.chatMessageReactions.deleteMany({
        where: { Message_Id: messageId },
      }),
      this.prisma.chatMessages.delete({ where: { Id: messageId } }),
    ]);
    const participants = await this.getParticipantIds(message.Course_Id);
    this.events.emitToUsers(participants, 'message-deleted', {
      courseId: message.Course_Id,
      messageId,
    });
    return { ok: true };
  }

  async markRead(user: any, courseId: number, dto: MarkReadDto) {
    await this.assertAccess(user, courseId);
    const msg = await this.prisma.chatMessages.findUnique({
      where: { Id: dto.lastReadMessageId },
      select: { Course_Id: true },
    });
    if (!msg || msg.Course_Id !== courseId) {
      throw new NotFoundException('پیام پیدا نشد');
    }
    await this.upsertRead(user.id, courseId, dto.lastReadMessageId);
    const participants = await this.getParticipantIds(courseId);
    this.events.emitToUsers(participants, 'read', {
      courseId,
      userId: user.id,
      lastReadMessageId: dto.lastReadMessageId,
    });
    return { ok: true };
  }

  private async upsertRead(
    userId: number,
    courseId: number,
    lastReadMessageId: number,
  ) {
    const existing = await this.prisma.chatReads.findUnique({
      where: { User_Id_Course_Id: { User_Id: userId, Course_Id: courseId } },
    });
    if (existing && existing.LastReadMessage_Id >= lastReadMessageId) return;
    await this.prisma.chatReads.upsert({
      where: { User_Id_Course_Id: { User_Id: userId, Course_Id: courseId } },
      create: {
        User_Id: userId,
        Course_Id: courseId,
        LastReadMessage_Id: lastReadMessageId,
      },
      update: { LastReadMessage_Id: lastReadMessageId, UpdatedAt: new Date() },
    });
  }

  async typing(user: any, courseId: number, dto: TypingDto) {
    await this.assertAccess(user, courseId);
    const participants = await this.getParticipantIds(courseId);
    this.events.emitToUsers(
      participants.filter((p) => p !== user.id),
      'typing',
      {
        courseId,
        userId: user.id,
        isTyping: dto.isTyping,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    );
    return { ok: true };
  }

  // ------------------------------------------------------------------
  // Reactions
  // ------------------------------------------------------------------

  async react(user: any, messageId: number, dto: ReactMessageDto) {
    const message = await this.prisma.chatMessages.findUnique({
      where: { Id: messageId },
      select: { Course_Id: true },
    });
    if (!message) throw new NotFoundException('پیام پیدا نشد');
    await this.assertAccess(user, message.Course_Id);

    const existing = await this.prisma.chatMessageReactions.findUnique({
      where: {
        Message_Id_User_Id: { Message_Id: messageId, User_Id: user.id },
      },
    });
    if (existing && existing.Reaction === dto.reaction) {
      // same reaction again => toggle off
      await this.prisma.chatMessageReactions.delete({ where: { Id: existing.Id } });
    } else {
      await this.prisma.chatMessageReactions.upsert({
        where: {
          Message_Id_User_Id: { Message_Id: messageId, User_Id: user.id },
        },
        create: {
          Message_Id: messageId,
          User_Id: user.id,
          Reaction: dto.reaction,
        },
        update: { Reaction: dto.reaction },
      });
    }

    const reactions = await this.prisma.chatMessageReactions.findMany({
      where: { Message_Id: messageId },
      select: { User_Id: true, Reaction: true },
    });
    const participants = await this.getParticipantIds(message.Course_Id);
    this.events.emitToUsers(participants, 'reaction', {
      courseId: message.Course_Id,
      messageId,
      reactions,
    });
    return reactions;
  }

  // ------------------------------------------------------------------
  // Members
  // ------------------------------------------------------------------

  async getMembers(user: any, courseId: number) {
    await this.assertAccess(user, courseId);
    const course = await this.prisma.courses.findUnique({
      where: { Id: courseId },
      select: {
        Id: true,
        Title: true,
        Teacher_Id: true,
        Users: { select: SENDER_SELECT },
      },
    });
    if (!course) throw new NotFoundException('دوره پیدا نشد');

    const enrollments = await this.prisma.enrollments.findMany({
      where: { Course_Id: courseId },
      select: { Student_Id: true },
    });
    const studentIds = enrollments.map((e) => e.Student_Id);
    const students = studentIds.length
      ? await this.prisma.users.findMany({
          where: { Id: { in: studentIds } },
          select: SENDER_SELECT,
        })
      : [];
    const admins = await this.prisma.users.findMany({
      where: { Role_Id: 3, IsActive: true },
      select: SENDER_SELECT,
    });

    const reads = await this.prisma.chatReads.findMany({
      where: { Course_Id: courseId },
      select: { User_Id: true, LastReadMessage_Id: true },
    });
    const readMap = new Map(reads.map((r) => [r.User_Id, r.LastReadMessage_Id]));

    const shape = (u: any, roleLabel: string) => ({
      Id: u.Id,
      FirstName: u.FirstName,
      LastName: u.LastName,
      UserName: u.UserName,
      Avatar: u.Avatar,
      RoleLabel: roleLabel,
      IsOnline: this.events.isOnline(u.Id),
      LastReadMessageId: readMap.get(u.Id) ?? 0,
    });

    return {
      CourseId: course.Id,
      CourseTitle: course.Title,
      Members: [
        ...(course.Users ? [shape(course.Users, 'مدرس')] : []),
        ...students.map((s) => shape(s, 'دانشجو')),
        ...admins.map((a) => shape(a, 'مدیر')),
      ],
    };
  }

  // ------------------------------------------------------------------
  // Polls (innovation: live polls inside the course chat)
  // ------------------------------------------------------------------

  async getPolls(user: any, courseId: number) {
    await this.assertAccess(user, courseId);
    return this.loadPolls(courseId, user.id);
  }

  private async loadPolls(courseId: number, userId: number) {
    const polls = await this.prisma.chatPolls.findMany({
      where: { Course_Id: courseId },
      orderBy: { Id: 'desc' },
      select: {
        Id: true,
        Question: true,
        IsActive: true,
        CreatedAt: true,
        Users: { select: SENDER_SELECT },
        Options: {
          select: {
            Id: true,
            OptionText: true,
            Votes: { select: { User_Id: true } },
          },
        },
      },
    });
    return polls.map((p) => {
      const totalVotes = p.Options.reduce(
        (sum, o) => sum + o.Votes.length,
        0,
      );
      return {
        Id: p.Id,
        Question: p.Question,
        IsActive: p.IsActive,
        CreatedAt: p.CreatedAt,
        Creator: p.Users,
        TotalVotes: totalVotes,
        MyVote:
          p.Options.find((o) => o.Votes.some((v) => v.User_Id === userId))
            ?.Id ?? null,
        Options: p.Options.map((o) => ({
          Id: o.Id,
          OptionText: o.OptionText,
          Votes: o.Votes.length,
          Percent: totalVotes
            ? Math.round((o.Votes.length / totalVotes) * 100)
            : 0,
        })),
      };
    });
  }

  async createPoll(user: any, courseId: number, dto: CreatePollDto) {
    await this.assertAccess(user, courseId);
    if (user.roleId !== 2 && user.roleId !== 3) {
      throw new ForbiddenException(
        'فقط مدرس یا مدیر می‌تواند نظرسنجی ایجاد کند',
      );
    }
    if (user.roleId === 2) {
      const course = await this.prisma.courses.findUnique({
        where: { Id: courseId },
        select: { Teacher_Id: true },
      });
      if (!course || course.Teacher_Id !== user.id) {
        throw new ForbiddenException('شما مدرس این دوره نیستید');
      }
    }

    const poll = await this.prisma.chatPolls.create({
      data: {
        Course_Id: courseId,
        Creator_Id: user.id,
        Question: dto.question,
        Options: {
          create: dto.options.map((text) => ({ OptionText: text })),
        },
      },
      select: { Id: true },
    });

    const loaded = await this.loadPolls(courseId, user.id);
    const created = loaded.find((p) => p.Id === poll.Id);
    const participants = await this.getParticipantIds(courseId);
    this.events.emitToUsers(participants, 'new-poll', {
      courseId,
      poll: created,
    });
    return created;
  }

  async votePoll(user: any, pollId: number, dto: VotePollDto) {
    const poll = await this.prisma.chatPolls.findUnique({
      where: { Id: pollId },
      select: { Id: true, Course_Id: true, IsActive: true },
    });
    if (!poll) throw new NotFoundException('نظرسنجی پیدا نشد');
    if (!poll.IsActive) throw new BadRequestException('نظرسنجی بسته شده است');
    await this.assertAccess(user, poll.Course_Id);

    const option = await this.prisma.chatPollOptions.findUnique({
      where: { Id: dto.optionId },
      select: { Id: true, Poll_Id: true },
    });
    if (!option || option.Poll_Id !== pollId) {
      throw new NotFoundException('گزینه پیدا نشد');
    }

    // Remove previous vote(s) of this user on this poll (allows changing vote)
    const previous = await this.prisma.chatPollVotes.findMany({
      where: {
        User_Id: user.id,
        ChatPollOptions: { Poll_Id: pollId },
      },
      select: { Id: true },
    });
    await this.prisma.$transaction([
      ...(previous.length
        ? [
            this.prisma.chatPollVotes.deleteMany({
              where: { Id: { in: previous.map((p) => p.Id) } },
            }),
          ]
        : []),
      this.prisma.chatPollVotes.create({
        data: { Option_Id: dto.optionId, User_Id: user.id },
      }),
    ]);

    const loaded = await this.loadPolls(poll.Course_Id, user.id);
    const updated = loaded.find((p) => p.Id === pollId);
    const participants = await this.getParticipantIds(poll.Course_Id);
    this.events.emitToUsers(participants, 'poll-vote', {
      courseId: poll.Course_Id,
      pollId,
      poll: updated,
    });
    return updated;
  }

  // ------------------------------------------------------------------
  // SSE stream
  // ------------------------------------------------------------------

  streamEvents(userId: number, req: any) {
    const stream = this.events.subscribe(userId);
    // Heartbeat keeps proxies from closing an idle connection
    const heartbeat = new Subject<any>();
    const timer = setInterval(() => {
      heartbeat.next(new MessageEvent('ping', { data: JSON.stringify({ ts: Date.now() }) }));
    }, 25000);
    req.on('close', () => {
      clearInterval(timer);
      heartbeat.complete();
    });

    const userEvents = stream.pipe(
      map(({ type, data }: { type: string; data: unknown }) =>
        new MessageEvent(type, { data: JSON.stringify(data) }),
      ),
    );
    return merge(userEvents, heartbeat);
  }
}
