import { Body, Controller, Get, Param, Patch, Post, UseGuards, Req, UploadedFiles } from '@nestjs/common';
import { CreateAssistantDTO } from './dto/create-assistant.dto';
import { CreateConversationDTO } from './dto/create-conversation.dto';
import { AssistantService } from './assistant.service';
import { UpdateAssistantDTO } from './dto/update-assistant.dto';

import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { TimeoutInterceptor } from './interceptors/setTimeoput';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

const SetTimeout = (timeout: number) => SetMetadata('request-timeout', timeout);
export function SetRequestTimeout(timeout: number = 600000) {
  return applyDecorators(
    SetTimeout(timeout),
    UseInterceptors(TimeoutInterceptor),
  );
}

@Controller('assistant')
export class AssistantController {

    constructor(
        private readonly assistantService : AssistantService
    ){}

    @Post('/conversation')
    @SetTimeout(600000)
    @UseInterceptors(FilesInterceptor('attachments'))
    async createConversation(@Body() body : CreateConversationDTO , @UploadedFiles() attachments: any[], @Req() req: Request ){
        req.setTimeout(600000);
        const data = {
            ...body,
            attachments: attachments || [], // Añadir archivos adjuntos al objeto de datos si es necesario
        };


        return await this.assistantService.createConversation(data);
    }

    @Post('/taks-phrases')
    async tasks(@Body() data : any){
        return await this.assistantService.generateTasksIdeas(data);
    }

    @Post("/create/thread")
    async createThread(){
        return await this.assistantService.createThread();
    }


    

    @Get(':id/thread')
    async getMessagesByThread(@Param('id') thread_id : string){
        return this.assistantService.getMessagesByThread(thread_id);
    }
}
