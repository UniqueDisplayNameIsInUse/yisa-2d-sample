import { ActorProperty } from "../actor/ActorProperty";

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
    }

    export class BuffManager {

        buffs: Array<Buff> = [];

        actorProperty: ActorProperty | null = null;

        addBuff(buff: Buff) {

            this.buffs.push(buff);
        }

        contains(id: buffId): boolean {
            return false;
        }

        hasSameType(type: buffType): boolean {
            return false;
        }

        update(deltaTime: number) {

        }

    }

}

