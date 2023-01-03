import { Component, _decorator } from "cc";
import { ActorProperty } from "../actor/ActorProperty";
import { Actor } from "../actor/Actor";
const { ccclass, property, requireComponent } = _decorator;

export namespace buff {

    type buffId = string | number;
    type buffType = string | number;
    export class BuffDefine {
        id: buffId = 0;
        name: string = null;
        desc: string = null;
        duration: string = null;
        level: number = 0;
        type: buffType = 0;
        priority: number = 0;
        propertyName: string = '';
        propertyValue: number = 0;
        overrideType: Array<buffType> = [];
        checkInterval: number = 0;
    }

    export class Buff {
        id: buffId = 0;
        castTime: number = 0;
        define: BuffDefine | null = null;
        src: Actor | null = null;

        onAdd() {

        }

        onRemoved() {

        }

        onUpdate(dt: number) {

        }
    }

    @ccclass("BuffManager")
    @requireComponent(Actor)
    export class BuffManager extends Component {

        buffs: Array<Buff> = [];

        actorProperty: ActorProperty | null = null;

        actor: Actor = null;

        start() {
            this.actor = this.node.getComponent(Actor);
        }

        addBuff(buff: Buff) {
            if (this.contains(buff.id))
                this.buffs.push(buff);
            buff.onAdd();
        }

        contains(id: buffId): boolean {
            for (let buff of this.buffs) {
                if (buff.id == id) {
                    return true;
                }
            }
            return false;
        }

        hasSameType(type: buffType): boolean {
            return false;
        }

        update(deltaTime: number) {

        }
    }
}

