import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[ ConfigModule],
  providers: [AssistantService],
  controllers: [AssistantController],
  exports:[AssistantService]
})
export class AssistantModule {}
