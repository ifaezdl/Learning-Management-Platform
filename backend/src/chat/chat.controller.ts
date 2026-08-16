import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { SseAuthGuard } from './guards/sse-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { TypingDto } from './dto/typing.dto';
import { ReactMessageDto } from './dto/react-message.dto';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Sse('events')
  @UseGuards(SseAuthGuard)
  @ApiOperation({ summary: 'Live chat events (SSE), token via ?token=' })
  events(@CurrentUser() user: any, @Req() req: any) {
    return this.chatService.streamEvents(user.id, req);
  }

  @Get('courses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List course chats of the current user' })
  myChats(@CurrentUser() user: any) {
    return this.chatService.getUserChats(user);
  }

  @Get('courses/:courseId/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Paginated messages of a course chat' })
  messages(
    @CurrentUser() user: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('beforeId') beforeId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(
      user,
      courseId,
      beforeId ? Number(beforeId) : undefined,
      limit ? Number(limit) : 30,
    );
  }

  @Get('courses/:courseId/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Members of a course chat with online status' })
  members(
    @CurrentUser() user: any,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.chatService.getMembers(user, courseId);
  }

  @Post('courses/:courseId/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send a message (text / attachment / reply)' })
  send(
    @CurrentUser() user: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user, courseId, dto);
  }

  @Delete('messages/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a message (sender or admin)' })
  deleteMessage(
    @CurrentUser() user: any,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    return this.chatService.deleteMessage(user, messageId);
  }

  @Post('courses/:courseId/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark messages as read up to an id' })
  markRead(
    @CurrentUser() user: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: MarkReadDto,
  ) {
    return this.chatService.markRead(user, courseId, dto);
  }

  @Post('courses/:courseId/typing')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Typing indicator' })
  typing(
    @CurrentUser() user: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: TypingDto,
  ) {
    return this.chatService.typing(user, courseId, dto);
  }

  @Post('messages/:messageId/reaction')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'React to a message (same reaction toggles off)' })
  react(
    @CurrentUser() user: any,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() dto: ReactMessageDto,
  ) {
    return this.chatService.react(user, messageId, dto);
  }

  @Get('courses/:courseId/polls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Polls of a course chat' })
  polls(
    @CurrentUser() user: any,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.chatService.getPolls(user, courseId);
  }

  @Post('courses/:courseId/polls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a poll (teacher or admin)' })
  createPoll(
    @CurrentUser() user: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreatePollDto,
  ) {
    return this.chatService.createPoll(user, courseId, dto);
  }

  @Post('polls/:pollId/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Vote on a poll (can change vote)' })
  vote(
    @CurrentUser() user: any,
    @Param('pollId', ParseIntPipe) pollId: number,
    @Body() dto: VotePollDto,
  ) {
    return this.chatService.votePoll(user, pollId, dto);
  }
}
