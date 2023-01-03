import { Vec2 } from "cc";

export enum DirectionalType {
    Directional = 0,
    Chase,
}

export enum SplitType{
    
}

export class ProjectileProperty {

    /**
     * 
     */
    directionalType: DirectionalType = DirectionalType.Directional;

    /**
     * 子弹的终点
     */
    dest: Vec2;

    /**
     * 速度
     */
    linearSpeed: number = 1.0;

    /**
     * 角速度
     */
    angularSpeed: number = 1.0;

    /**
     * 分裂次数
     */
    split: number = 0;

    /**
     * 穿透次数
     */
    pentranration: number = 0;

    /**
     * 最终目标
     */
    chaseTarget: Node = null;

    /**
     * 子弹的时长
     */
    duration : number = 0;
}
