/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Ctor, IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { finalize } from 'rxjs';

import { Disposable } from '../../shared/lifecycle';
import { type UnitType, UniverInstanceType } from '../../common/unit';
import { LifecycleStages } from '../lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../lifecycle/lifecycle.service';
import { ILogService } from '../log/log.service';
import { DependentOnSymbol, type Plugin, type PluginCtor, PluginRegistry, PluginStore } from './plugin';

const INIT_LAZY_PLUGINS_TIMEOUT = 4;

/**
 * Use this decorator to declare dependencies among plugins. If a dependent plugin is not registered yet,
 * Univer will automatically register it with no configuration.
 *
 * For example:
 *
 * ```ts
 * ⁣@DependentOn(UniverDrawingPlugin, UniverDrawingUIPlugin, UniverSheetsDrawingPlugin)
 * export class UniverSheetsDrawingUIPlugin extends Plugin {
 * }
 * ```
 */
export function DependentOn(...plugins: PluginCtor<Plugin>[]) {
    return function (target: PluginCtor<Plugin>) {
        target[DependentOnSymbol] = plugins;
    };
}

/**
 * This service manages plugin registration.
 */
export class PluginService implements IDisposable {
    private readonly _pluginHolderForUniver: PluginHolder;
    private readonly _pluginHoldersForTypes = new Map<UnitType, PluginHolder>();
    private readonly _seenPlugins = new Set<string>();

    constructor(
        @Inject(Injector) private readonly _injector: Injector
    ) {
        this._pluginHolderForUniver = this._injector.createInstance(PluginHolder,
            this._checkPluginSeen.bind(this),
            this._immediateInitPlugin.bind(this)
        );

        this._pluginHolderForUniver.start();
    }

    dispose(): void {
        this._clearFlushTimer();

        for (const holder of this._pluginHoldersForTypes.values()) {
            holder.dispose();
        }

        this._pluginHolderForUniver.dispose();
    }

    /** Register a plugin into univer. */
    registerPlugin<T extends PluginCtor>(ctor: T, config?: ConstructorParameters<T>[0]): void {
        this._assertPluginValid(ctor);
        this._scheduleInitPlugin();

        const { type } = ctor;
        if (type === UniverInstanceType.UNIVER_UNKNOWN) {
            this._pluginHolderForUniver.register(ctor, config);
            this._pluginHolderForUniver.flush();
        } else {
            // If it's type is for specific document, we should run them at specific time.
            const holder = this._ensurePluginHolderForType(type);
            holder.register(ctor, config);
        }
    }

    startPluginForType(type: UniverInstanceType): void {
        const holder = this._ensurePluginHolderForType(type);
        holder.start();
    }

    private _ensurePluginHolderForType(type: UnitType): PluginHolder {
        if (!this._pluginHoldersForTypes.has(type)) {
            const pluginHolder = this._injector.createInstance(PluginHolder,
                this._checkPluginSeen.bind(this),
                this._immediateInitPlugin.bind(this)
            );
            this._pluginHoldersForTypes.set(type, pluginHolder);
            return pluginHolder;
        }

        return this._pluginHoldersForTypes.get(type)!;
    }

    private _immediateInitPlugin(ctor: PluginCtor): void {
        this._seenPlugins.add(ctor.pluginName);

        const holder = this._ensurePluginHolderForType(ctor.type);
        holder.immediateInitPlugin(ctor);
    }

    private _checkPluginSeen(ctor: PluginCtor<Plugin>): boolean {
        return this._seenPlugins.has(ctor.pluginName);
    }

    private _assertPluginValid(ctor: PluginCtor<Plugin>): void {
        const { type, pluginName } = ctor;

        if (type === UniverInstanceType.UNRECOGNIZED) {
            throw new Error(`[PluginService]: invalid plugin type for ${ctor}. Please assign a "type" to your plugin.`);
        }

        if (pluginName === '') {
            throw new Error(`[PluginService]: no plugin name for ${ctor}. Please assign a "pluginName" to your plugin.`);
        }

        if (this._seenPlugins.has(pluginName)) {
            throw new Error(`[PluginService]: duplicate plugin name for "${pluginName}".`);
        }

        this._seenPlugins.add(ctor.pluginName);
    }

