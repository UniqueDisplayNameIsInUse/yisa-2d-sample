import { ccenum, CCFloat, CCString, EventKeyboard, EventMouse, input, Input, KeyCode, math, System, _decorator } from "cc";
const { ccclass, property } = _decorator;

export enum KeyType {
    Axis = 0,
    Button,
}
ccenum(KeyType);

export enum HardewareInputType {
    Mouse = 0,
    Keyboard,
    JoyStick,
}
ccenum(HardewareInputType);
ccenum(KeyCode);

@ccclass("InputConfig")
export class InputConfig {

    @property(CCString)
    public name: string = 'horizontal';

    @property({ type: KeyType })
    public type: KeyType = KeyType.Button;

    @property({ type: HardewareInputType })
    public hardWareType: HardewareInputType = HardewareInputType.Keyboard;

    @property({ type: KeyCode })
    public positive: KeyCode = KeyCode.KEY_A;

    @property({ type: KeyCode })
    public nagetiveKey: KeyCode = KeyCode.KEY_D;

    @property({ type: CCFloat, range: [0, 1], step: 0.001 })
    public sensitiviy: number = 0.001;
    @property({ type: CCFloat, range: [0, 1], step: 0.001 })
    public damping: number = 0.001;

    public value: number = 0;
    public isPressed: boolean = false;
    public isReleased: boolean = false;
    public isPressing: boolean = false;

    resetInputState() {
        this.isPressed = false;
        this.isReleased = false;
    }
}

export class HardwareInputSystem extends System {

    config: InputConfig[] = [];

    private inputConfigs: Map<string, InputConfig> = new Map();

    private keyboards: Map<KeyCode, string> = new Map();

    private mouses: Map<number, string> = new Map();

    constructor(config: InputConfig[]) {
        super();
        this.config = config;
    }

    init(): void {
        this.initInternalMaps(this.config);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseButtonDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseButtonUp, this);
    }

    destroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseButtonDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseButtonUp, this);
    }

    protected initInternalMaps(configs: InputConfig[]) {

        for (let ic of configs) {
            this.inputConfigs.set(ic.name, ic);
        }

        for (let ic of this.inputConfigs.values()) {
            if (ic.hardWareType == HardewareInputType.Keyboard) {
                this.keyboards.set(ic.nagetiveKey, ic.name);
                this.keyboards.set(ic.positive, ic.name);
            } else if (ic.hardWareType == HardewareInputType.Mouse) {
                this.mouses.set(ic.positive, ic.name);
                this.mouses.set(ic.nagetiveKey, ic.name);
            }
        }
    }

    protected onKeyDown(ek: EventKeyboard) {
        if (this.keyboards.has(ek.keyCode)) {
            let name = this.keyboards.get(ek.keyCode);
            let ic = this.inputConfigs.get(name);
            ic.isPressed = true;
            console.log("down", ek.keyCode);
        }
    }

    protected onKeyPressing(ek: EventKeyboard) {
        if (this.keyboards.has(ek.keyCode)) {
            let name = this.keyboards.get(ek.keyCode);
            let ic = this.inputConfigs.get(name);
            ic.isPressing = true;
            console.log("down", ek.keyCode);
        }
    }

    protected onKeyUp(ek: EventKeyboard) {
        if (this.keyboards.has(ek.keyCode)) {
            let name = this.keyboards.get(ek.keyCode);
            let ic = this.inputConfigs.get(name);
            ic.isPressed = false;
            ic.isPressing = false;
            ic.isReleased = true;
            console.log("up", ek.keyCode);
        }
    }

    protected onMouseButtonDown(em: EventMouse) {

    }

    protected onMouseButtonUp(em: EventMouse) {

    }

    update(dt: number) {
        for (let ic of this.inputConfigs.values()) {
            if (ic.isPressed) {
                ic.value += ic.sensitiviy - (ic.value) * ic.damping;
            }

            if (ic.isReleased || (!ic.isPressed && ic.value > 0)) {
                ic.value -= ic.sensitiviy - (ic.value) * ic.damping;
            }
            ic.value = math.clamp01(ic.value);
        }
    }

    postUpdate(dt: number) {
        for (let ic of this.inputConfigs.values()) {
            ic.isReleased = false;
        }
    }

    getKey(name: string): boolean {
        let ic = this.inputConfigs.get(name);
        return ic.isPressing;
    }

    getKeyDown(name: string): boolean {
        let ic = this.inputConfigs.get(name);
        return ic.isPressed;
    }

    getKeyUp(name: string): boolean {
        let ic = this.inputConfigs.get(name);
        return ic.isReleased;
    }

    getValue(name: string): number {
        let ic = this.inputConfigs.get(name);
        return ic.value;
    }
}