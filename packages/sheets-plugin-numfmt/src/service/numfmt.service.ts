import { Disposable, ICommandService, Nullable, ObjectMatrix } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { NumfmtItem } from '../base/types';
import { SetNumfmtMutation } from '../commands/mutations/set.numfmt.mutation';
import type { INumfmtService, NumfmtItemWithCache } from './type';

export class NumfmtService extends Disposable implements INumfmtService {
    numfmtModel: Map<string, ObjectMatrix<NumfmtItemWithCache>> = new Map();
    // collect effect mutations when edit end and push this to  commands stack in next commands progress

    constructor(@Inject(ICommandService) private _commandService: ICommandService) {
        super();
        this._initCommands();
    }

    private _initCommands() {
        [SetNumfmtMutation].forEach((config) => this.disposeWithMe(this._commandService.registerCommand(config)));
    }

    getValue(workbookId: string, worksheetId: string, row: number, col: number) {
        const model = this.getModel(workbookId, worksheetId);
        if (!model) {
            return null;
        }
        return model.getValue(row, col);
    }

    setValue(workbookId: string, worksheetId: string, row: number, col: number, value: Nullable<NumfmtItem>) {
        let model = this.getModel(workbookId, worksheetId);
        if (!model) {
            const key = getModelKey(workbookId, worksheetId);
            model = new ObjectMatrix();
            this.numfmtModel.set(key, model);
        }
        if (value) {
            model.setValue(row, col, value);
        } else {
            model.realDeleteValue(row, col);
        }
    }

    getModel(workbookId: string, worksheetId: string) {
        const key = getModelKey(workbookId, worksheetId);
        return this.numfmtModel.get(key);
    }
}

const getModelKey = (workbookId: string, worksheetId: string) => `${workbookId}_${worksheetId}`;
