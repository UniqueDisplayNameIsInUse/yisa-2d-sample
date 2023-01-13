import { _decorator, Component, Node, Pool, Prefab, CCFloat, CCInteger, RigidBody, RigidBody2D, Vec3, NodeSpace, v3, v2, instantiate, Quat, director, Canvas, Scene } from 'cc';
import { Actor } from '../Actor';
import { EmitterBurst } from './EmitterBurst';
import { Vec3OverTime } from './Vec3OverTime';
import { array } from '../../util/Array';
import { CustomRigidbody } from './CustomRigidbody';
import { Projectile } from './Projectile';
const { ccclass, property } = _decorator;

type TRigidbody = RigidBody | RigidBody2D | CustomRigidbody;

export interface ProjectileEmitterSearchRootCallback {
    (pe: ProjectileEmitter): Node
}

export interface ProjectileEmitterSearchRigidbodyCallback {
    (node: Node): Node
}

@ccclass('ProjectileEmitter')
export class ProjectileEmitter extends Component {

    @property({ type: CCFloat, displayOrder: 1 })
    duration: number = 1.0;

    @property({ displayOrder: 2 })
    startOnEnable: boolean = false;

    @property({ displayOrder: 3 })
    resetOnDisable: boolean = false;

    @property({ type: Prefab, displayOrder: 4 })
    projectilePrefab: Prefab | null = null;

    @property({ displayOrder: 5 })
    is3DMode: boolean = false;

    @property({ type: CCInteger, displayOrder: 6 })
    totalCount: number = 1;

    @property({ type: [EmitterBurst], displayOrder: 7 })
    bursts: EmitterBurst[] = []

    @property({ serializable: true })
    private _useVelocity: boolean = true;

    @property({ displayOrder: 8 })
    get useVelocity(): boolean { return this._useVelocity; }
    set useVelocity(v: boolean) { this._useVelocity = v; }

    @property({ displayOrder: 9 })
    get useForce(): boolean { return !this._useVelocity; }
    set useForce(v: boolean) { this._useVelocity = !v; }

    @property({ displayOrder: 10, visible: function (this: ProjectileEmitter) { return this.useVelocity } })
    startLinearVelocity: Vec3OverTime = new Vec3OverTime();

    @property({ displayOrder: 11, visible: function (this: ProjectileEmitter) { return this.useVelocity } })
    startAngularVelocity: Vec3OverTime = new Vec3OverTime();

    @property({ displayOrder: 12, visible: function (this: ProjectileEmitter) { return this.useForce } })
    startLinearForce: Vec3OverTime = new Vec3OverTime();

    @property({ displayOrder: 13, visible: function (this: ProjectileEmitter) { return this.useForce } })
    startTorque: Vec3OverTime = new Vec3OverTime();

    @property({ displayOrder: 14, visible: function (this: ProjectileEmitter) { return this.useForce } })
    linearForceOverTime: Vec3OverTime = new Vec3OverTime();

    @property({ displayOrder: 15, visible: function (this: ProjectileEmitter) { return this.useForce } })
    torqueOverTime: Vec3OverTime = new Vec3OverTime();

    @property({ displayOrder: 16, visible: function (this: ProjectileEmitter) { return this.useVelocity } })
    linearVelocityOverTime: Vec3OverTime = new Vec3OverTime();

    @property({ displayOrder: 17, visible: function (this: ProjectileEmitter) { return this.useVelocity } })
    angularVelocityOverTime: Vec3OverTime = new Vec3OverTime();

    @property({ type: Actor, displayOrder: 18 })
    actor: Actor | null = null;

    @property({ type: CCInteger, displayOrder: 19 })
    elementsPerbatch: number = 5;

    private isStarted: boolean = false; // is started    

    private _currentTime: number = 0;
    get currentTime(): number { return this._currentTime; }

    projectileRoot: Node | Scene = null; // for 2D object, search parent untile find `Canvas`

    projectilePool: Pool<Node> = null;

    managedProjectiles: Array<TRigidbody> = []; // managed projectiles

