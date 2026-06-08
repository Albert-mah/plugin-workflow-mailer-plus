import React from 'react';
import { Instruction, WorkflowVariableInput, WorkflowVariableRawTextArea, WorkflowVariableTextArea } from '@nocobase/plugin-workflow/client';
export default class extends Instruction {
    title: string;
    type: string;
    group: string;
    description: string;
    icon: React.JSX.Element;
    fieldset: {
        provider: {
            type: string;
            properties: {
                server: {
                    type: string;
                    'x-decorator': string;
                    'x-decorator-props': {
                        value: {
                            designable: boolean;
                        };
                    };
                    'x-component': string;
                    properties: {
                        row: {
                            type: string;
                            'x-component': string;
                            properties: {
                                host: {
                                    type: string;
                                    'x-component': string;
                                    'x-component-props': {
                                        width: number;
                                    };
                                    properties: {
                                        host: {
                                            type: string;
                                            required: boolean;
                                            title: string;
                                            'x-decorator': string;
                                            'x-component': string;
                                            'x-component-props': {
                                                useTypedConstant: (string | {
                                                    placeholder: string;
                                                })[][];
                                            };
                                        };
                                    };
                                };
                                port: {
                                    type: string;
                                    'x-component': string;
                                    'x-component-props': {
                                        width: number;
                                    };
                                    properties: {
                                        port: {
                                            type: string;
                                            required: boolean;
                                            title: string;
                                            'x-decorator': string;
                                            'x-component': string;
                                            'x-component-props': {
                                                useTypedConstant: (string | {
                                                    min: number;
                                                    max: number;
                                                    step: number;
                                                })[][];
                                            };
                                            default: number;
                                        };
                                    };
                                };
                                secure: {
                                    type: string;
                                    'x-component': string;
                                    'x-component-props': {
                                        width: number;
                                    };
                                    properties: {
                                        secure: {
                                            type: string;
                                            title: string;
                                            description: string;
                                            'x-decorator': string;
                                            'x-component': string;
                                            'x-component-props': {
                                                useTypedConstant: (string | {
                                                    style: {
                                                        width: string;
                                                    };
                                                })[][];
                                            };
                                            default: boolean;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                auth: {
                    type: string;
                    'x-decorator': string;
                    'x-decorator-props': {
                        value: {
                            designable: boolean;
                        };
                    };
                    'x-component': string;
                    properties: {
                        row: {
                            type: string;
                            'x-component': string;
                            properties: {
                                user: {
                                    type: string;
                                    'x-component': string;
                                    properties: {
                                        'auth.user': {
                                            type: string;
                                            title: string;
                                            'x-decorator': string;
                                            'x-component': string;
                                            'x-component-props': {
                                                useTypedConstant: (string | {
                                                    placeholder: string;
                                                })[][];
                                            };
                                        };
                                    };
                                };
                                pass: {
                                    type: string;
                                    'x-component': string;
                                    properties: {
                                        'auth.pass': {
                                            type: string;
                                            title: string;
                                            'x-decorator': string;
                                            'x-component': string;
                                            'x-component-props': {
                                                useTypedConstant: (string | {
                                                    type: string;
                                                })[][];
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        from: {
            type: string;
            required: boolean;
            title: string;
            'x-decorator': string;
            'x-component': string;
            'x-component-props': {
                useTypedConstant: (string | {
                    placeholder: string;
                })[][];
            };
        };
        to: {
            type: string;
            required: boolean;
            title: string;
            'x-decorator': string;
            'x-component': string;
            items: {
                type: string;
                'x-component': string;
                'x-component-props': {
                    className: string;
                };
                properties: {
                    sort: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                    };
                    input: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                        'x-component-props': {
                            useTypedConstant: string[];
                            placeholder: string;
                        };
                    };
                    remove: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                    };
                };
            };
            properties: {
                add: {
                    type: string;
                    title: string;
                    'x-component': string;
                };
            };
        };
        cc: {
            type: string;
            title: string;
            'x-decorator': string;
            'x-component': string;
            items: {
                type: string;
                'x-component': string;
                'x-component-props': {
                    className: string;
                };
                properties: {
                    sort: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                    };
                    input: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                        'x-component-props': {
                            useTypedConstant: string[];
                            placeholder: string;
                        };
                    };
                    remove: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                    };
                };
            };
            properties: {
                add: {
                    type: string;
                    title: string;
                    'x-component': string;
                };
            };
        };
        bcc: {
            type: string;
            title: string;
            'x-decorator': string;
            'x-component': string;
            items: {
                type: string;
                'x-component': string;
                'x-component-props': {
                    className: string;
                };
                properties: {
                    sort: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                    };
                    input: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                        'x-component-props': {
                            useTypedConstant: string[];
                            placeholder: string;
                        };
                    };
                    remove: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                    };
                };
            };
            properties: {
                add: {
                    type: string;
                    title: string;
                    'x-component': string;
                };
            };
        };
        subject: {
            type: string;
            title: string;
            'x-decorator': string;
            'x-component': string;
        };
        contentType: {
            type: string;
            title: string;
            'x-decorator': string;
            'x-component': string;
            enum: {
                label: string;
                value: string;
            }[];
            default: string;
        };
        html: {
            type: string;
            title: string;
            'x-decorator': string;
            'x-component': string;
            'x-component-props': {
                placeholder: string;
                autoSize: {
                    minRows: number;
                };
            };
            'x-reactions': {
                dependencies: string[];
                fulfill: {
                    state: {
                        visible: string;
                    };
                };
            }[];
        };
        text: {
            type: string;
            title: string;
            'x-decorator': string;
            'x-component': string;
            'x-component-props': {
                placeholder: string;
                autoSize: {
                    minRows: number;
                };
            };
            'x-reactions': {
                dependencies: string[];
                fulfill: {
                    state: {
                        visible: string;
                    };
                };
            }[];
        };
        attachments: {
            type: string;
            title: string;
            description: string;
            'x-decorator': string;
            'x-component': string;
            items: {
                type: string;
                'x-component': string;
                'x-component-props': {
                    className: string;
                };
                properties: {
                    sort: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                    };
                    input: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                        'x-component-props': {
                            useTypedConstant: string[];
                            placeholder: string;
                        };
                    };
                    remove: {
                        type: string;
                        'x-decorator': string;
                        'x-component': string;
                    };
                };
            };
            properties: {
                add: {
                    type: string;
                    title: string;
                    'x-component': string;
                };
            };
        };
        ignoreFail: {
            type: string;
            'x-content': string;
            'x-decorator': string;
            'x-component': string;
        };
    };
    components: {
        ArrayItems: import("@formily/reactive-react").ReactFC<React.HTMLAttributes<HTMLDivElement>> & import("@formily/antd-v5").ArrayBaseMixins & {
            Item: import("@formily/reactive-react").ReactFC<React.HTMLAttributes<HTMLDivElement> & {
                type?: "card" | "divide";
            }>;
        };
        SchemaComponentContext: React.Context<import("@nocobase/client").ISchemaComponentContext>;
        WorkflowVariableInput: typeof WorkflowVariableInput;
        WorkflowVariableTextArea: typeof WorkflowVariableTextArea;
        WorkflowVariableRawTextArea: typeof WorkflowVariableRawTextArea;
    };
    useVariables({ key, title }: {
        key: any;
        title: any;
    }): {
        value: any;
        label: any;
        children: {
            value: string;
            label: string;
        }[];
    };
    testable: boolean;
}
