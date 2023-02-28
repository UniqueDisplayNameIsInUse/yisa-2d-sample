import { Component, _decorator, director } from "cc";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("UIFail")
export class UIFail extends Component {    

    onBtnRetryClicked() {
        director.loadScene("game");
    }
}