import { Context, Plugin, PLUGIN_NAMES } from '@univer/core';
import { <%= projectUpperValue %>Button } from './View/UI/<%= projectUpperValue %>Button';
import { zh, en } from './Locale';

import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { IOCContainer } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { <%= projectConstantValue % >_PLUGIN_NAME} from './Basic/Const/PLUGIN_NAME'

interface IPluginConfig {}

interface IConfig {}

export class <%= projectUpperValue %>Plugin extends Plugin {

    constructor(config ?: IPluginConfig) {
        super(<%= projectConstantValue %>_PLUGIN_NAME);
    }

    initialize(): void {

        const context = this.getContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en: en,
            zh: zh,
        });

        const item: IToolBarItemProps = {
            locale: '<%= projectValue %>',
            type: ISlotElement.JSX,
            show: true,
            label: <<%= projectUpperValue %>Button />
        }
    context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item)
}

onMapping(IOC: IOCContainer): void {}

onMounted(ctx: Context): void {
    this.initialize()
}

onDestroy(): void {}
}
