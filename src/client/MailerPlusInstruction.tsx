import { MailOutlined } from '@ant-design/icons';
import { ArrayItems } from '@formily/antd-v5';
import React from 'react';

import { SchemaComponentContext, css } from '@nocobase/client';
import {
  Instruction,
  WorkflowVariableInput,
  WorkflowVariableRawTextArea,
  WorkflowVariableTextArea,
  defaultFieldNames,
} from '@nocobase/plugin-workflow/client';

import { NAMESPACE } from './locale';

const emailsClass = css`
  width: 100%;
  .ant-space-item:nth-child(2) {
    flex-grow: 1;
  }
`;

const attachmentClass = css`
  width: 100%;
  .ant-space-item:nth-child(2) {
    flex-grow: 1;
  }
`;

export default class extends Instruction {
  title = `{{t("Mailer Plus", { ns: "${NAMESPACE}" })}}`;
  type = 'mailer-plus';
  group = 'extended';
  description = `{{t("Send email with attachment support. Use upstream variables for recipients, content, and attachments.", { ns: "${NAMESPACE}" })}}`;
  icon = (<MailOutlined style={{ color: '#1677ff' }} />);
  fieldset = {
    provider: {
      type: 'object',
      properties: {
        server: {
          type: 'void',
          'x-decorator': 'SchemaComponentContext.Provider',
          'x-decorator-props': {
            value: { designable: false },
          },
          'x-component': 'Grid',
          properties: {
            row: {
              type: 'void',
              'x-component': 'Grid.Row',
              properties: {
                host: {
                  type: 'void',
                  'x-component': 'Grid.Col',
                  'x-component-props': { width: 50 },
                  properties: {
                    host: {
                      type: 'string',
                      required: true,
                      title: `{{t("SMTP host", { ns: "${NAMESPACE}" })}}`,
                      'x-decorator': 'FormItem',
                      'x-component': 'WorkflowVariableInput',
                      'x-component-props': {
                        useTypedConstant: [['string', { placeholder: 'smtp.example.com' }]],
                      },
                    },
                  },
                },
                port: {
                  type: 'void',
                  'x-component': 'Grid.Col',
                  'x-component-props': { width: 25 },
                  properties: {
                    port: {
                      type: 'number',
                      required: true,
                      title: `{{t("Port", { ns: "${NAMESPACE}" })}}`,
                      'x-decorator': 'FormItem',
                      'x-component': 'WorkflowVariableInput',
                      'x-component-props': {
                        useTypedConstant: [['number', { min: 1, max: 65535, step: 1 }]],
                      },
                      default: 465,
                    },
                  },
                },
                secure: {
                  type: 'void',
                  'x-component': 'Grid.Col',
                  'x-component-props': { width: 25 },
                  properties: {
                    secure: {
                      type: 'boolean',
                      title: `{{t("Secure", { ns: "${NAMESPACE}" })}}`,
                      description: `{{t("In most cases, if using port 465, set it to true; otherwise, set it to false.", { ns: "${NAMESPACE}" })}}`,
                      'x-decorator': 'FormItem',
                      'x-component': 'WorkflowVariableInput',
                      'x-component-props': {
                        useTypedConstant: [['boolean', { style: { width: '100%' } }]],
                      },
                      default: true,
                    },
                  },
                },
              },
            },
          },
        },
        auth: {
          type: 'void',
          'x-decorator': 'SchemaComponentContext.Provider',
          'x-decorator-props': {
            value: { designable: false },
          },
          'x-component': 'Grid',
          properties: {
            row: {
              type: 'void',
              'x-component': 'Grid.Row',
              properties: {
                user: {
                  type: 'void',
                  'x-component': 'Grid.Col',
                  properties: {
                    'auth.user': {
                      type: 'string',
                      title: `{{t("User", { ns: "${NAMESPACE}" })}}`,
                      'x-decorator': 'FormItem',
                      'x-component': 'WorkflowVariableInput',
                      'x-component-props': {
                        useTypedConstant: [['string', { placeholder: 'example@domain.com' }]],
                      },
                    },
                  },
                },
                pass: {
                  type: 'void',
                  'x-component': 'Grid.Col',
                  properties: {
                    'auth.pass': {
                      type: 'string',
                      title: `{{t("Password", { ns: "${NAMESPACE}" })}}`,
                      'x-decorator': 'FormItem',
                      'x-component': 'WorkflowVariableInput',
                      'x-component-props': {
                        useTypedConstant: [['string', { type: 'password' }]],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    from: {
      type: 'string',
      required: true,
      title: `{{t("From", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableInput',
      'x-component-props': {
        useTypedConstant: [['string', { placeholder: 'noreply <example@domain.com>' }]],
      },
    },
    to: {
      type: 'array',
      required: true,
      title: `{{t("To", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      items: {
        type: 'void',
        'x-component': 'Space',
        'x-component-props': { className: emailsClass },
        properties: {
          sort: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayItems.SortHandle',
          },
          input: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'WorkflowVariableInput',
            'x-component-props': {
              useTypedConstant: ['string'],
              placeholder: `{{t("Email address")}}`,
            },
          },
          remove: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayItems.Remove',
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          title: `{{t("Add email address", { ns: "${NAMESPACE}" })}}`,
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
    cc: {
      type: 'array',
      title: `{{t("CC", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      items: {
        type: 'void',
        'x-component': 'Space',
        'x-component-props': { className: emailsClass },
        properties: {
          sort: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayItems.SortHandle',
          },
          input: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'WorkflowVariableInput',
            'x-component-props': {
              useTypedConstant: ['string'],
              placeholder: `{{t("Email address")}}`,
            },
          },
          remove: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayItems.Remove',
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          title: `{{t("Add email address", { ns: "${NAMESPACE}" })}}`,
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
    bcc: {
      type: 'array',
      title: `{{t("BCC", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      items: {
        type: 'void',
        'x-component': 'Space',
        'x-component-props': { className: emailsClass },
        properties: {
          sort: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayItems.SortHandle',
          },
          input: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'WorkflowVariableInput',
            'x-component-props': {
              useTypedConstant: ['string'],
              placeholder: `{{t("Email address")}}`,
            },
          },
          remove: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayItems.Remove',
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          title: `{{t("Add email address", { ns: "${NAMESPACE}" })}}`,
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
    subject: {
      type: 'string',
      title: `{{t("Subject", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableTextArea',
    },
    contentType: {
      type: 'string',
      title: `{{t("Content type", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      enum: [
        { label: 'HTML', value: 'html' },
        { label: `{{t("Plain text", { ns: "${NAMESPACE}" })}}`, value: 'text' },
      ],
      default: 'html',
    },
    html: {
      type: 'string',
      title: `{{t("Content", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableRawTextArea',
      'x-component-props': {
        placeholder: 'Hi,',
        autoSize: { minRows: 10 },
      },
      'x-reactions': [
        {
          dependencies: ['contentType'],
          fulfill: { state: { visible: '{{$deps[0] === "html"}}' } },
        },
      ],
    },
    text: {
      type: 'string',
      title: `{{t("Content", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableRawTextArea',
      'x-component-props': {
        placeholder: 'Hi,',
        autoSize: { minRows: 10 },
      },
      'x-reactions': [
        {
          dependencies: ['contentType'],
          fulfill: { state: { visible: '{{$deps[0] === "text"}}' } },
        },
      ],
    },
    attachments: {
      type: 'array',
      title: `{{t("Attachments", { ns: "${NAMESPACE}" })}}`,
      description: `{{t("Add files from upstream variables (attachment fields), URLs, or inline content.", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      items: {
        type: 'void',
        'x-component': 'Space',
        'x-component-props': { className: attachmentClass },
        properties: {
          sort: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayItems.SortHandle',
          },
          input: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'WorkflowVariableInput',
            'x-component-props': {
              useTypedConstant: ['string'],
              placeholder: `{{t("Attachment variable or URL", { ns: "${NAMESPACE}" })}}`,
            },
          },
          remove: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayItems.Remove',
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          title: `{{t("Add attachment", { ns: "${NAMESPACE}" })}}`,
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
    ignoreFail: {
      type: 'boolean',
      'x-content': `{{t("Ignore failed sending and continue workflow", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
    },
  };

  components = {
    ArrayItems,
    SchemaComponentContext,
    WorkflowVariableInput,
    WorkflowVariableTextArea,
    WorkflowVariableRawTextArea,
  };

  useVariables({ key, title }) {
    return {
      [defaultFieldNames.value]: key,
      [defaultFieldNames.label]: title,
      [defaultFieldNames.children]: [
        { [defaultFieldNames.value]: 'messageId', [defaultFieldNames.label]: 'Message ID' },
        { [defaultFieldNames.value]: 'accepted', [defaultFieldNames.label]: 'Accepted' },
        { [defaultFieldNames.value]: 'rejected', [defaultFieldNames.label]: 'Rejected' },
        { [defaultFieldNames.value]: 'attachmentCount', [defaultFieldNames.label]: 'Attachment count' },
      ],
    };
  }

  testable = false;
}
