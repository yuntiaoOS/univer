import { createIdentifier, Inject } from '@wendellhu/redi';

import { Disposable } from '../../shared';
import type { Workbook } from '../../sheets/workbook';
import type { IWorkbookData } from '../../types/interfaces/i-workbook-data';
import { IUniverInstanceService } from '../instance/instance.service';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';
import { IResourceManagerService } from './type';

export interface IPersistenceService {
    saveWorkBook: (workbook: Workbook) => IWorkbookData;
}

export const IPersistenceService = createIdentifier<IPersistenceService>('LocalPersistenceService');

@OnLifecycle(LifecycleStages.Ready, LocalPersistenceService)
export class LocalPersistenceService extends Disposable implements IPersistenceService {
    constructor(
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initWorkBook();
    }

    private _initWorkBook() {
        this._univerInstanceService.sheetAdded$.subscribe((workbook) => this._initWorkbookFromSnapshot(workbook));
        const workbooks = this._univerInstanceService.getAllUniverSheetsInstance();
        workbooks.forEach((workbook) => {
            this._initWorkbookFromSnapshot(workbook);
        });
    }

    private _initWorkbookFromSnapshot(workbook: Workbook) {
        const workbookId = workbook.getUnitId();
        const snapshot = workbook.getSnapshot();
        const resources = this._resourceManagerService.getAllResource(workbookId);
        resources.forEach((resource) => {
            const resourceSnapshot = (snapshot.resources || []).find((item) => item.name === resource.resourceName);
            if (resourceSnapshot) {
                const model = resource.hook.parseJson(resourceSnapshot.data);
                resource.hook.onChange(workbookId, model);
            }
        });
    }

    saveWorkBook(workbook: Workbook) {
        const snapshot = { ...workbook.getSnapshot() };
        const unitId = workbook.getUnitId();
        const resourceHooks = this._resourceManagerService.getAllResource(workbook.getUnitId());
        const resources = resourceHooks.map((resourceHook) => {
            const data = resourceHook.hook.toJson(unitId);
            return {
                name: resourceHook.resourceName,
                data,
            };
        });
        snapshot.resources = resources;
        return snapshot;
    }
}