import { State } from "../../fsm/State";
import { StateDefine } from "../StateDefine";
import { ActorState } from "./ActorState";

export class Run extends ActorState implements State{
 
    onEnter(...args: any): void {
        this.animation.play(StateDefine.Run);
    }
    
    onUpdate(deltaTime: number): void {        
    }
}