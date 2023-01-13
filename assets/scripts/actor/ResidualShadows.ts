import { Node, Pool, Sprite, SpriteFrame, UITransform, Vec3, instantiate, macro, v3 } from "cc";

export class Residual {
    frame: SpriteFrame | null = null;
    sprite: Sprite | null = null;
    position: Vec3 = v3(0, 0, 0);
    opacity: number = 0;
}

export class ResidualShadows {

    private renderer: Sprite = null;;

    private _count: number = 10;

    private set count(v: number) {
        this._count = v;
    }

    get count(): number {
        return this._count;
    }

    private _interval: number = 0.2;

    private set interval(v: number) {
        this._interval = v;
    }
    get interval(): number {
        return this._interval;
    }

    private _enabled: boolean = false;

    set enable(enable: boolean) {
        this._enabled = enable;
    }

    get enable(): boolean {
        return this._enabled;
    }

    residualIndex: number = 0;
    residuals: Array<Residual> = [];
    renderNode: Node = null;

    cloneTarget: Node = null;
    nodePool: Pool<Node> = null;

    constructor(renderNode: Node, renderer: Sprite, count: number = 5, interval: number = 0.1) {
        this.renderNode = renderNode;
        this.renderer = renderer;
        this._count = count;
        this._interval = interval;
        this.invalidate();
    }

    record() {
        if (this.residuals.length >= this.count) {
            let r = this.residuals[0];
            r.sprite.node.removeFromParent();            
            this.residuals = this.residuals.slice(1);
        }

        let r = new Residual();
        r.frame = this.renderer.spriteFrame;
        r.position = this.renderer.node.worldPosition.clone();
        if (r.sprite == null) {
            if (this.cloneTarget == null) {
                this.cloneTarget = instantiate(this.renderer.node) as Node;
            }

            if (this.nodePool == null) {
                this.nodePool = new Pool((): Node => {
                    return instantiate(this.cloneTarget)
                }, this.count, (node: Node) => {
                    node.removeFromParent()
                })
            }

            let no = this.nodePool.alloc();
            no.name = "Residual";
            no.setParent(this.renderNode.parent);
            let i = this.renderNode.getSiblingIndex();
            no.setSiblingIndex(i - 1);

            let originUt = this.renderer.node.getComponent(UITransform);

            let ut = no.getComponent(UITransform) || no.addComponent(UITransform);
            ut.contentSize = originUt.contentSize;
            ut.anchorPoint = originUt.anchorPoint;

            let spriteRenderer = no.getComponent(Sprite) || no.addComponent(Sprite);
            spriteRenderer.spriteFrame = r.frame;
            const c = spriteRenderer.color;
            c.set(c.r, c.g, c.b, (1.0 - this.residuals.length / this.count) * 255);

            no.worldPosition = r.position;
            r.sprite = spriteRenderer;
        }

        this.residuals.push(r);
    }

    private invalidate() {
        this.renderer.schedule(() => {
            this.record()
        }, this.interval, macro.REPEAT_FOREVER, 0.0);

        for (let r of this.residuals) {
            r.sprite?.node?.removeFromParent()
        }
        this.residuals = [];
    }

    destory() {
        this.renderer.unschedule(this.record);
        for (let r of this.residuals) {
            r.sprite?.node?.removeFromParent()
        }
        this.residuals = [];
    }
}