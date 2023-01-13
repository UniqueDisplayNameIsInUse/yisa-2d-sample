import { array } from "../../util/Array";
import { ProjectileEmitter } from "./ProjectileEmitter";

export class EmitterManager {
    
    emitters: Array<ProjectileEmitter> = [];

    getRandom():ProjectileEmitter {
        return array.random(this.emitters);
    }
}