import { FlowNodeModel, Instruction, Processor } from '@nocobase/plugin-workflow';
export default class MailerPlusInstruction extends Instruction {
    private static transporterMap;
    private static configMap;
    private getTransporterKey;
    private isConfigChanged;
    private createNewTransporter;
    private getTransporter;
    run(node: FlowNodeModel, prevJob: any, processor: Processor): Promise<{
        status: 1;
        result: {
            messageId: any;
            accepted: any;
            rejected: any;
            attachmentCount: number;
            error?: undefined;
        };
    } | {
        status: 1 | -1;
        result: {
            error: any;
            messageId?: undefined;
            accepted?: undefined;
            rejected?: undefined;
            attachmentCount?: undefined;
        };
    }>;
    resume(node: FlowNodeModel, job: any, processor: Processor): Promise<any>;
}