    // tempoerty variables for emitt once
    emitterPos: Vec3 = v3();
    emitterRot: Quat = new Quat();
    emitterLinearVelocity: Vec3 = v3();
    emitterAngularVelocity: Vec3 = v3();

    currentCount: number = 0;

    search2DRootCallback: ProjectileEmitterSearchRootCallback;
    searchRigidCallback: ProjectileEmitterSearchRigidbodyCallback;

    static readonly PROJECTILE_DEAD: string = 'PROJECTILE_DEAD';

    start() {

    }

    onEnable() {
        if (this.startOnEnable) {
            this.startEmitt();  
            this.update(0);
        }
    }

    onDisable() {
        if (this.resetOnDisable) {
            this.clearEmitt();
        }
    }

    createPool() {
        this.projectilePool = new Pool(() => {
            let node = instantiate(this.projectilePrefab!);
            return node;
        }, this.elementsPerbatch, (node: Node) => {
            node.removeFromParent();
        });
    }

    onDestroy() {
        this.projectilePool?.destroy();
    }

    update(deltaTime: number) {
        this._currentTime += deltaTime;
        this.updateBurst(deltaTime);
        this.updateManaged();
        if (this._currentTime >= this.duration) {
            this.stopEmitt();
        }
    }

    startEmitt() {
        if (this.isStarted) {
            return;
        }
        this.isStarted = true;
    }

    stopEmitt() {
        if (!this.isStarted) {
            return;
        }
        this.isStarted = false;
    }

    resetEmittTime() {
        this._currentTime = 0;
    }

    clearEmitt() {
        this.stopEmitt();
        this.resetEmittTime();
        this.currentCount = 0;
        this.resetBursts();
    }

    private emitOneProjectile() {

        if (!this.isStarted) {
            return;
        }

        if (this.currentCount >= this.totalCount) {
            console.log("[ProjectileEmitter] all projectiles are emitted.")
            return;
        }

        // deferred creation
        if (this.projectilePool == null) {
            this.createPool();
        }

        // search TRigibody component
        let node = this.projectilePool.alloc();
        node.active = true;
        let rigid: TRigidbody = this.findRigidbody(node);
        if (rigid == null) {
            throw new Error(`[ProjectileEmitter] missing rigidbody, 
            please make sure that your projectile contains a Rigidbody, 
            Rigidbody2D component or a CustomRigidbody component`)
        }

        this.is3DMode == rigid instanceof RigidBody || rigid instanceof CustomRigidbody;

        this.managedProjectiles.push(rigid);

        if (this.projectileRoot == null && this.search2DRootCallback) {
            console.log("[ProjectileEmitter] projectileRoot is null, try to search callback");
            // TODO: call search delegate
            this.projectileRoot = this.search2DRootCallback.call(this);
        }

        // missing root, try find it;
        if (this.projectileRoot == null) {
            console.log("[ProjectileEmitter] projectileRoot is null, try use builtin search function");
            if (this.is3DMode) {
                this.projectileRoot = director.getScene();
            } else {
                this.searchProjectileRoot();
            }
        }

        if (this.projectileRoot) {
            this.projectileRoot.addChild(node);
        }

        node.worldPosition = this.emitterPos;
        node.worldRotation = this.emitterRot;

        this.currentCount++;

        // set start velocity or force
        const ratio = this._currentTime / this.duration;
        if (this.useForce) {
            this.setStartForce(rigid, ratio, this.startLinearForce, this.startTorque);
        } else {
            this.setStartVelocity(rigid, ratio, this.startLinearVelocity, this.startAngularVelocity);
        }

        let projectile = node.getComponent(Projectile);
        projectile.host = this.actor;

        node.once(ProjectileEmitter.PROJECTILE_DEAD, this.onProjectileDead, this)
    }

    private searchProjectileRoot() {
        //search for projectile root
        if (!this.projectileRoot) {
            let node2Find = this.node;
            while (!this.projectileRoot && node2Find) {
                let canvas = node2Find.getComponent(Canvas);
                if (canvas == null) {
                    node2Find = node2Find.parent;
                } else {
                    this.projectileRoot = canvas.node;
                }
            }
        }
    }

