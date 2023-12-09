import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { Ctor } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import { functionArray } from '../functions/array/function-map';
import type { BaseFunction } from '../functions/base-function';
import { functionCompatibility } from '../functions/compatibility/function-map';
import { functionCube } from '../functions/cube/function-map';
import { functionDatabase } from '../functions/database/function-map';
import { functionDate } from '../functions/date/function-map';
import { functionEngineering } from '../functions/engineering/function-map';
import { functionFinancial } from '../functions/financial/function-map';
import { functionInformation } from '../functions/information/function-map';
import { functionLogical } from '../functions/logical/function-map';
import { functionLookup } from '../functions/lookup/function-map';
import { functionMath } from '../functions/math/function-map';
import { functionMeta } from '../functions/meta/function-map';
import { functionStatistical } from '../functions/statistical/function-map';
import { functionText } from '../functions/text/function-map';
import { functionUniver } from '../functions/univer/function-map';
import { functionWeb } from '../functions/web/function-map';
import { IFunctionService } from '../services/function.service';

@OnLifecycle(LifecycleStages.Ready, FormulaController)
export class FormulaController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(Injector) private readonly _injector: Injector,
        @IFunctionService private readonly _functionService: IFunctionService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._registerCommands();
        this._registerFunctions();
    }

    private _registerCommands(): void {
        [
            SetFormulaDataMutation,
            SetArrayFormulaDataMutation,
            SetFormulaCalculationStartMutation,
            SetFormulaCalculationStopMutation,
            SetFormulaCalculationNotificationMutation,
            SetFormulaCalculationResultMutation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _registerFunctions() {
        const functions: BaseFunction[] = [
            ...functionArray,
            ...functionCompatibility,
            ...functionCube,
            ...functionDatabase,
            ...functionDate,
            ...functionEngineering,
            ...functionFinancial,
            ...functionInformation,
            ...functionLogical,
            ...functionLookup,
            ...functionMath,
            ...functionMeta,
            ...functionStatistical,
            ...functionText,
            ...functionUniver,
            ...functionWeb,
        ].map((registerObject) => {
            const Func = registerObject[0] as Ctor<BaseFunction>;
            const name = registerObject[1] as string;

            return new Func(this._injector, name);
        });

        this._functionService.registerExecutors(...functions);
    }
}
