import { Component, Node, _decorator, director } from "cc";
import { ActorEvent } from "../actor/Actor";
import { PlayerController } from "../actor/PlayerController";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("UIFail")
export class UIFail extends Component {

    start() {
    }

 
    onBtnRetryClicked() {
        director.loadScene("game");
    }
}