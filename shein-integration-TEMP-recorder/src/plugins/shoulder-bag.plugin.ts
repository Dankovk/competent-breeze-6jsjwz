import { type SKUKeys, getSKUUrl } from "@/utils/skuHelper";
import {
    Mesh,
    Color3,
    Vector3,
    SceneLoader,
    StandardMaterial,
    GizmoManager,
    type Scene,
    type ShadowGenerator,
    type AbstractMesh
} from "@babylonjs/core";
import { BabylonPlugin } from "@geenee/bodyrenderers-babylon";
import { type AbstractPhysicsPlugin, type AddPhysicsOptions } from "@/types/physics-plugin";

export class ShortBagPlugin extends BabylonPlugin {
    private readonly referencePositionSphere?: Mesh;
    private readonly physicsPivot?: Mesh;
    private bag?: AbstractMesh;
    private isVisible = true;
    bagMesh?: AbstractMesh;
    private childMeshes?: AbstractMesh[] = [];
    started = false;

    constructor (
        scene: Scene,
        private readonly physicsPlugin: AbstractPhysicsPlugin,
        private readonly shadowGenerator: ShadowGenerator,
        protected sku: SKUKeys
    ) {
        super();
        this.scene = scene;
    }

    async importBagModel () {
        if (this.scene == null) throw new Error("Scene is not defined");

        this.scene.physicsEnabled = false;

        const bagMeshes = (await SceneLoader.ImportMeshAsync("", getSKUUrl(this.sku, 0), "", this.scene)).meshes;

        this.bag = bagMeshes.find(el => el.name === "__root__");
        if (this.bag == null) return;
        this.childMeshes = this.bag?.getChildMeshes();

        const shadowMeshes = this.bag.getChildMeshes().filter(el => {
            return el.name !== "impostor";
        });

        this.shadowGenerator?.getShadowMap()?.renderList?.push(...shadowMeshes);
        this.setMeshesVisible(false);
    }

    private createPhysicsTopLink (): Mesh {
        if (this.scene == null) throw new Error("Scene is not defined");

        const physicsTopLink = Mesh.CreateSphere("PhysicsTopLink", 16, 0.05, this.scene);
        const transparentMaterial = new StandardMaterial("transparent", this.scene);
        transparentMaterial.alpha = 0;
        physicsTopLink.material = transparentMaterial;

        return physicsTopLink;
    }

    startPhysics = () => {
        if (this.scene == null) throw new Error("Scene is not defined");
        if (this.bag == null) {
            return;
        }
        this.started = true;

        const physicsTopLink = this.createPhysicsTopLink();

        const options: AddPhysicsOptions = {
            mass: 1,
            friction: 1,
            restitution: 1,
            damping: 5,
            limits: {
                z: { minLimit: -Math.PI / 2, maxLimit: 0 }
            },
            constraintOptions: {
                pivotA: new Vector3(0, 0.24, 0)
            }
        };

        const physicsPivot = this.physicsPlugin.addPhysicsToMesh(this.bag, physicsTopLink, new Vector3(0, 0, -1), options, 0.25);
        const referencePositionSphere = this.createShoulderPositionSphere();

        this.scene.onBeforeRenderObservable.add(() => {
            this.physicsPlugin.addPhysicsTransform(physicsPivot, referencePositionSphere);
        });
    };

    createShoulderPositionSphere () {
        if (this.scene == null) throw new Error("Scene is not defined");
        const parent = this.scene.getTransformNodeByName("RightShoulder") as Mesh;
        const referencePositionSphere = Mesh.CreateSphere("shoulderPositionSphere", 16, 0.05, this.scene);
        referencePositionSphere.material = new StandardMaterial("redMaterial", this.scene);
        (referencePositionSphere.material as StandardMaterial).diffuseColor.copyFrom(new Color3(1, 0, 0));
        referencePositionSphere.material.alpha = 0;
        referencePositionSphere.position = parent.getAbsolutePosition().clone();
        referencePositionSphere.position.x -= 0.12;
        referencePositionSphere.position.z -= 0.03;
        referencePositionSphere.position.y += 0.02;
        referencePositionSphere.setParent(parent);

        return referencePositionSphere;
    }

    setMeshesVisible (visible: boolean) {
        if (this.scene == null) throw new Error("Scene is not defined");
        if (this.isVisible === visible) {
            return;
        }
        this.isVisible = visible;
        this.childMeshes?.forEach((m) => {
            m.visibility = visible ? 1 : 0;
        });
    }

    addDebugGizmo = (object: AbstractMesh) => {
        if (this.scene == null) throw new Error("Scene is not defined");

        const gizmoManager = new GizmoManager(this.scene);
        gizmoManager.positionGizmoEnabled = true;
        gizmoManager.usePointerToAttachGizmos = false;
        gizmoManager.attachToMesh(object);
    };
}
