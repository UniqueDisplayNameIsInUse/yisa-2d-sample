import { Component, _decorator } from "cc";
import { HardwareInputs } from "./HardwareInputs";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("InputTest")
@requireComponent(HardwareInputs)
export class InputTest extends Component {

    start() {        
    }

    update(dt: number) {
        const name = 'horizontal';
        console.log(name, HardwareInputs.getKey(name), HardwareInputs.getKeyDown(name), HardwareInputs.getKeyUp(name), HardwareInputs.getValue(name));        
    }

}