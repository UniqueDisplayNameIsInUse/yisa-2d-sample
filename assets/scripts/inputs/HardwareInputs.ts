import { CCBoolean, Component, director, Scene, _decorator } from "cc";
import { HardwareInputSystem, InputConfig } from "./HardwareInputSystem";
const { ccclass, property } = _decorator;

@ccclass('HardwareInputs')
export class HardwareInputs extends Component {

    @property(InputConfig)
    configs: InputConfig[] = [];

    @property(CCBoolean)
    dontDestroyOnLoad = false;

    system: HardwareInputSystem | null = null;

    onLoad() {
        if (this.node.parent instanceof Scene == false) {
            throw new Error("HardwareInputs muse be top-level node in scene");
        }

        if (this.dontDestroyOnLoad) {
            if (!director.isPersistRootNode(this.node)) {
                director.addPersistRootNode(this.node)
            }
        }

        this.system = new HardwareInputSystem(this.configs);
        director.registerSystem("HardwareInptus", this.system, 0);
    }

    onDestroy() {
        director.unregisterSystem(this.system);
    }
}

