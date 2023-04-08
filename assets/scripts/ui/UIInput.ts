import { Component, _decorator, director, game } from "cc";
import { AimDirection } from "../actor/AimDirection";
import { GameEvent } from "../event/GameEvent";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("UIInput")
export class UIInput extends Component {

    onFireRight() {
        director.emit(GameEvent.OnFireButtonClicked, AimDirection.RIGHT);
    }

    onFireUp() {
        director.emit(GameEvent.OnFireButtonClicked, AimDirection.UP);
    }

    onFireLeft() {
        director.emit(GameEvent.OnFireButtonClicked, AimDirection.LEFT);
    }

    onFireDown() {
        director.emit(GameEvent.OnFireButtonClicked, AimDirection.DOWN);
    }
    
} 