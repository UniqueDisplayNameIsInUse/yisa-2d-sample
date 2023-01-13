import { Vec2, debug } from "cc";
import { StateDefine } from "../StateDefine";
import { ActorState } from "./ActorState";
import { timeUtl } from "../../util/Time";

export class Idle extends ActorState {

    update(deltaTime: number) {

    }

    onEnter(): void {        
        this.actor.rigidbody.linearVelocity = Vec2.ZERO;
        let hasIdle = this.animation.getState(StateDefine.Idle);
        if (hasIdle){
            this.animation.play(StateDefine.Idle);
        }            
    }

    onExit(): void {

    }

    onDestory(): void {

    }


    canTransit(to: StateDefine): boolean {
        if (to == StateDefine.Idle) {
            return false;
        }
        return true;
    }
} 