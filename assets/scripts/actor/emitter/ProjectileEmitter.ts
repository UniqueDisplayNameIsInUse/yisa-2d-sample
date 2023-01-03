import { _decorator, Component, Node, Pool, Prefab, CCFloat, CurveRange, CCInteger, RigidBody, RigidBody2D, GradientRange, Vec3, NodeSpace, v3, v2, instantiate, ERigidBody2DType, Quat, director, NodeEventType, Canvas, UIVertexFormat } from 'cc';
import { Actor } from '../Actor';
import { EmitterBurst } from './EmitterBurst';
import { ForceOverTime } from './ForceOverTime';
import { array } from '../../util/Array';
const { ccclass, property } = _decorator;

type TRigidbody = RigidBody | RigidBody2D;

@ccclass('ProjectileEmitter')
export class ProjectileEmitter extends Component {

    @property(CCFloat)
    duration: number = 1.0;

    @property
    startOnAwake: boolean = false;

    @property({ type: Prefab })
    projectilePrefab: Prefab | null = null;

    @property({ type: CurveRange })
    startRotation: CurveRange = new CurveRange();

    @property({ type: CurveRange })
    startVelocity: CurveRange = new CurveRange();

    @property
    is3DMode: boolean = false;

    @property(CCInteger)
    totalCount: number = 1;

    @property([EmitterBurst])
    burst: EmitterBurst[] = []

    @property({ group: "Force" })
    useLinearForceOverTime: boolean = false;

    @property({ group: "Force", visible: function (this: ProjectileEmitter) { return this.useLinearForceOverTime } })
    linearForceOverTime: ForceOverTime = new ForceOverTime();

    @property({ group: "Force" })
    useTorqueOverTime: boolean = false;

    @property({ group: "Force", visible: function (this: ProjectileEmitter) { return this.useTorqueOverTime } })
    torqueOverTime: ForceOverTime = new ForceOverTime();

    @property({ group: "Velocity" })
    useLinearVelocityOverTime: boolean = false;

    @property({ group: "Velocity", visible: function (this: ProjectileEmitter) { return this.useLinearVelocityOverTime } })
    linearVelocityOverTime: ForceOverTime = new ForceOverTime();

    @property({ group: "Velocity" })
    useAngularVelocityOverTime: boolean = false;

    @property({ group: "Velocity", visible: function (this: ProjectileEmitter) { return this.useAngularVelocityOverTime } })
    angularVelocityOverTime: ForceOverTime = new ForceOverTime();

    useForceMode: boolean = false;
    useDynamic: boolean = false; // depends on whether projectiles contains a dynamic-rigidbody

    private isStarted: boolean = false; // is started    

    @property(Actor)
    actor: Actor | null = null;

    @property(CCInteger)
    elementsPerbatch: number = 5;

    private _currentTime: number = 0;
    private _deltaTime: number = 0;

    projectileRoot: Node = null; // for 2D object, search parent untile find `Canvas`

    projectilePool: Pool<Node> = null;

    managedProjectiles: Array<TRigidbody> = []; // managed projectiles

    // tempoerty variables for emitt once
    emitterPos: Vec3 = v3();
    emitterRot: Quat = new Quat();
    emitterLinearVelocity: Vec3 = v3();
    emitterAngularVelocity: Vec3 = v3();

    currentCount: number = 0;

