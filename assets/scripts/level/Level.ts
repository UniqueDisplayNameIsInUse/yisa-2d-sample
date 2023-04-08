import { CCFloat, CCInteger, Component, Label, Node, Prefab, _decorator, assert, director, instantiate, screen, sys } from "cc";
import { PlayerController } from "../actor/PlayerController";
import { GameEvent } from "../event/GameEvent";
const { ccclass, property, requireComponent } = _decorator;

/**
 * 出生点
 */
@ccclass("SpawnPoint")
export class SpawnPoint {

    @property(Node)
    spawnNode: Node;

    @property(CCFloat)
    interval: number = 5.0;

    @property(CCInteger)
    repeatCount: number = 0;
}

/**
 * 关卡
 */
@ccclass("Level")
export class Level extends Component {   

    @property([SpawnPoint])
    spawnPoints: Array<SpawnPoint> = [];

    @property(Prefab)
    enemyPrefab: Prefab | null = null;

    totalCount = 0;
    killedCount: number = 0;

    @property(Node)
    uiFail: Node = null;

    @property(Node)
    uiWin : Node = null;

    @property(Label)
    statictics: Label = null;

    totalEnemyCount: number = 0;

    start() {
        if(sys.platform == sys.Platform.MOBILE_BROWSER ){
            screen.requestFullScreen();        
        }        

        for (let sp of this.spawnPoints) {
            this.totalCount += sp.repeatCount + 1;
            this.schedule(() => {
                this.doSpawn(sp)
            }, sp.interval, sp.repeatCount, 0.0);
        }

        director.on(GameEvent.OnDie, this.onActorDead, this);
        this.statictics.string = `${this.killedCount}/${this.totalCount}`;
    }

    onDestroy() {     
        director.off(GameEvent.OnDie, this.onActorDead, this);
    }

    doSpawn(sp: SpawnPoint) {
        let node = instantiate(this.enemyPrefab);
        this.node.addChild(node);
        node.worldPosition = sp.spawnNode.worldPosition;
    }

    onActorDead(node: Node) {
        if (node && node == PlayerController.instance?.node) {
            this.uiFail.active = true;
        } else {
            this.killedCount++;
            this.statictics.string = `${this.killedCount}/${this.totalCount}`; 
            
            if( this.killedCount >= this.totalCount){
                this.uiWin.active = true;
            }
        }
    }
}
