import { Animation } from "cc";
import { Actor } from "../Actor";

export class ActorState {

    actor:Actor
    animation: Animation

    constructor(actor:Actor) {
        this.actor = actor;
        this.animation = actor.animation;
    }
}