    private updateBurst(dt: number) {
        if (array.isNullOrEmpty(this.bursts)) {
            return;
        }

        for (let i = 0; i < this.bursts.length; i++) {
            const b = this.bursts[i];
            b.update(this, dt);
        }
    }

    private resetBursts() {
        for (let b of this.bursts) {
            b.reset();
        }
    }

    internalBurst(b: EmitterBurst) {
        let burstCount = 0;
        while (burstCount < b.count && this.currentCount < this.totalCount) {
            b.getBustTransform(this.node, burstCount, this.emitterPos, this.emitterRot);
            this.emitOneProjectile();
            burstCount++;
        }
    }

    private updateManaged() {
        const ratio = this._currentTime / this.duration;

        if (this.useVelocity) {
            this.updateVelocity(ratio, this.linearVelocityOverTime, this.angularVelocityOverTime);
        } else {
            this.updateForce(ratio, this.linearForceOverTime, this.torqueOverTime);
        }
    }

    private updateForce(ratio: number, linear: Vec3OverTime, angular: Vec3OverTime) {
        // linear 
        const x = linear.x.evaluate(this._currentTime, ratio);
        const y = linear.y.evaluate(this._currentTime, ratio);
        const z = linear.z.evaluate(this._currentTime, ratio);
        const ns = linear.nodeSpace;
        const force = v3(x, y, z);
        const forceV2 = v2(x, y);

        // angular
        const tx = angular.x.evaluate(this._currentTime, ratio);
        const ty = angular.x.evaluate(this._currentTime, ratio);
        const tz = angular.x.evaluate(this._currentTime, ratio);
        const tns = angular.nodeSpace;

        const torque = v3(tx, ty, tz);
        const torqueV2 = tx;

        for (let r of this.managedProjectiles) {

            if (r instanceof RigidBody || r instanceof CustomRigidbody) { // 3D

                if (linear.enable) {
                    switch (ns) {
                        case NodeSpace.LOCAL:
                            r.applyLocalForce(force);
                            break
                        default:
                            r.applyForce(force, Vec3.ZERO);
                            break
                    }
                }

                if (angular.enable) {
                    switch (tns) {
                        case NodeSpace.LOCAL:
                            r.applyTorque(torque);
                            break;
                        default:
                            r.applyLocalTorque(torque);
                            break;
                    }
                }
            } else if (r instanceof RigidBody2D) { // 2D

                if (linear.enable)
                    r.applyForceToCenter(forceV2, true);
                if (angular.enable)
                    r.applyTorque(torqueV2, true);
            }
        }
    }

    private updateVelocity(ratio: number, linear: Vec3OverTime, angular: Vec3OverTime) {
        const lx = linear.x.evaluate(this._currentTime, ratio);
        const ly = linear.y.evaluate(this._currentTime, ratio);
        const lz = linear.z.evaluate(this._currentTime, ratio);
        let lv = v3(lx, ly, lz);
        let lvV2 = v2(lx, ly);

        const ax = angular.x.evaluate(this._currentTime, ratio);
        const ay = angular.y.evaluate(this._currentTime, ratio);
        const az = angular.z.evaluate(this._currentTime, ratio);
        let av = v3(ax, ay, az);
        let avV2 = ax;

        for (let r of this.managedProjectiles) {
            if (r instanceof RigidBody || r instanceof CustomRigidbody) { // 3D 
                if (linear.enable)
                    r.setLinearVelocity(lv);
                if (angular.enable)
                    r.setAngularVelocity(av);
            } else if (r instanceof RigidBody2D) { // 2D

                if (linear.nodeSpace) {
                    r.linearVelocity = lvV2;
                }

                if (angular.enable) {
                    r.angularVelocity = avV2;
                }
            }
        }
    }

