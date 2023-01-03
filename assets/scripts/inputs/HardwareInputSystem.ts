import { ccenum, CCFloat, CCString, EventKeyboard, EventMouse, input, Input, KeyCode, math, System, _decorator, CCInteger, Vec3, v3, Vec2, v2 } from "cc";
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

export enum MouseButton {
    ButtonLeft = EventMouse.BUTTON_LEFT,
    ButtonRight = EventMouse.BUTTON_RIGHT,
    ButtonMiddle = EventMouse.BUTTON_MIDDLE,
}
ccenum(MouseButton);

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

    @property({ type: MouseButton })
    public mouseButton: number = MouseButton.ButtonLeft;

    @property({ type: CCFloat, range: [0, 1], step: 0.1 })
    public sensitiviy: number = 0.001;
    @property({ type: CCFloat, range: [0, 1], step: 0.1 })
    public damping: number = 0.001;

    public value: number = 0;
    public isPressed: boolean = false;
    public isReleased: boolean = false;
    public isPressing: boolean = false;
    public isNegative: boolean = false;

    resetInputState() {
        this.isPressed = false;
        this.isReleased = false;
    }
}

export class HardwareInputSystem {

    config: InputConfig[] = [];

    private inputConfigs: Map<string, InputConfig> = new Map();

    private keyboards: Map<KeyCode, string> = new Map();

    private mouses: Map<number, string> = new Map();

    mousePosition: Vec3 = v3();
    private tempMousePosition: Vec2 = v2();

    constructor(config: InputConfig[]) {
        this.config = config;
    }

    init(): void {
        this.initInternalMaps(this.config);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseButtonDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseButtonUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

    }

    destroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseButtonDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseButtonUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
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
                this.mouses.set(ic.mouseButton, ic.name);                
            }
        }
    }

    protected onKeyDown(ek: EventKeyboard) {
        if (this.keyboards.has(ek.keyCode)) {
            let name = this.keyboards.get(ek.keyCode);
            let ic = this.inputConfigs.get(name);
            ic.isPressed = true;
            ic.isNegative = ek.keyCode == ic.nagetiveKey;
        }
    }

    protected onKeyPressing(ek: EventKeyboard) {
        if (this.keyboards.has(ek.keyCode)) {
            let name = this.keyboards.get(ek.keyCode);
            let ic = this.inputConfigs.get(name);
            ic.isPressing = true;
            ic.isNegative = ek.keyCode == ic.nagetiveKey;
        }
    }

    protected onKeyUp(ek: EventKeyboard) {
        if (this.keyboards.has(ek.keyCode)) {
            let name = this.keyboards.get(ek.keyCode);
            let ic = this.inputConfigs.get(name);
            ic.isPressed = false;
            ic.isPressing = false;
            ic.isReleased = true;
            ic.isNegative = ek.keyCode == ic.nagetiveKey;
        }
    }

    protected onMouseButtonDown(em: EventMouse) {
        this.updateMousePosition(em);

        if (this.mouses.has(em.getButton())) {
            let name = this.mouses.get(em.getButton())
            let mc = this.inputConfigs.get(name);
            mc.isPressed = true;
            mc.isPressing = true;
            mc.isReleased = false;
        }

    }

    protected onMouseButtonUp(em: EventMouse) {
        this.updateMousePosition(em);

        if (this.mouses.has(em.getButton())) {
            let name = this.mouses.get(em.getButton())
            let mc = this.inputConfigs.get(name);
            mc.isPressed = false;
            mc.isPressing = false;
            mc.isReleased = true;
        }
    }

    protected onMouseMove(em: EventMouse) {
        this.updateMousePosition(em);
    }

    private updateMousePosition(em: EventMouse) {
        this.tempMousePosition = em.getLocation()
        this.mousePosition.set(this.tempMousePosition.x, this.tempMousePosition.y, 0);
    }

    update(dt: number) {
        for (let ic of this.inputConfigs.values()) {
            const sensitiviy = ic.sensitiviy * (1 - ic.damping);
            if (ic.isPressed) {
                ic.value += (ic.isNegative ? -1 : 1) * sensitiviy;
            } else if (Math.abs(ic.value) > math.EPSILON) {
                let delta = Math.abs(ic.value) - sensitiviy;
                delta = delta < sensitiviy ? delta : sensitiviy;
                ic.value -= Math.sign(ic.value) * delta;
            } else {
                ic.value = 0
            }
            ic.value = math.clamp(ic.value, -1, 1);
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