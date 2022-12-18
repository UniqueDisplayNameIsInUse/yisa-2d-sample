import { EPSILON, math, v3, Vec3 } from "cc";

export namespace mathu {

    export function equals(a: number, b: number, epsilon: number = math.EPSILON): boolean {
        return Math.abs(a - b) < EPSILON;
    }

    export function moveToward(out: Vec3, start: Vec3, end: Vec3, maxMoveDelta: number) {
        let d = Vec3.distance(start, end);
        if (d < maxMoveDelta) {
            out.x = end.x;
            out.y = end.y;
            out.z = end.z;
            return;
        }

        let dir = v3();
        Vec3.subtract(dir, end, start);
        dir.normalize();

        Vec3.scaleAndAdd(out, start, dir, maxMoveDelta);
    }
}