import { Component, _decorator, director } from "cc";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("UIWin")
export class UIWin extends Component {    

    onBtnRetryClicked() {        
        director.loadScene("game");
    }
}