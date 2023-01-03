import { _decorator, Component, RigidBody2D, CircleCollider2D, Animation, Input, Collider2D, Sprite, Scene } from 'cc';
import { StateMachine } from '../fsm/StateMachine';
import { ActorProperty } from './ActorProperty';
import { StateDefine } from './StateDefine';
import { ResidualShadows } from './ResidualShadows';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('Actor')
@requireComponent(RigidBody2D)
@requireComponent(CircleCollider2D)
export class Actor extends Component {

    rigidbody: RigidBody2D | null = null;

    collider: Collider2D | null = null;

    animationStateMachine: StateMachine<string | StateDefine> = new StateMachine();

    @property(Animation)
    animation: Animation = null;

    actorProperty: ActorProperty = new ActorProperty();

    @property(Sprite)
    mainRenderer: Sprite

    residualShadows: ResidualShadows;

    start() {
        this.residualShadows = new ResidualShadows(this.node, this.mainRenderer);

        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);

    }

    onDestroy() {
        this.residualShadows.destory();
    }

    update(deltaTime: number) {
        this.animationStateMachine.onUpdate(deltaTime);
    }
}

