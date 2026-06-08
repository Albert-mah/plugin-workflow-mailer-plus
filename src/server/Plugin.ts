import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';
import MailerPlusInstruction from './MailerPlusInstruction';

export default class extends Plugin {
  async load() {
    const workflowPlugin = this.app.pm.get(WorkflowPlugin) as WorkflowPlugin;
    workflowPlugin.registerInstruction('mailer-plus', MailerPlusInstruction);
  }
}
