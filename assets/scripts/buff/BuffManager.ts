import { ActorProperty } from "../actor/ActorProperty";

export namespace buff {

    export class BuffDefine {
        id: string | number = 0;
        name: string = null;
        desc: string = null;
        duration: string = null;
        level: number = 0;
        priority: number = 0;
        propertyName: string = '';
        propertyValue: number = 0;
    }

    export class Buff {
        id: string | number = 0;
        castTime: number = 0;
    }

    export class BuffManager {

        buffs: Array<Buff> = [];

        actorProperty: ActorProperty | null = null;

        addBuff(buff: Buff) {

        }

        update(deltaTime: number) {

        }

    }

}

