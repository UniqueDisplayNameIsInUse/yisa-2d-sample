import { Animation } from "cc";

export class ActorState {
    animation: Animation

    constructor(animation: Animation) {
        this.animation = animation;
    }
}