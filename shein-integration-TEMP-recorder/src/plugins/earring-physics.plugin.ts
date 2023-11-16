import { BabylonPlugin, OccluderMaterial } from "@geenee/bodyrenderers-babylon";
import {
    type AbstractMesh,
    Mesh,
    MeshBuilder,
    type Nullable,
    type Scene,
    StandardMaterial,
    type TransformNode
} from "@babylonjs/core";
import { addDragBehaviour } from "../utils/add-drag-behaviour";
import { type AbstractPhysicsPlugin } from "@/types/physics-plugin";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

function lerp (start: number, stop: number, amount: number) {
    return start * (1 - amount) + stop * amount;
}

const _physicsTopLink: { left: Nullable<Mesh>, right: Nullable<Mesh> } = { left: null, right: null };

export class EarringPhysicsPlugin extends BabylonPlugin {
    protected leftPhysicsPivot?: AbstractMesh;
    protected rightPhysicsPivot?: AbstractMesh;
    constructor (
        scene: Scene,
        private readonly physicsPlugin: AbstractPhysicsPlugin
    ) {
        super();
        this.scene = scene;
    }

    activateEar = (earMeshParent: AbstractMesh | null, earringPosition: keyof typeof _physicsTopLink) => {
        // @ts-ignore
        const positionSphere = earMeshParent?.posSphere;
        if (earMeshParent != null && (positionSphere != null)) {
            const physicsTopLink = this.createPhysicsTopLink(earringPosition);
            const top = this.physicsPlugin.addPhysicsToEarringsMesh(earMeshParent, physicsTopLink, positionSphere.getAbsolutePosition());
            // @ts-ignore
            top.posSphere = positionSphere;
            return top;
        }
    };

    private createPhysicsTopLink (earringPosition: keyof typeof _physicsTopLink): Mesh {
        if (this.scene == null) return;
        _physicsTopLink[earringPosition]?.dispose(false, true);
        _physicsTopLink[earringPosition] = Mesh.CreateSphere("PhysicsTopLink", 16, 0.01, this.scene);
        const physicsTopLink = _physicsTopLink[earringPosition];

        if (physicsTopLink == null) {
            throw new Error("Create physics top link error");
        }
        const transparentMaterial = new StandardMaterial("transparent", this.scene);
        transparentMaterial.alpha = 0;
        physicsTopLink.material = transparentMaterial;
        return physicsTopLink;
    }

    startEarringPhysics = () => {
        if (this.scene == null) return;

        this.leftPhysicsPivot = this.activateEar(this.scene.getTransformNodeByName("LShein") ?? null, "left");
        this.rightPhysicsPivot = this.activateEar(this.scene.getTransformNodeByName("RShein") ?? null, "right");
    };

    initEar = async (
        earrings: Nullable<TransformNode>,
        earOccluder: Nullable<AbstractMesh>,
        earMeshParent: Nullable<TransformNode>,
        localStorageKey: string
    ) => {
        if (this.scene == null) return;
        if (earrings == null) return;

        const savedPosition = JSON.parse(localStorage.getItem(localStorageKey) ?? "{}");

        const sphere = MeshBuilder.CreateSphere("positionSphere", { diameter: 0.15 }, this.scene);
        sphere.material = new StandardMaterial("sphereMat", this.scene);
        sphere.material.alpha = 0;
        sphere.parent = earrings.parent;
        if (savedPosition.x !== undefined && savedPosition.y !== undefined && savedPosition.z !== undefined) {
            sphere.position = new Vector3(savedPosition.x, savedPosition.y, savedPosition.z);
        } else {
            sphere.position = earrings.position.clone();
        }

        addDragBehaviour(sphere, localStorageKey);

        // @ts-ignore
        earMeshParent.posSphere = sphere;

        if (earOccluder != null) {
            earOccluder.material = new OccluderMaterial("occluder_ear", this.scene);
        }

        if (earMeshParent != null) {
            earMeshParent.setParent(null);
            earMeshParent.position = new Vector3(0, 0, 0);
        }
    };

    updatePhysicsPositions = (isFaceDetected: boolean) => {
        if (!isFaceDetected) {
            return;
        }
        if ((this.leftPhysicsPivot != null) && (this.rightPhysicsPivot != null)) {
            this.physicsPlugin.updatePhysicsPivotPosition(this.leftPhysicsPivot, this.leftPhysicsPivot.posSphere);
            this.physicsPlugin.updatePhysicsPivotPosition(this.rightPhysicsPivot, this.rightPhysicsPivot.posSphere);
        }
    };
}