    start() {
        if (this.startOnAwake) {
            this.startEmitt();
            this.update(0);
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

    getProjectile(): Node {
        let node = this.projectilePool.alloc();
        return node;
    }

    update(deltaTime: number) {
        this._deltaTime = deltaTime;
        this.doBurst();
        this.updateManaged();
        this._currentTime += deltaTime;

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

    emitOneProjectile() {

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

        let node = this.projectilePool.alloc();
        let r3d: RigidBody = null;
        let r2d: RigidBody2D = null;
        this.useForceMode = this.useLinearForceOverTime || this.useTorqueOverTime;

        if (this.is3DMode) {
            r3d = node.getComponent(RigidBody) || node.getComponentInChildren(RigidBody);
            this.useDynamic = r3d.type == RigidBody.Type.DYNAMIC;
        }
        else {
            r2d = node.getComponent(RigidBody2D) || node.getComponentInChildren(RigidBody2D);
            this.useDynamic = r2d.type == ERigidBody2DType.Dynamic;
        }
        this.managedProjectiles.push(r2d || r3d);

        node.worldPosition = this.emitterPos;
        node.worldRotation = this.emitterRot;

        if (this.is3DMode) {
            director.getScene().addChild(node);
        } else {
            this.searchProjectileRoot();

            if (this.projectileRoot) {
                this.projectileRoot.addChild(node);
            }
        }

        this.currentCount++;
    }

    searchProjectileRoot() {
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

    doBurst() {
        if (array.isNullOrEmpty(this.burst)) {
            return;
        }

        const nextTime = this._currentTime + this._deltaTime;
        for (let i = 0; i < this.burst.length; i++) {
            const b = this.burst[i];
            if (b.time >= this._currentTime && b.time <= nextTime) {
                this.internalBurst(b);
                console.log("burst", b);
            }
        }
    }

    private internalBurst(b: EmitterBurst) {
        if (b.useNode) {

            // TODO: burst            
            for (let i = 0; i < b.nodes.length; i++) {
                const node = b.nodes[i];
                this.emitterPos = node.worldPosition.clone();
                this.emitterRot = node.worldRotation.clone();
                this.emitOneProjectile();
            }

        } else {

            // emitt by shape
            this.emitterPos = this.node.worldPosition.clone();
            this.emitterRot = this.node.worldRotation.clone();
            this.emitOneProjectile();
        }
    }

    private updateManaged() {
        const dt = this._deltaTime;
        const ratio = this._currentTime / this.duration;

        if (this.useForceMode && (this.useLinearForceOverTime || this.useTorqueOverTime)) { // force part

            // linear 
            const x = this.linearForceOverTime.x.evaluate(this._currentTime, ratio);
            const y = this.linearForceOverTime.y.evaluate(this._currentTime, ratio);
            const z = this.linearForceOverTime.z.evaluate(this._currentTime, ratio);
            const ns = this.linearVelocityOverTime.nodeSpace;
            const force = v3(x, y, z);
            const forceV2 = v2(x, y);

            // angular
            const tx = this.torqueOverTime.x.evaluate(this._currentTime, ratio);
            const ty = this.torqueOverTime.x.evaluate(this._currentTime, ratio);
            const tz = this.torqueOverTime.x.evaluate(this._currentTime, ratio);
            const tns = this.torqueOverTime.nodeSpace;

            const torque = v3(tx, ty, tz);
            const torqueV2 = tx;

            for (let r of this.managedProjectiles) {

                if (r instanceof RigidBody) { // 3D

                    if (this.useDynamic) {
                        if (r.type != RigidBody.Type.DYNAMIC)
                            console.warn("[ProjectileEmitter] rigidbody.type must be 'RigidBody.Type.DYNAMIC' when Use Force Mode is on.")
                        break;
                    }

                    if (this.useLinearVelocityOverTime) {
                        switch (ns) {
                            case NodeSpace.LOCAL:
                                r.applyLocalForce(force);
                                break
                            default:
                                r.applyForce(force, Vec3.ZERO);
                                break
                        }
                    }

                    if (this.useAngularVelocityOverTime) {
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

                    if (this.useLinearVelocityOverTime)
                        r.applyForceToCenter(forceV2, true);
                    if (this.useAngularVelocityOverTime)
                        r.applyTorque(torqueV2, true);
                }

            }
            return;
        } else if (this.useLinearVelocityOverTime || this.useAngularVelocityOverTime) { // velocity part            

            const lx = this.linearVelocityOverTime.x.evaluate(this._currentTime, ratio);
            const ly = this.linearVelocityOverTime.y.evaluate(this._currentTime, ratio);
            const lz = this.linearVelocityOverTime.z.evaluate(this._currentTime, ratio);
            let lv = v3(lx, ly, lz);
            let lvV2 = v2(lx, ly);

            const ax = this.angularVelocityOverTime.x.evaluate(this._currentTime, ratio);
            const ay = this.angularVelocityOverTime.y.evaluate(this._currentTime, ratio);
            const az = this.angularVelocityOverTime.z.evaluate(this._currentTime, ratio);
            let av = v3(ax, ay, az);
            let avV2 = ax;

            if (this.useDynamic) {

                for (let r of this.managedProjectiles) {
                    if (r instanceof RigidBody) { // 3D 
                        if (this.useLinearVelocityOverTime)
                            r.setLinearVelocity(lv);
                        if (this.useAngularVelocityOverTime)
                            r.setAngularVelocity(av);
                    } else if (r instanceof RigidBody2D) { // 2D

                        if (this.useLinearVelocityOverTime)
                            r.linearVelocity = lvV2;

                        if (this.useAngularVelocityOverTime)
                            r.angularVelocity = avV2;
                    }
                }

            } else {

                let tempP = v3(0, 0, 0);
                lv = lv.multiplyScalar(dt);
                for (let r of this.managedProjectiles) {
                    // p = p0 + v * t;
                    if (this.useLinearVelocityOverTime) {
                        Vec3.add(tempP, this.node.worldPosition, lv);
                        r.node.worldPosition = tempP;
                    }

                    // TODO: rotate
                    if (this.useAngularVelocityOverTime) {

                    }
                }
            }
        }
    }

    private onProjectileDead(r: TRigidbody) {
        let i = this.managedProjectiles.indexOf(r);
        this.managedProjectiles = this.managedProjectiles.splice(i, 1);
    }

    private onChildProjectileBorn(r: TRigidbody) {
        this.managedProjectiles.push(r);
    }
}

