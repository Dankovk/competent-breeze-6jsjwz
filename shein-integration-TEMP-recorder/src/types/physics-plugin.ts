import {
    type AbstractMesh,
    type CannonJSPlugin,
    type HavokPlugin,
    type Mesh,
    type Scene,
    type Vector3
} from "@babylonjs/core";
import { isLegacyBrowser } from "@/utils/deviceInformation";

export interface PhysicsOptions {
    initialPosition?: Vector3
    impostor?: AbstractMesh
}

export interface AddPhysicsOptions {
    damping?: number
    mass?: number
    friction?: number
    restitution?: number
    limits?: {
        x?: {
            minLimit: number
            maxLimit: number
        }
        y?: {
            minLimit: number
            maxLimit: number
        }
        z?: {
            minLimit: number
            maxLimit: number
        }
    }
    constraintOptions: Record<string, any>
}

export abstract class AbstractPhysicsPlugin {
    static isPhysicsLegacy = isLegacyBrowser();
    // static isPhysicsLegacy = true;
    abstract plugin: HavokPlugin | CannonJSPlugin;
    abstract scene?: Scene;

    abstract async setup (): Promise<void>;

    enable (scene: Scene, gravity: Vector3): void {
        this.scene = scene;
        scene.enablePhysics(gravity, this.plugin);
    }

    abstract addPhysicsToMesh (mesh: AbstractMesh, physicsTopLink: Mesh, initialPosition: Vector3, options?: AddPhysicsOptions, zOffset?: number): Mesh;

    abstract addPhysicsToEarringsMesh (mesh: AbstractMesh, physicsTopLink: Mesh, initialPosition: Vector3): Mesh;

    abstract addPhysicsTransform (physicsPivot: Mesh, referencePositionSphere: Mesh): void;

    abstract updatePhysicsPivotPosition (physicsPivot: Mesh, referencePositionSphere: Mesh): void;
}
