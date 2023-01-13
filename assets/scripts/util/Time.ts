import { game } from "cc";

let levelStartTime: number = 0;

export namespace timeUtl {

    /**
     * 以秒为单位得到关卡的事件
     * @returns 
     */
    export function timeSinceLevelStart() {
        return (game.totalTime - levelStartTime) * 0.001;
    }

    /**
     * 重设关卡计时
     */
    export function resetLevelTime() {
        levelStartTime = game.totalTime;
    }

}