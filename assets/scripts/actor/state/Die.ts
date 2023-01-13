import { Animation, AnimationState, Vec2 } from "cc";
import { StateDefine } from "../StateDefine";
import { ActorState } from "./ActorState";

export class Die extends ActorState {

    onEnter(): void {
        this.actor.rigidbody.linearVelocity = Vec2.ZERO;
        let hasIdle = this.animation.getState(StateDefine.Die);
        if (hasIdle)
            this.animation.play(StateDefine.Die);

        this.animation.once(Animation.EventType.FINISHED, this.onDieEnd, this)

        this.actor.dead = true;
    }

    onDieEnd(type: Animation.EventType, state: AnimationState) {
        if (type == Animation.EventType.FINISHED) {
            if (state.name == StateDefine.Die) {
                //TODO: remove from parent 
                this.actor.scheduleOnce(() => {
                    this.actor.node.removeFromParent();
                }, 1.0);
            }
        }
    }

    canTransit(to: StateDefine): boolean {
        return false;
    }
} 