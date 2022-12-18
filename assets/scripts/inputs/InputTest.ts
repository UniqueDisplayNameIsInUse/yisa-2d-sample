import { Component, _decorator } from "cc";
import { HardwareInputs } from "./HardwareInputs";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("InputTest")
@requireComponent(HardwareInputs)
export class InputTest extends Component {

    hi: HardwareInputs;

    start() {
        this.hi = this.node.getComponent(HardwareInputs);
    }

    update(dt: number) {
        const name = 'horizontal';
        //console.log(name, this.hi.getKey(name), this.hi.getKeyDown(name), this.hi.getKeyUp(name), this.hi.getValue(name));
        
    }

}