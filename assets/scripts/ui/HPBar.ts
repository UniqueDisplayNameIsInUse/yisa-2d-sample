import { Component, Layout, Prefab, Sprite, _decorator, director, instantiate } from "cc";
import { PlayerController } from "../actor/PlayerController";
import { GameEvent } from "../event/GameEvent";
const { ccclass, property, requireComponent } = _decorator;

const HEART_RATIO = 10;

@ccclass("HPBar")
@requireComponent(Layout)
export class HPBar extends Component {

    @property(Prefab)
    heartPrefab: Prefab | null = null;

    layout: Layout | null = null;

    start() {
        this.layout = this.node.getComponent(Layout);        
    }

    update(dt: number) {
        if (!PlayerController.instance || !PlayerController.instance.actor) {
            return;
        }
        const hp = PlayerController.instance.actor.hp;
        const maxHp = PlayerController.instance.actor.maxHp;
        const div = maxHp / HEART_RATIO;
        const maxHeart = Math.ceil(div);
        const percent = hp % HEART_RATIO / HEART_RATIO;
        const flr = Math.floor(hp / HEART_RATIO);

        let curr = this.layout.node.children.length;

        while (curr < maxHeart) {
            let newHeart = instantiate(this.heartPrefab);
            this.layout.node.addChild(newHeart);
            curr++;
        }

        // while (curr > maxHeart) {
        //     let lastHeart = this.layout.node.children[this.layout.node.children.length - 1];
        //     this.layout.node.removeChild(lastHeart);
        //     curr--;
        // }

        let child = this.layout.node.children;

        for (let i = 0; i < child.length; i++) {
            let childRenderer = child[i].getChildByName("HP").getComponent(Sprite);
            if (i < flr)
                childRenderer.fillRange = 1;
            else if (i == flr)
                childRenderer.fillRange = percent;
            else
                childRenderer.fillRange = 0;
        }
        this.layout.updateLayout();
    }
}