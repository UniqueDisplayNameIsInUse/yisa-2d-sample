import { geometry, Vec3 } from "cc";

export namespace phyutil {

    export function ray(o: Vec3, d: Vec3, out: geometry.Ray = null): geometry.Ray {
        if (out == null) {
            out = new geometry.Ray(o.x, o.y, o.z, d.x, d.y, d.z);
            return out;
        }
        out.o = o;
        out.d = d;
        return out;
    }
    
}