    private setStartForce(rigidbody: TRigidbody, ratio: number, linear: Vec3OverTime, angular: Vec3OverTime) {
        // linear 
        const x = linear.x.evaluate(this._currentTime, ratio);
        const y = linear.y.evaluate(this._currentTime, ratio);
        const z = linear.z.evaluate(this._currentTime, ratio);
        const ns = linear.nodeSpace;
        const force = v3(x, y, z);
        const forceV2 = v2(x, y);

        // angular
        const tx = angular.x.evaluate(this._currentTime, ratio);
        const ty = angular.x.evaluate(this._currentTime, ratio);
        const tz = angular.x.evaluate(this._currentTime, ratio);
        const tns = angular.nodeSpace;

        const torque = v3(tx, ty, tz);
        const torqueV2 = tx;

        if (rigidbody instanceof RigidBody || rigidbody instanceof CustomRigidbody) { // 3D

            if (linear.enable) {
                switch (ns) {
                    case NodeSpace.LOCAL:
                        rigidbody.applyLocalForce(force);
                        break
                    default:
                        rigidbody.applyForce(force, Vec3.ZERO);
                        break
                }
            }

            if (angular.enable) {
                switch (tns) {
                    case NodeSpace.LOCAL:
                        rigidbody.applyTorque(torque);
                        break;
                    default:
                        rigidbody.applyLocalTorque(torque);
                        break;
                }
            }
        } else if (rigidbody instanceof RigidBody2D) { // 2D

            if (linear.enable) {
                if (linear.nodeSpace == NodeSpace.LOCAL) {
                    let worldForceV3 = v3();
                    let q = rigidbody.node.worldRotation.clone();
                    Vec3.transformQuat(worldForceV3, force, q);
                    rigidbody.linearVelocity = v2(worldForceV3.x, worldForceV3.y);
                    rigidbody.applyForceToCenter(v2(worldForceV3.x, worldForceV3.y), true);
                } else {
                    rigidbody.applyForceToCenter(forceV2, true);
                }
            }

            if (angular.enable) {
                rigidbody.applyTorque(torqueV2, true);
            }
        }
    }

    private setStartVelocity(rigidbody: TRigidbody, ratio: number, linear: Vec3OverTime, angular: Vec3OverTime) {
        const lx = linear.x.evaluate(this._currentTime, ratio);
        const ly = linear.y.evaluate(this._currentTime, ratio);
        const lz = linear.z.evaluate(this._currentTime, ratio);
        let lv = v3(lx, ly, lz);
        let linearVelocityV2 = v2(lx, ly);

        const ax = angular.x.evaluate(this._currentTime, ratio);
        const ay = angular.y.evaluate(this._currentTime, ratio);
        const az = angular.z.evaluate(this._currentTime, ratio);
        let av = v3(ax, ay, az);

        if (rigidbody instanceof RigidBody || rigidbody instanceof CustomRigidbody) { // 3D 
            if (linear.enable) {
                rigidbody.setLinearVelocity(lv);
            }

            if (angular.enable) {
                rigidbody.setAngularVelocity(av);
            }

        } else if (rigidbody instanceof RigidBody2D) { // 2D
            if (linear.enable) {
                if (linear.nodeSpace == NodeSpace.LOCAL) {
                    // transform velocity from local to world
                    let worldLinearVelocityV3 = v3();
                    let q = rigidbody.node.worldRotation.clone();
                    Vec3.transformQuat(worldLinearVelocityV3, lv, q);
                    rigidbody.linearVelocity = v2(worldLinearVelocityV3.x, worldLinearVelocityV3.y);
                } else {
                    rigidbody.linearVelocity = linearVelocityV2;
                }
            }
            if (angular.enable) {
                rigidbody.angularVelocity = ax;
            }
        }
    }

    private onProjectileDead(node: Node) {
        let rigid = this.findRigidbody(node);
        let index = this.managedProjectiles.indexOf(rigid);
        if (index >= 0) {
            this.managedProjectiles.splice(index, 1);
            this.projectilePool.free(node);
            node.active = false;
        }
    }

    private findRigidbody(node: Node): TRigidbody {
        let rigid: TRigidbody = null;
        if (this.searchRigidCallback) {
            console.log("[ProjectileEmitter] try use search rigidbody callback to search rigidbody");
            rigid = this.searchRigidCallback.call(this);
        }

        if (rigid == null) {
            rigid = node.getComponent(RigidBody) ||
                node.getComponentInChildren(RigidBody) ||
                node.getComponent(RigidBody2D) ||
                node.getComponentInChildren(RigidBody2D);
        }
        return rigid;
    }

}

