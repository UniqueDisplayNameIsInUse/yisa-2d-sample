import { Vec2, math, v2 } from "cc";
import { StateDefine } from "../StateDefine";
import { ActorState } from "./ActorState";

export class Run extends ActorState {

    velocity: Vec2 = v2();

    onExit() {

    }

    onDestory() {

    }

    onEnter(): void {
        this.animation.crossFade(StateDefine.Run);
    }

    update(deltaTime: number): void {
        this.velocity.set(this.actor.input.x, this.actor.input.y);
        this.velocity.multiplyScalar(this.actor.actorProperty.linearSpeed);
        this.actor.rigidbody.linearVelocity = this.velocity;

        if (this.actor.input.length() <= math.EPSILON) {
            this.actor.stateMgr.transit(StateDefine.Idle);
        }
    }

    canTransit(to: StateDefine): boolean {
        if (to == this.id) {
            return false;
        }
        return true;
    }
}