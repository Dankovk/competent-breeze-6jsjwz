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
    type AbstractMesh,
    CubeTexture, MeshBuilder, Quaternion
} from "@babylonjs/core";
import { BabylonPlugin } from "@geenee/bodyrenderers-babylon";
import { AbstractPhysicsPlugin } from "@/types/physics-plugin";
import { getEnvironmentUrl } from "@/utils/url";

// TODO: Replace when uploading the new model
const SHADOW_MESH_NAME = "bag_primitive1";

export class ShortBagPlugin extends BabylonPlugin {
    private childMeshes: AbstractMesh[] = [];
    public referencePositionSphere?: Mesh;
    public orientation = "right";
    private isVisible = true;
    private bag?: AbstractMesh;
    started = false;

    constructor (
        scene: Scene,
        private readonly physicsPlugin: AbstractPhysicsPlugin,

        private readonly shadowGenerator: ShadowGenerator,
        protected sku: SKUKeys
    ) {
        super();
        this.scene = scene;

        const hdrTexture = CubeTexture.CreateFromPrefilteredData(getEnvironmentUrl("studio.env"), this.scene);
        this.scene.environmentTexture = hdrTexture;
        this.scene.environmentTexture.rotationY = Math.PI;
        this.scene.environmentIntensity = 2;
    }

    async importBagModel () {
        if (this.scene == null) throw new Error("Scene is not defined");

        this.scene.physicsEnabled = false;

        const bagMeshes = (await SceneLoader.ImportMeshAsync("", getSKUUrl(this.sku, 0), "", this.scene)).meshes;
        this.bag = bagMeshes.find(el => el.name === "__root__");
        
        const bagMesh = this.scene.getMeshByName(SHADOW_MESH_NAME);

        if (this.bag == null || bagMesh == null) return;
        this.childMeshes = this.bag.getChildMeshes();

        const fist = this.scene.getMeshByName("fist");
        if (fist?.material != null) {
            fist.material.disableColorWrite = true;
            fist.material.needDepthPrePass = true;
        }

        // Remove light reflection on the image texture
        const textureMaterial = this.scene.getMaterialByName("face");
        if (textureMaterial != null) {
            // @ts-ignore
            textureMaterial.metallicF0Factor = 0;
        }

        this.shadowGenerator?.getShadowMap()?.renderList?.push(bagMesh, this.scene.getMeshByName("bag_primitive0"));
        this.setMeshesVisible(false);
    }

    startPhysics = () => {
        if (this.scene == null) throw new Error("Scene is not defined");
        if (this.bag == null) {
            return;
        }
        this.started = true;

        const initialPosition = this.scene.getTransformNodeByName("BagPosition")?.getAbsolutePosition().clone() ?? new Vector3(0, 0, -1);
        const physicsTopLink = this.createPhysicsTopLink();

        const physicsPivot = this.physicsPlugin.addPhysicsToMesh(this.bag, physicsTopLink, initialPosition);
        this.createPositionSphere();

        this.scene.onBeforeRenderObservable.add(() => {
            if (physicsPivot != null && (this.referencePositionSphere != null)) {
                if (AbstractPhysicsPlugin.isPhysicsLegacy) {
                    // this.physicsPlugin.addPhysicsTransform(physicsPivot, this.referencePositionSphere);
                    const angles = this.referencePositionSphere.absoluteRotationQuaternion.toEulerAngles();
                    physicsPivot.position = this.referencePositionSphere.getAbsolutePosition();
                    physicsPivot.rotationQuaternion = Quaternion.FromEulerAngles(0, this.orientation === "left" ? angles.y - Math.PI / 4 : angles.y + Math.PI / 4, 0);
                } else {
                    const bodyId = physicsPivot?.physicsBody?._pluginData.hpBodyId;
                    const LERP_AMOUNT = 0.3;
                    const pos = this.referencePositionSphere.getAbsolutePosition();
                    const smooth = Vector3.Lerp(physicsPivot.position, pos.clone(), LERP_AMOUNT);
                    const position = [smooth.x, smooth.y, smooth.z];
                    const angles = this.referencePositionSphere.absoluteRotationQuaternion.toEulerAngles();
                    const quat = Quaternion.FromEulerAngles(0, angles.y - 2 * Math.PI / 3, 0);
                    const smoothQ = Quaternion.Slerp(physicsPivot.rotationQuaternion ?? Quaternion.Identity(), quat, LERP_AMOUNT);
                    this.physicsPlugin.plugin._hknp.HP_Body_SetQTransform(bodyId, [position, [smoothQ.x, smoothQ.y, smoothQ.z, smoothQ.w]]);
                }
            }
        });
    };

    createPositionSphere (orientation = "right") {
        this.orientation = orientation;
        if (this.scene == null) throw new Error("Scene is not defined");

        const parent = this.scene.getTransformNodeByName(orientation === "right" ? "BagPositionR" : "BagPositionL") as Mesh;
        if (this.referencePositionSphere == null) {
            this.referencePositionSphere = MeshBuilder.CreateCylinder("positionSphere", { height: 0.1, diameter: 0.05 }, this.scene);
            this.referencePositionSphere.material = new StandardMaterial("redMaterial", this.scene);
            (this.referencePositionSphere.material as StandardMaterial).diffuseColor.copyFrom(new Color3(1, 0, 0));
            this.referencePositionSphere.material.alpha = 0;
        } else {
            this.referencePositionSphere.setParent(null);
        }
        this.referencePositionSphere.position = parent.getAbsolutePosition().clone();
        this.referencePositionSphere.rotationQuaternion = parent.absoluteRotationQuaternion.clone();
        this.referencePositionSphere.setParent(parent);
    }

    setMeshesVisible (visible: boolean) {
        if (this.scene == null) throw new Error("Scene is not defined");
        if (this.isVisible === visible) {
            return;
        }
        this.isVisible = visible;
        this.childMeshes.forEach((m) => {
            m.visibility = visible ? 1 : 0;
        });
    }

    private createPhysicsTopLink (): Mesh {
        if (this.scene == null) throw new Error("Scene is not defined");

        const physicsTopLink = Mesh.CreateSphere("PhysicsTopLink", 16, 0.05, this.scene);
        const transparentMaterial = new StandardMaterial("transparent", this.scene);
        transparentMaterial.alpha = 0;
        physicsTopLink.material = transparentMaterial;

        return physicsTopLink;
    }

    addDebugGizmo = (object: AbstractMesh) => {
        if (this.scene == null) throw new Error("Scene is not defined");

        const gizmoManager = new GizmoManager(this.scene);
        gizmoManager.positionGizmoEnabled = true;
        gizmoManager.usePointerToAttachGizmos = false;
        gizmoManager.attachToMesh(object);
    };

    switchHand = (orientation = "right") => {
        if (this.scene == null) {
            throw new Error("Scene is not defined");
        }
        this.createPositionSphere(orientation);
        const fist = this.scene.getMeshByName("fist");
        if (fist != null) {
            fist.scaling.z *= -1;
        }
    };
}
