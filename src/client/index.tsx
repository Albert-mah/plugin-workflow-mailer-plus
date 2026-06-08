import { Plugin } from '@nocobase/client';
import WorkflowPlugin from '@nocobase/plugin-workflow/client';
import MailerPlusInstruction from './MailerPlusInstruction';

export default class extends Plugin {
  async afterAdd() {}
  async beforeLoad() {}

  async load() {
    const workflow = this.app.pm.get('workflow') as WorkflowPlugin;
    workflow.registerInstruction('mailer-plus', MailerPlusInstruction);
  }
}
