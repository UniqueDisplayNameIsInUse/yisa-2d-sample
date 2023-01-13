import { Component, Node, _decorator, director } from "cc";
import { UIFail } from "./UIFail";
import { ActorEvent } from "../actor/Actor";
import { PlayerController } from "../actor/PlayerController";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("UICanvas")
export class UICanvas extends Component {

    @property(UIFail)
    uiFail: UIFail | null = null;

    onLoad() {
        director.once(ActorEvent.OnDie, this.onActorDie, this);

        this.uiFail.node.active = false;
    }

    onActorDie(n: Node) {
        if (PlayerController.instance && n == PlayerController.instance.node) {
            this.uiFail.node.active = true;
        }
    }

}