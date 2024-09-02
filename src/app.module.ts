import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssistantModule } from './assistant/assistant.module';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [ConfigurationModule,AssistantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
