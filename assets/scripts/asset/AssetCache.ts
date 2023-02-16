import { Asset } from "cc";

export class AssetCache {

    assets: Map<string, Asset> = new Map();

    add<T extends Asset>(path: string, asset: T) {
        this.assets.set(path, asset);
    }

    get<T extends Asset>(path: string): T {
        return this.assets.get(path) as T;
    }

    remove(path:string){

    }

    destory(){

    }
}

export let assetCache = new AssetCache();