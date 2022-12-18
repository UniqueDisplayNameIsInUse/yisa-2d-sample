import { _decorator, Component, RigidBody2D, CircleCollider2D, Animation, Input } from 'cc';
import { StateMachine } from '../fsm/StateMachine';
import { ActorProperty } from './ActorProperty';
import { StateDefine } from './StateDefine';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('Actor')
@requireComponent(RigidBody2D)
@requireComponent(CircleCollider2D)
export class Actor extends Component {

    rigidbody: RigidBody2D | null = null;

    collider: CircleCollider2D | null = null;

    animationStateMachine: StateMachine<string | StateDefine> = new StateMachine();

    @property(Animation)
    animation: Animation = null;

    actorProperty: ActorProperty = new ActorProperty();

    start() {

    }

    update(deltaTime: number) {
        this.animationStateMachine.onUpdate(deltaTime);
    }
}

