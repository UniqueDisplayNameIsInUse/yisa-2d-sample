export namespace str {
    export function isNullOrEmpty(s: string): boolean {
        return !s || (typeof s) != 'string' || s.length == 0;
    }
}