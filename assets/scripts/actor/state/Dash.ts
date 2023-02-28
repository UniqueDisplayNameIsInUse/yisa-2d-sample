import { Vec2, v2 } from "cc";
import { ActorState } from "./ActorState";
import { StateDefine } from "../StateDefine";

export class Dash extends ActorState {
    time: number = 0;
    duration: number = 0.8;
    dashFactor: number = 2.0;
    dashVelocity: Vec2 = v2();

    onEnter() {
        const speed = this.actor.linearSpeed * this.dashFactor;
        this.dashVelocity.x = this.actor.input.x
        this.dashVelocity.y = this.actor.input.y
        this.dashVelocity.normalize();
        this.dashVelocity.multiplyScalar(this.dashFactor * speed);
        this.time = 0;
    }

    onExit() {
        this.dashVelocity.set(0, 0);
        this.actor.rigidbody.linearVelocity = this.dashVelocity;
    }

    update(deltaTime: number) {
        this.time += deltaTime;

        if (this.time >= this.duration) {
            this.actor.stateMgr.transit(StateDefine.Idle);
        }
        this.actor.rigidbody.linearVelocity = this.dashVelocity;
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