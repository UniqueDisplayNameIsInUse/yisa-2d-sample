import { Asset } from "cc";

export class AssetCache {

    assets: Map<string, Asset> = new Map();

    cacheAsset<T extends Asset>(path: string, asset: T) {
        this.assets.set(path, asset);
    }

    getAsset<T extends Asset>(path: string): T {
        return this.assets.get(path) as T;
    }
}

export let assetCache = new AssetCache();