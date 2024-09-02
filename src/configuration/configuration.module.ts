import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './app.config'
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true
        })
    ]
})
export class ConfigurationModule {}
