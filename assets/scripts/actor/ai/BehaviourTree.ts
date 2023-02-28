import { BloomStage, Vec3, math, utils, v3 } from "cc";
import { bt } from "../../bt/BehaviourTree";
import { Actor } from "../Actor";
import { BlackboardKey } from "./BlackboardKey";
import { StateDefine } from "../StateDefine";
import { EnemyController } from "../EnemyController";
import { SimpleEmitter } from "../projectile/SimpleEmitter";

//#region AI Actions

/**
 * Chase target
 */
export class Chase extends bt.Action {

    execute(dt: number, result: bt.ExecuteResult) {
        let actor: Actor = result.blackboard.get(BlackboardKey.Actor);
        let target: Actor = result.blackboard.get(BlackboardKey.Target);
        if (!actor || !target) {
            bt.markFail(result);
            return;
        }

        let attackRange = result.blackboard.get(BlackboardKey.AttackRange);
        let dir = v3();
        Vec3.subtract(dir, target.node.worldPosition, actor.node.worldPosition);
        let len = dir.length();

        let aabbActor = actor.collider.worldAABB;
        let aabbTarget = target.collider.worldAABB;

        let maxRadiusA = Math.max(aabbActor.size.x, aabbActor.size.y);
        let maxRadiusT = Math.max(aabbTarget.size.x, aabbTarget.size.y);
        let totalRadius = maxRadiusA + maxRadiusT;
        totalRadius *= 0.5;

        if (len - totalRadius < attackRange) {
            bt.markSuccess(result);
            actor.stateMgr.transit(StateDefine.Idle);
            return;
        }

        dir.normalize();

        actor.input.set(dir.x, dir.y);
        actor.stateMgr.transit(StateDefine.Run);
        bt.markRunning(result);
    }

}

export class MoveToDest extends bt.Action {
    execute(dt: number, result: bt.ExecuteResult) {
        let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;
        let moveDest = result.blackboard.get(BlackboardKey.MoveDest) as Vec3;
        if (!actor || !moveDest) {
            bt.markFail(result);
            return;
        }

        let dur = result.blackboard.get(BlackboardKey.MoveDestDuration) - dt;
        result.blackboard.set(BlackboardKey.MoveDestDuration, dur);

        let dir = v3();
        Vec3.subtract(dir, moveDest, actor.node.worldPosition);
        let distance = dir.length();
        dir.normalize();
        let movedDistance = dir.length();
        if (movedDistance > distance || dur < 0) {
            bt.markSuccess(result);
            result.blackboard.delete(BlackboardKey.MoveDest);
            actor.stateMgr.transit(StateDefine.Idle);
            return;
        }

        actor.input.set(dir.x, dir.y)
        bt.markRunning(result);
        actor.stateMgr.transit(StateDefine.Run);
    }
}

/**
 * 
 */
export class SetMoveDest extends bt.Action {
    execute(dt: number, result: bt.ExecuteResult) {
        bt.markSuccess(result);
        let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;
        let ec = actor.node.getComponent(EnemyController);
        ec.randomNextMoveDest();
    }
}

/**
 * 
 */
// export class UseSkill extends bt.Action {
//     index: number = 0;
//     execute(dt: number, result: bt.ExecuteResult) {
//         bt.markFail(result);
//         let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;

//         // 释放任意技能中
//         if (actor.skillMgr.currSkill != null) {
//             bt.markRunning(result);
//             return;
//         }

//         if (!actor.skillMgr.isCoolingdown(this.index)) {
//             bt.markFail(result);
//             return;
//         }

//         // 释放成功        
//         actor.skillMgr.use(this.index);
//         bt.markSuccess(result);
//     }
// }

/**
 * @en 
 * Use dash to escape
 * @zh
 * 使用突进来逃跑
 */
export class EscapeDash extends bt.Action {
    execute(dt: number, result: bt.ExecuteResult) {
        let actor: Actor = result.blackboard.get(BlackboardKey.Actor);

        // 当前在 dash 则不重进此状态
        if (actor.stateMgr.currState.id == StateDefine.Dash) {
            bt.markSuccess(result);
            result.blackboard.set(BlackboardKey.Escaped, true);
            return;
        }

        // 随机找一个方向，然后使用 dash 状态来逃跑
        let dir = v3(math.randomRange(-1, 1), math.randomRange(-1, 1), 0);
        let target: Actor = result.blackboard.get(BlackboardKey.Target);
        if (target) {
            Vec3.subtract(dir, actor.node.worldPosition, target.node.worldPosition);
        }

        dir.normalize();
        actor.input.set(dir.x, dir.y);
        actor.stateMgr.transit(StateDefine.Dash);
        bt.markRunning(result);
    }
}

/**
 * add buff
 */
export class Rage extends bt.Action {
    execute(dt: number, result: bt.ExecuteResult) {
        bt.markFail(result);
    }
}

//#endregion AI actions

//#region AI Conditions

/**
 * Check if the AI has a target
 */
export class HasTarget extends bt.Condition {
    isSatisfy(result: bt.ExecuteResult): boolean {
        return result.blackboard.has(BlackboardKey.Target)
    }
}

export class IsCooldown extends bt.Condition {
    emitter: SimpleEmitter = null;
    isSatisfy(result: bt.ExecuteResult): boolean {
        return this.emitter.isCoolingdown;
    }
}

/**
 * Emit projectiles
 */
export class Emit extends bt.Action {
    emitter: SimpleEmitter = null;
    execute(dt: number, result: bt.ExecuteResult) {
        bt.markSuccess(result);
        this.emitter.emit();
    }
}

/**
 * Stay Idle
 */
export class StayIdle extends bt.Action {
    execute(dt: number, result: bt.ExecuteResult) {
        bt.markSuccess(result);
        let actor: Actor = result.blackboard.get(BlackboardKey.Actor);
        actor.stateMgr.transit(StateDefine.Idle);
    }
}

// export class IsUseSkill extends bt.Condition {
//     isSatisfy(result: bt.ExecuteResult): boolean {
//         let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;
//         return actor.skillMgr.currSkill != null;
//     }
// }

// /**
//  * check if the AI has any valid skill
//  */
// export class IsSkillValid extends bt.Condition {
//     index: number = 0;
//     isSatisfy(result: bt.ExecuteResult): boolean {
//         // TODO:
//         let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;
//         return actor.skillMgr.isCoolingdown(this.index);
//     }
// }

/**
 * Check if target is in attack range
 */
export class IsInAttackRange extends bt.Condition {
    isSatisfy(result: bt.ExecuteResult): boolean {
        let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;
        let target = result.blackboard.get(BlackboardKey.Target) as Actor;
        let attackRange = result.blackboard.get(BlackboardKey.AttackRange);
        if (actor && target) {
            return Vec3.distance(actor.node.worldPosition, target.node.worldPosition) < attackRange;
        }
        return  // && target is in attack range
    }
}

/**
 * Check is half Hp or less
 */
export class IsLowHp extends bt.Condition {
    isSatisfy(result: bt.ExecuteResult): boolean {
        let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;
        return actor?.hp / actor?.maxHp <= 0.5;
    }
}

//#endregion AI conditions