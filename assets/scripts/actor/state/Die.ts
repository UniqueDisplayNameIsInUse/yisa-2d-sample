import { Animation, AnimationState, Vec2, director } from "cc";
import { StateDefine } from "../StateDefine";
import { ActorState } from "./ActorState";
import { GameEvent } from "../../event/GameEvent";

export class Die extends ActorState {

    onEnter(): void {
        this.actor.rigidbody.linearVelocity = Vec2.ZERO;
        this.animation.play(StateDefine.Die);           

        this.animation.once(Animation.EventType.FINISHED, this.onDieEnd, this)

        this.actor.dead = true;        
    }

    onDieEnd(type: Animation.EventType, state: AnimationState) {
        if (type == Animation.EventType.FINISHED) {
            if (state.name == StateDefine.Die) {
                //TODO: remove from parent 
                this.actor.scheduleOnce(() => {                    
                    this.actor.node.destroy();
                    director.emit(GameEvent.OnDie, this.actor.node);
                }, 0.1);                    
            }
        }
    }

    canTransit(to: StateDefine): boolean {
        return to != StateDefine.Die;
    }
} 