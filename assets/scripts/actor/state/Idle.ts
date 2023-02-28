import { Vec2 } from "cc";
import { StateDefine } from "../StateDefine";
import { ActorState } from "./ActorState";

export class Idle extends ActorState {    

    onEnter(): void {        
        this.actor.rigidbody.linearVelocity = Vec2.ZERO;
        let hasIdle = this.animation.getState(StateDefine.Idle);
        if (hasIdle){
            this.animation.play(StateDefine.Idle);
        }            
    }

    update(deltaTime: number) {

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