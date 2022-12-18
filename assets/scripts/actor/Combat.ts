import { Actor } from "./Actor"

export namespace combat {

    export enum CombatStageDefine {
        BeforeHit,
        AfterHit,
        SettleHit,
    }

    export class CombatStage {
        calculate(pair: CombatPair) {

        }
    }

    export class CombatPair {
        src: Actor;
        dest: Actor;
    }

    export class Combat {

        combatStages: Array<CombatStage> = [];

        addStage(stage: CombatStage) {

        }

        calculate(src: Actor, dest: Actor): CombatPair {
            let combatPair = new CombatPair();
            combatPair.src = src;
            combatPair.dest = dest;

            for (let stage of this.combatStages) {
                stage.calculate(combatPair);
            }

            return combatPair;
        }
    }
}