import { CCBoolean, Component, director, Scene, _decorator, sys, Vec2, Vec3, IVec3Like } from "cc";
import { HardwareInputSystem, InputConfig } from "./HardwareInputSystem";
const { ccclass, property } = _decorator;

@ccclass('HardwareInputs')
export class HardwareInputs extends Component {

    @property(InputConfig)
    configs: InputConfig[] = [];

    @property(CCBoolean)
    dontDestroyOnLoad = false;

    system: HardwareInputSystem | null = null;

    private static input: HardwareInputs;

    static getValue(name: string): number {
        return this.input?.system?.getValue(name);
    }

    static getKeyDown(name: string): boolean {
        return this.input?.system?.getKeyDown(name);
    }

    static getKeyUp(name: string): boolean {
        return this.input?.system?.getKeyUp(name);
    }

    static getKey(name: string): boolean {
        return this.input?.system?.getKey(name);
    }

    static get mousePosition(): Readonly<IVec3Like> {
        return this.input?.system.mousePosition
    }

    onLoad() {

        HardwareInputs.input = this;

        if (this.node.parent instanceof Scene == false) {
            throw new Error("HardwareInputs muse be top-level node in scene");
        }

        if (this.dontDestroyOnLoad) {
            if (!director.isPersistRootNode(this.node)) {
                director.addPersistRootNode(this.node)
            }
        }

        this.system = new HardwareInputSystem(this.configs);
        this.system.init();
    }

    update(dt: number) {
        this.system.update(dt);
    }

    lateUpdate(dt: number) {
        this.system.postUpdate(dt);
    }

    onDestroy() {
        this.system.destroy();
    }
}

