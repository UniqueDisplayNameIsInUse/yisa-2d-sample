import { Collider, DeferredPipeline, ccenum } from "cc";

/**
 * 由于 2D 没有区分 onTriggerXXX/onCollisionXXX 
 * 
 * 在处理 我和谁碰到时，可以通过 TAG 来区分
 */
export namespace colliderTag {
    export enum Define {
        Scene = 0,
        Player = 101,
        Enemy = 102,
        AlertRange = 103,
        PlayerProjectile = 104,
        EnemyProjectile = 105,
    }
    ccenum(Define);

    export function isScene(tag: number) {
        return tag == Define.Scene;
    }

    export function isProjectileHitable(tag: number, other: number): boolean {
        if (tag == Define.PlayerProjectile) {
            return other == Define.Scene || other == Define.Enemy;
        }

        if (tag == Define.EnemyProjectile) {
            return other == Define.Scene || other == Define.Player;
        }
        return false;
    }
}