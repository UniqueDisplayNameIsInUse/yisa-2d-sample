import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, Tween } from 'cc';
import { colliderTag } from '../ColliderTags';
import { Actor } from '../Actor';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('Projectile')
@requireComponent(Collider2D)
@requireComponent(RigidBody2D)
export class Projectile extends Component {

    collider: Collider2D;

    rigidbody: RigidBody2D;

    spinTween: Tween<Node> | null = null;

    @property({ type: colliderTag.Define })
    hitTag: colliderTag.Define = colliderTag.Define.PlayerProjectile;

    host: Actor | null = null;

    start() {
        this.collider = this.node.getComponent(Collider2D);
        this.rigidbody = this.node.getComponent(RigidBody2D);
        // once 似乎有问题？?
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionBegin, this);
    }

    onDisable(){
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onCollisionBegin, this);
    }

    onCollisionBegin(a: Collider2D, b: Collider2D, contact:IPhysics2DContact) {                
        if (colliderTag.isScene(b.tag) || colliderTag.isProjectileHitable(a.tag, b.tag)) {                        
            //console.log('onCollisionBegin disable collider');
            a.enabled = false;
            this.scheduleOnce(() => {
                this.node.removeFromParent();
                //this.node.emit(ProjectileEmitter.PROJECTILE_DEAD, this.node);
            }, 0.1);
        }
    }    
}

