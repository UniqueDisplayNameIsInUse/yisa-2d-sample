import { IVec3Like, math, Quat, v3, Vec3 } from "cc";

export namespace mathutil {

    let tempVec: Vec3 = v3()
    let tempVec2: Vec3 = v3()
    let tempVec3: Vec3 = v3()
    let up = v3()

    export const ROT_Y_180: Readonly<Quat> = newQuatFromEluer(0, 180, 0);

    export function newQuatFromEluer(x: number, y: number, z: number): Quat {
        let q = new Quat();
        Quat.fromEuler(q, x, y, z);
        return q;
    }

    export function equals(a: number, b: number, epsilon: number = math.EPSILON): boolean {
        return Math.abs(a - b) < epsilon;
    }

    export function moveTowards<TType extends IVec3Like>(out: TType, start: TType, end: TType, maxMoveDelta: number) {
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

    /**
        * Rodrigues’ Rotation Formula
        * 使 v 绕 u 轴旋转 maxAngleDelta （弧度）
        * @param out 
        * @param forward 
        * @param axis 
        * @param maxAngleDelta 
        */
    export function rotateAround(out: Vec3, forward: Vec3, axis: Vec3, maxAngleDelta: number) {

        //out = v*cos + uxv*sin  + (u*v)*u*(1- cos);
        const cos = Math.cos(maxAngleDelta);
        const sin = Math.sin(maxAngleDelta);

        // v * cos 
        Vec3.multiplyScalar(tempVec, forward, cos);

        // u x v 
        Vec3.cross(tempVec2, axis, forward);

        // v*cos + uxv*sin
        Vec3.scaleAndAdd(tempVec3, tempVec, tempVec2, sin);

        const dot = Vec3.dot(axis, forward);

        // + (u*v)*u*(1-cos)
        Vec3.scaleAndAdd(out, tempVec3, axis, dot * (1.0 - cos));

    }

    /**
     * 将 from 向 to 旋转 maxAngleDelta 弧度
     * @param out 
     * @param from 
     * @param to 
     * @param maxAngleDelta 
     */
    export function rotateToward(out: Vec3, from: Vec3, to: Vec3, maxAngleDelta: number) {
        Vec3.cross(up, from, to);
        this.rotateAround(out, from, up, maxAngleDelta);
    }

    /**
     * 求两个向量间的夹角（带符号）
     * @param from 
     * @param to 
     * @param axis 
     * @returns 
     */
    export function signAngle(from: Vec3, to: Vec3, axis: Vec3): number {
        const angle = Vec3.angle(from, to);
        Vec3.cross(tempVec, from, to);
        const sign = Math.sign(axis.x * tempVec.x + axis.y * tempVec.y + axis.z * tempVec.z);
        return angle * sign;
    }
}