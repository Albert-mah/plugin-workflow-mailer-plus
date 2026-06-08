import { Plugin } from '@nocobase/client';
export default class extends Plugin {
    afterAdd(): Promise<void>;
    beforeLoad(): Promise<void>;
    load(): Promise<void>;
}
