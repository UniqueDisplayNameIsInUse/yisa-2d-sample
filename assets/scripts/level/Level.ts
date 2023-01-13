import { CCFloat, CCInteger, Component, Node, Prefab, _decorator, instantiate } from "cc";
import { timeUtl } from "../util/Time";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("SpawnPoint")
export class SpawnPoint {

    @property(Node)
    spawnNode: Node;

    @property(CCFloat)
    interval: number = 5.0;

    @property(CCInteger)
    repeatCount: number = 0;
}

@ccclass("Level")
export class Level extends Component {

    @property([SpawnPoint])
    spawnPoints: Array<SpawnPoint> = [];

    @property(Prefab)
    enemyPrefab: Prefab | null = null;

    desireTotalCount = 0;

    start() {

        timeUtl.resetLevelTime();

        if (1){
            for (let sp of this.spawnPoints) {
                this.desireTotalCount += sp.repeatCount;
                this.schedule(() => {
                    this.doSpawn(sp)
                }, sp.interval, sp.repeatCount, 0.0);
            }
        }
    }

    doSpawn(sp: SpawnPoint) {
        let node = instantiate(this.enemyPrefab);
        this.node.addChild(node);
        node.worldPosition = sp.spawnNode.worldPosition;
    }

    onEnemyDead(node: Node) {
        node.removeFromParent();
    }
}
