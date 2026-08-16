import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatEventsService } from './chat.events.service';
import { SseAuthGuard } from './guards/sse-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatEventsService, SseAuthGuard],
  exports: [ChatEventsService],
})
export class ChatModule {}
