import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { WsGatewayModule } from '../../gateway/ws.gateway';
import { AuthModule } from '../auth/auth.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { CombinedAuthGuard } from '../../common/guards/combined-auth.guard';

@Module({
  imports: [WsGatewayModule, AuthModule, ApiKeysModule],
  providers: [MessagesService, CombinedAuthGuard],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
