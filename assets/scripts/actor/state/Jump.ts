import { Vec2, math, v2 } from "cc";
import { ActorState } from "./ActorState";
import { StateDefine } from "../StateDefine";

export class Jump extends ActorState {

    jumpVelocity: Vec2 = v2(0, 0);

    verticalFactor: number = 1;
    time: number = 0;

    halfDuration: number = 1;
    duration: number = 2;

    onEnter() {
        this.jumpVelocity.x = this.actor.actorProperty.linearSpeed * Math.sign(this.actor.rigidbody.linearVelocity.x || 0.01);
        this.verticalFactor = 0;
        this.time = 0;
    }

    onExit() {
        this.jumpVelocity.set(0, 0);
        this.actor.rigidbody.linearVelocity = this.jumpVelocity;
    }

    update(deltaTime: number) {
        this.time += deltaTime;

        let ratio = math.clamp01(this.time / this.duration);
        this.verticalFactor = math.clamp(Math.cos(ratio * Math.PI) * 2, -1, 1);

        this.jumpVelocity.y = this.verticalFactor * Math.abs(this.jumpVelocity.x);
        this.actor.rigidbody.linearVelocity = this.jumpVelocity;

        if (this.time >= this.duration) {
            this.actor.stateMgr.transit(StateDefine.Idle);
        }

        console.log('velocity', this.time, this.actor.rigidbody.linearVelocity);
    }

    onDestory() {

    }

    canTransit(to: StateDefine): boolean {
        if (this.time < this.duration) {
            return false;
        }
        return true;
    }
}