    private _flushTimer?: number;
    private _scheduleInitPlugin() {
        if (this._flushTimer === undefined) {
            this._flushTimer = setTimeout(
                () => {
                    if (!this._pluginHolderForUniver.started) {
                        this._pluginHolderForUniver.start();
                    }

                    this._flushPlugins();
                    this._clearFlushTimer();
                },
                INIT_LAZY_PLUGINS_TIMEOUT
            ) as unknown as number;
        }
    }

    private _clearFlushTimer() {
        if (this._flushTimer) {
            clearTimeout(this._flushTimer);
            this._flushTimer = undefined;
        }
    }

    private _flushPlugins() {
        this._pluginHolderForUniver.flush();
        for (const [_, holder] of this._pluginHoldersForTypes) {
            if (holder.started) {
                holder.flush();
            }
        }
    }
}

export class PluginHolder extends Disposable {
    protected _started: boolean = false;
    get started(): boolean { return this._started; }

    /** Plugin constructors waiting to be initialized. */
    protected readonly _pluginRegistry = new PluginRegistry();
    /** Stores initialized plugin instances. */
    protected readonly _pluginStore = new PluginStore();

    constructor(
        private _checkPluginRegistered: (pluginCtor: PluginCtor) => boolean,
        private _registerPlugin: <T extends PluginCtor>(plugin: T, config?: ConstructorParameters<T>[0]) => void,
        @ILogService protected readonly _logService: ILogService,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LifecycleService) protected readonly _lifecycleService: LifecycleService,
        @Inject(LifecycleInitializerService) protected readonly _lifecycleInitializerService: LifecycleInitializerService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._pluginStore.forEachPlugin((plugin) => plugin.dispose());
        this._pluginStore.removePlugins();

        this._pluginRegistry.removePlugins();
    }

    register<T extends PluginCtor<Plugin>>(pluginCtor: T, config?: ConstructorParameters<T>[0]): void {
        this._pluginRegistry.registerPlugin(pluginCtor, config);
    }

    immediateInitPlugin<T extends Plugin>(plugin: PluginCtor<T>): void {
        const p = this._initPlugin(plugin, undefined);
        this._pluginsRunLifecycle([p]);
    }

    start(): void {
        if (this._started) return;
        this._started = true;

        this.flush();
    }

    flush(): void {
        if (!this._started) {
            return;
        };

        const plugins = this._pluginRegistry.getRegisterPlugins().map(({ plugin, options }) => this._initPlugin(plugin, options));
        this._pluginsRunLifecycle(plugins);
        this._pluginRegistry.removePlugins();
    }

    // eslint-disable-next-line ts/no-explicit-any
    private _initPlugin<T extends Plugin>(plugin: PluginCtor<T>, options: any): Plugin {
        const dependents = plugin[DependentOnSymbol];
        if (dependents) {
            const exhaustUnregisteredDependents = () => {
                const NotRegistered = dependents.find((d) => !this._checkPluginRegistered(d));
                if (NotRegistered) {
                    this._logService.warn(
                        '[PluginService]',
                        `plugin "${plugin.pluginName}" depends on "${NotRegistered.pluginName}" which is not registered. Univer will automatically register it with default configuration.`
                    );

                    this._registerPlugin(NotRegistered, undefined);
                    return true;
                }

                return false;
            };

            while (exhaustUnregisteredDependents()) {
                continue;
            }
        }

        // eslint-disable-next-line ts/no-explicit-any
        const pluginInstance: Plugin = this._injector.createInstance(plugin as unknown as Ctor<any>, options);
        this._pluginStore.addPlugin(pluginInstance);

        return pluginInstance;
    }

    protected _pluginsRunLifecycle(plugins: Plugin[]): void {
        const run = (lifecycle: LifecycleStages) => {
            plugins.forEach((p) => {
                switch (lifecycle) {
                    case LifecycleStages.Starting:
                        p.onStarting(this._injector);
                        break;
                    case LifecycleStages.Ready:
                        p.onReady();
                        break;
                    case LifecycleStages.Rendered:
                        p.onRendered();
                        break;
                    case LifecycleStages.Steady:
                        p.onSteady();
                        break;
                }
                this._lifecycleInitializerService.initModulesOnStage(lifecycle);
            });
        };

        const subscription = this.disposeWithMe(this._lifecycleService.subscribeWithPrevious()
            // It has to been async because the finalize may execute synchronously after we
            // make the subscription. For example, the lifecycle service is already in stage "steady".
            .pipe(finalize(() => { Promise.resolve().then(() => subscription.dispose()); }))
            .subscribe((stage) => { run(stage); }));
    }
}
