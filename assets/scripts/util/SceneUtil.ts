import { Node, find } from "cc";

export namespace sceneUtil {
    let canvas: Node = null;
    export const gameCanvasName = 'LevelCanvas';
    export function gameCanvas(): Node {
        //return find(gameCanvasName);
        if (canvas == null) { canvas = find(gameCanvasName); }
        return canvas;
    }
}