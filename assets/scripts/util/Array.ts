import { math } from "cc";

export namespace array {

    export function isNullOrEmpty(a: any): boolean {
        return a && Array.isArray(a) && a.length <= 0;
    }

    export function isValidIndex<T>(a: Array<T>, i: number): boolean {
        return i >= 0 && i < a.length;
    }

    export function random<T>(a: Array<T>): T {
        if (isNullOrEmpty(a)) {
            return null;
        }
        return a[math.randomRange(0, a.length)];
    }

}