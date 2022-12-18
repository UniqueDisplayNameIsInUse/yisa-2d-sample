import { State } from "../../fsm/State";
import { StateDefine } from "../StateDefine";
import { ActorState } from "./ActorState";

export class Run extends ActorState implements State{
 
    onEnter(...args: any): void {
        super.animation.play(StateDefine.Run);
    }
    
}