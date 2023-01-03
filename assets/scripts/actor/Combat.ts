import { Actor } from "./Actor"

export namespace combat {

    export enum CombatStageDefine {
        BeforeHit = 0,
        AfterHit,
        SettleHit,
        MaxStageSize,
    }

    export interface CombatStage {
        calculate?(pair: CombatResult)
    }

    export class CombatResult {
        src: Actor;
        dest: Actor;
        damage: number;
    }

    export class Combat {

        combatStages: Array<CombatStage> = new Array[CombatStageDefine.MaxStageSize];

        addStage(define: CombatStageDefine, stage: CombatStage) {
            this.combatStages[define] = stage;
        }

        calculate(src: Actor, dest: Actor): CombatResult {
            let combatPair = new CombatResult();
            combatPair.src = src;
            combatPair.dest = dest;

            for (let stage of this.combatStages) {
                stage.calculate(combatPair);
            }

            return combatPair;
        }
    }
}