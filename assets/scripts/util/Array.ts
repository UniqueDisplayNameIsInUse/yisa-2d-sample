export namespace array {

    export function isNullOrEmpty(a: any): boolean {
        return a && Array.isArray(a) && a.length <= 0;
    }

}