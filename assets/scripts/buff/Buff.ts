import { _decorator, assert, instantiate } from "cc";
import { Actor } from "../actor/Actor";
import { IMachine, IState } from "../fsm/State";

export namespace buff {

    export type BuffId = string | number;
    //type buffType = string | number;
    export interface BuffDefine {
        id: BuffId
        name: string
        duration: number;
        // desc: string        
        // level: number;
        // type: buffType;
        // priority: number;
        propertyName: string;
        propertyValue: number;
        //overrideType: Array<buffType>;
        checkInterval: number;
    }

    export abstract class Buff implements IState<BuffId> {
        define: BuffDefine | null = null;
        actor: Actor | null = null;
        time: number = 0;
        get id(): BuffId { return this.define.id };
        set id(bi: BuffId) { this.define.id = bi; };

        onEnter(): void { }
        onExit(): void { }
        update(deltaTime: number): void { this.time += deltaTime; }
        onDestory(): void { }
        canTransit(to: BuffId): boolean { return true; }
        get isOverTime(): boolean {
            return this.time >= this.define.duration;
        }        
    }

    export class AttributeBuff extends Buff {
        onEnter(): void {
            assert(this.actor.actorProperty[this.define.propertyName] instanceof Number);
            this.actor.actorProperty[this.define.propertyName] += this.define.propertyValue;
        }

        onExit(): void {
            this.actor.actorProperty[this.define.propertyName] -= this.define.propertyValue;
        }
    }

    export class PeriodAttributeBuff extends Buff {
        currTime: number = 0;

        update(deltaTime: number): void {
            this.currTime += deltaTime;
            super.update(deltaTime);

            if (this.currTime >= this.define.checkInterval) {
                this.currTime = 0;
                assert(this.actor.actorProperty[this.define.propertyName] instanceof Number);
                this.actor.actorProperty[this.define.propertyName] += this.define.propertyValue;
            }
        }
    }

    export class BuffManager implements IMachine<BuffId> {

        buffs: Array<Buff> = [];
        actor: Actor = null;

        update(deltaTime: number) {
            for (let buff of this.buffs) {
                buff.update(deltaTime);

                if (buff.isOverTime) {
                    buff.onExit();
                }
            }
        }

        add(state: Buff) {
            this.buffs.push(state);
            state.onEnter();
        }

        remove(name: BuffId) { // TODO: 效率问题
            let buff = this.buffs.find(t => { return name == t.id; })
            let index = this.buffs.indexOf(buff);
            this.buffs.splice(index, 1);
            buff.onExit();
            buff.onDestory();
        }
    }

    export class BuffFactory {

        static _instance: BuffFactory;
        static get instance(): BuffFactory {
            if (!this._instance) {
                this._instance = new BuffFactory();
            }
            return this._instance;
        }

        private attributeBuff: AttributeBuff = new AttributeBuff();
        private periodAttribueBuff: PeriodAttributeBuff = new PeriodAttributeBuff();

        init() {
            this.attributeBuff.define = {
                id: 101,
                name: 'enchance',
                duration: 10,
                propertyName: 'attack',
                propertyValue: 10,
                checkInterval: 0,
            }

            this.periodAttribueBuff.define = {
                id: 102,
                name: 'poison',
                duration: 10,
                propertyName: 'hp',
                propertyValue: -1,
                checkInterval: 3,
            }
        }

        createAttributeBuff(): AttributeBuff {
            return instantiate(this.attributeBuff);
        }

        createPeriodAttribueBuff(): PeriodAttributeBuff {
            return instantiate(this.periodAttribueBuff);
        }
    }
}

