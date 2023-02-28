import { Director, log } from "cc";
import { director, game } from "cc";

let levelStartTime: number = 0;

export namespace timeUtil {    

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

    /**
     * 监听场景切换事件，重设关卡事件
     */
    director.on(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
        log('[timeUtil] resetLevelTime')
        resetLevelTime();
    })
}