import { _decorator, Component, Node, Pool, instantiate, director, Prefab } from 'cc';
import { Actor } from './Actor';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('ProjectileEmitter')
@requireComponent(Actor)
export class ProjectileEmitter extends Component {

    @property(Prefab)
    projectilePrefab: Prefab | null = null;

    @property(Actor)
    actor: Actor | null = null;

    projectilePool: Pool<Node> = null;

    start() {

        this.projectilePool = new Pool((): Node => {
            let projectile = instantiate(this.projectilePrefab!);
            director.getScene().addChild(projectile);
            projectile.active = false;
            return projectile;
        }, 10, (node: Node) => {
            node.removeFromParent();
        });

    }

    update(deltaTime: number) {

    }

    getProjectile(): Node {
        let node = this.projectilePool.alloc();

        return node;
    }
}

