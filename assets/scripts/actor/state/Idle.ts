import { State } from "../../fsm/State";
import { StateDefine } from "../StateDefine";
import { ActorState } from "./ActorState";

export class Idle extends ActorState implements State{

    onEnter(...args: any): void {
        this.animation.play(StateDefine.Idle);
    }

    onExit(...args: any): void {
        
    }

    onUpdate(deltaTime: number): void {
        
    }

    onDestory(): void {
        
    }
} 