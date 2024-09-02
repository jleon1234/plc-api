import { BadRequestException, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { CreateConversationDTO } from './dto/create-conversation.dto';
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
import axios from 'axios';
const multer = require('multer');


@Injectable()
export class AssistantService {

    private settings;
    private api: OpenAI

    constructor(
        private configService: ConfigService,
    ) {

        this.settings = this.configService.get('openAI');
        const configuration = new OpenAI({
            apiKey: this.settings.apiKey,
        });
        this.api = configuration;
    }



    async createThread() {
        const thread = await this.api.beta.threads.create();
        return thread.id;
    }

    async validateLastMessageRun(thread_id): Promise<string> {
        let messagesD = await this.api.beta.threads.messages.list(
            thread_id
        );

        let { run_id } = messagesD.data[0];

        let runStatusD = await this.api.beta.threads.runs.retrieve(
            thread_id,
            run_id
        );

        return runStatusD.status;
    }



    async uploadFileToOpenAI(filePath) {
        try {
            const fileStream = fs.createReadStream(filePath);
            const formData = new FormData();
            formData.append('file', fileStream);
            formData.append('purpose', "fine-tune");

            const response = await axios.post('https://api.openai.com/v1/files', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${this.settings.apiKey}`, // Cambia YOUR_API_KEY por tu clave de API
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error subiendo archivo a OpenAI:', error);
            throw error;
        }
    }

    async createConversation(data: CreateConversationDTO) {
        let thread_id = data.thread_id;
        console.log("entro a la conversacion demo")
        try {



            // let runStatusD = await this.validateLastMessageRun(thread_id);

            // console.log(runStatusD);

            // while (runStatusD !== "completed") {
            //     await new Promise((resolve) => setTimeout(resolve, 2500));
            //     runStatusD = await this.validateLastMessageRun(thread_id);
            // }



            // Subir y adjuntar archivos si los hay
            const fileIds = [];

            if (data.attachments && data.attachments.length > 0) {
                console.log("Entrando a los attachments");

                await Promise.all(data.attachments.map(async (attachment) => {
                    // Supongamos que `attachment` tiene una propiedad `originalname` y `buffer`
                    const uploadDir = path.join(__dirname, 'uploads');

                    // Asegúrate de que el directorio existe
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    // Define el path completo para el archivo
                    const filePath = path.join(uploadDir, attachment.originalname);
                    console.log("Ruta del archivo antes de subir:", filePath);

                    // Guarda el archivo recibido en el servidor
                    fs.writeFileSync(filePath, attachment.buffer);

                    // Sube el archivo a OpenAI
                    try {
                        const uploadResponse = await this.uploadFileToOpenAI(filePath);
                        console.log("Archivo subido a OpenAI con éxito");

                        // Almacena el ID del archivo subido
                        fileIds.push(uploadResponse.id);

                        // Elimina el archivo después de subirlo
                        fs.unlinkSync(filePath);
                    } catch (error) {
                        console.error('Error subiendo archivo a OpenAI:', error.response);
                    }
                }));
            }

            console.log(fileIds);
            
            const defaultTool = { type: 'code_interpreter' };

            const attachments : any = fileIds.map(id => ({
                file_id: id,
                tools: [{"type": "code_interpreter"}],
            }));

            try {
                await this.api.beta.threads.messages.create(
                    thread_id,
                    {
                        role: "user",
                        content: data.message,
                        attachments
                    }
                );
            } catch (error) {
                console.log(error);

            }

            console.log("paso los mensaje");

            const run = await this.api.beta.threads.runs.create(
                thread_id,
                {
                    assistant_id: data.assistant_id,
                    instructions: "\n\nSi te preguntan qué eres o quien eres, responde tomando en cuenta el rol que se te asignó como consultor especializado. \nINSTRUCCIONES OBLIGATORIAS:\n\nFormato: La respuesta debe ser en formato HTML.\n\nElementos Principales a Utilizar: Usa, al menos, estos elementos HTML: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, y <strong>.\n\nOtros Elementos Prohibidos: No Puedes usar <table>, <thead>, <tbody>, <tr>, <th>, <td>, entre otros relacionados con las tablas.\n\nEstructura Semántica: Asegúrate de que el contenido sea lógico y bien organizado.\n\nOmisión de Etiquetas: No incluyas etiquetas como <html>, <body>. Nos interesa el contenido dentro de <body>."
                }
            );

            let runStatus = await this.api.beta.threads.runs.retrieve(
                thread_id,
                run.id
            );


            while (runStatus.status !== "completed") {
                await new Promise((resolve) => setTimeout(resolve, 10000));
                runStatus = await this.api.beta.threads.runs.retrieve(
                    thread_id,
                    run.id
                );

            }

            const messages = await this.api.beta.threads.messages.list(
                thread_id
            );
            console.log(messages);


            return messages.data;
        } catch (error) {
            // console.log(error);
            return {
                error: true,
                msg: error.error
            };
        }
    }


    // async getMessageByThread(thread_id: string){
    //     const messages = await this.api.beta.threads.messages.list(
    //         thread_id
    //     );
    //     console.log(messages);
    //     return messages;
    // }




    async generateTasksIdeas(data: any) {
        try {
            const completion = await this.api.chat.completions.create({
                messages: [{ role: "user", content: data.content }],
                model: "gpt-3.5-turbo",
            });

            return completion.choices[0]
        } catch (error) {
            return {
                error: true,
                msg: "No se pudo obtener información"
            }
        }

    }





    async getMessagesByThread(thread_id: string) {


        try {
            const messages = await this.api.beta.threads.messages.list(
                thread_id
            );
            return messages;
        } catch (error) {
            return error.response
        }
    }
}

