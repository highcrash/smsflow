import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { WsGatewayModule } from '../../gateway/ws.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [WsGatewayModule, AuthModule],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
