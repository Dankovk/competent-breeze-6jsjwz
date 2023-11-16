import { BabylonPlugin } from "@geenee/bodyrenderers-babylon";
import {
    Color3, Quaternion,
    StandardMaterial, Mesh, SceneLoader, type AbstractMesh, PhysicsImpostor,
    Vector3, MeshBuilder, type Nullable, type ShadowGenerator, type Scene, type Material, GizmoManager, CubeTexture
} from "@babylonjs/core";
import { type PoseResult } from "@geenee/bodyprocessors";
import { type TransformNode } from "@babylonjs/core/Legacy/legacy";
import * as TWEEN from "@tweenjs/tween.js";

interface LerpStore {
    shoulderPosition: Vector3
    shoulderRotation: Quaternion
    hipsPosition: Vector3
    hipsRotation: Quaternion
}

const MIN_LERP_ALPHA = 0.7;

const IS_DEBUG_MODE = false;

export class BagPlugin extends BabylonPlugin {
    protected shoulderPositionSphere?: Mesh;
    protected physicsTopLink?: Mesh;
    protected hipsImpostorObject?: AbstractMesh;
    protected hipsBoneObject?: Nullable<TransformNode>;
    public started = false;
    private shadowGenerator?: ShadowGenerator;
    private bodyModel?: AbstractMesh;

    private importedGltf?: TransformNode;
    protected lerpStore: LerpStore = {
        shoulderRotation: Quaternion.Identity(),
        shoulderPosition: new Vector3(),
        hipsRotation: Quaternion.Identity(),
        hipsPosition: new Vector3()
    };

    async start (shadowGenerator?: ShadowGenerator, model?: AbstractMesh) {
        this.bodyModel = model;
        this.shadowGenerator = shadowGenerator;
        this.started = true;
        this.importBagModel();
        // this.createBodyImpostors();
        // await this.createBag();
    };

    constructor (protected url = "", protected bodyAttachMesh: Mesh, private readonly getLeatherMaterial?: (scene: Scene) => Nullable<Material>) {
        super();
    }

    createShoulderPositionSphere () {
        this.shoulderPositionSphere = Mesh.CreateSphere("shoulderPositionSphere", 16, 0.05, this.scene);
        this.shoulderPositionSphere.material = new StandardMaterial("redMaterial", this.scene);
        (this.shoulderPositionSphere.material as StandardMaterial).diffuseColor.copyFrom(new Color3(1, 0, 0));
        this.shoulderPositionSphere.material.alpha = 0;
        this.shoulderPositionSphere.position = this.bodyAttachMesh.getAbsolutePosition().clone();
        this.shoulderPositionSphere.position.x -= 0.12;
        this.shoulderPositionSphere.position.z += 0.03;
        this.shoulderPositionSphere.setParent(this.bodyAttachMesh);
    }

    createBodyImpostors () {
        this.bodyModel?.getChildMeshes().forEach(el => { el.setEnabled(true); });
        this.scene?.getMeshByName("cloneBody.Armature.Body")?.setEnabled(true);
        const hipsImpostorObject = this.scene?.getMeshByName("hipsimpostor");
        if (hipsImpostorObject != null && (this.scene != null)) {
            this.hipsImpostorObject = hipsImpostorObject;
            const clone = hipsImpostorObject.clone("hipsImpostorBody", hipsImpostorObject.parent);
            if (clone != null) {
                clone.setEnabled(false);
                hipsImpostorObject.setEnabled(false);
                clone.setParent(null);
                clone.rotationQuaternion = hipsImpostorObject.absoluteRotationQuaternion.clone();

                this.scene.onBeforeRenderObservable.add(() => {
                    if (this.scene != null) {
                        const deltaSeconds = this.scene.getEngine().getDeltaTime() / 1000;
                        clone.position = Vector3.Lerp(clone.position, this.lerpStore.hipsPosition, Math.min(deltaSeconds * 30, MIN_LERP_ALPHA));
                        clone.rotationQuaternion = Quaternion.Slerp(clone.rotationQuaternion ?? Quaternion.Identity(), this.lerpStore.hipsRotation, Math.min(deltaSeconds * 30, MIN_LERP_ALPHA));
                    }
                });
                clone.physicsImpostor = new PhysicsImpostor(clone, PhysicsImpostor.CylinderImpostor, {
                    mass: 0,
                    friction: 0
                }, this.scene);
                clone?.physicsImpostor.physicsBody.setCollisionFlags(0);
                clone?.physicsImpostor.physicsBody.setRollingFriction(0.4);
            }
        }
    }

    importLeatherMaterial = () => {
        if (this.getLeatherMaterial != null && (this.scene != null)) {
            return this.getLeatherMaterial(this.scene);
        }
        return new StandardMaterial("Empty Leather", this.scene);
    };

    importBagModel = async () => {
        if (this.scene != null) {
            const hdrTexture = CubeTexture.CreateFromPrefilteredData("Light_Pillars_Dark_A.env", this.scene);
            this.scene.environmentTexture = hdrTexture;

            const bagMeshes = (await SceneLoader.ImportMeshAsync("", this.url, "", this.scene)).meshes;
            const rootGltf = bagMeshes.find(el => el.name === "__root__");
            this.importedGltf = rootGltf;

            this.createBag().then(() => {
                // this.scene?.getMeshByName("Hand")?.setEnabled(false);
                // this.scene?.getMeshByName("HandConnectors")?.setEnabled(false);
                setTimeout(() => {
                    this.createBodyImpostors();
                }, 0);
            });
        }
    };

    async createBag () {
        this.hipsBoneObject = this.scene?.getTransformNodeByName("Hips");
        this.createShoulderPositionSphere();
        if (this.shoulderPositionSphere != null) {
            const scene = this.scene;
            let initialPosition: Vector3;
            if (IS_DEBUG_MODE) {
                initialPosition = new Vector3(0, 0, 0);
            } else {
                initialPosition = this.shoulderPositionSphere.getAbsolutePosition().clone();
            }

            this.lerpStore.shoulderPosition = this.shoulderPositionSphere.getAbsolutePosition().clone();
            this.lerpStore.shoulderRotation = Quaternion.FromEulerAngles(0, -5 * Math.PI / 12, 0);

            const scaling = 0.2;
            this.importedGltf?.setEnabled(true);
            const bagMeshes = this.importedGltf?.getChildMeshes() ?? [];
            const physicsRoot = this.makePhysicsObject([this.importedGltf as AbstractMesh, ...bagMeshes], scaling, initialPosition);

            const leatherMaterial = this.importLeatherMaterial();
            this.scene?.getMeshByName("hitbox10")?.dispose();

            // Create a rope out of joints
            const physicsTopLink = Mesh.CreateSphere("PhysicsTopLink", 16, 0.08, scene);
            const transparentMaterial = new StandardMaterial("transparent", this.scene);
            transparentMaterial.alpha = 0;
            physicsTopLink.material = transparentMaterial;
            physicsTopLink.position.copyFrom(initialPosition);

            physicsTopLink.physicsImpostor = new PhysicsImpostor(physicsTopLink, PhysicsImpostor.NoImpostor, {
                mass: 0,
                restitution: 0,
                friction: 0
            }, scene);

            if (IS_DEBUG_MODE && (this.scene != null)) {
                const gizmo = new GizmoManager(this.scene);
                gizmo.positionGizmoEnabled = true;
                gizmo.attachToMesh(physicsTopLink);
                gizmo.usePointerToAttachGizmos = false;
            }

            const ropeLeftReference = this.scene?.getTransformNodeByName("RopeLeft");
            if (ropeLeftReference != null) {
                ropeLeftReference.computeWorldMatrix(true);
                const ropeLeftPosition = ropeLeftReference.getAbsolutePosition();
                const ropeLeft = this.createRope(ropeLeftPosition.x, -0.05, ropeLeftPosition.z, initialPosition, undefined, ropeLeftPosition.y);
                ropeLeft.material = leatherMaterial;
                // this.shadowGenerator?.getShadowMap()?.renderList?.push(ropeLeft);
                (ropeLeft.physicsImpostor as PhysicsImpostor).addHook(physicsTopLink.physicsImpostor, 0, 1, true);
                (ropeLeft.physicsImpostor as PhysicsImpostor).addHook(physicsRoot.physicsImpostor as PhysicsImpostor, 1, 1, true);
            }

            const ropeRightReference = this.scene?.getTransformNodeByName("RopeRight");
            if (ropeRightReference != null) {
                ropeRightReference.computeWorldMatrix(true);
                const ropeRightPosition = ropeRightReference.getAbsolutePosition();
                const ropeRight = this.createRope(ropeRightPosition.x, 0.05, ropeRightPosition.z, initialPosition, undefined, ropeRightPosition.y);
                ropeRight.material = leatherMaterial;
                this.shadowGenerator?.getShadowMap()?.renderList?.push(ropeRight);
                (ropeRight.physicsImpostor as PhysicsImpostor).addHook(physicsTopLink.physicsImpostor, 0, 1, true);
                (ropeRight.physicsImpostor as PhysicsImpostor).addHook(physicsRoot.physicsImpostor as PhysicsImpostor, 1, 1, true);
            }

            const ropeTop = this.createTopStaticRope();
            ropeTop.position.copyFrom(initialPosition);
            ropeTop.material = leatherMaterial;
            this.shadowGenerator?.getShadowMap()?.renderList?.push(ropeTop);
            ropeTop.setParent(physicsTopLink);

            this.scene?.getMeshByName("sultan_primitive0")?.setEnabled(false);
            this.scene?.getMeshByName("sultan_primitive1")?.setEnabled(false);
            this.scene?.getTransformNodeById("Armature.001")?.setEnabled(false);

            // this.createSultan();
            const bagMesh = this.scene?.getMeshByName("Bag");
            if (bagMesh != null) {
                this.shadowGenerator?.getShadowMap()?.renderList?.push(bagMesh);
            }
            this.physicsTopLink = physicsTopLink;
        }
    }

    createTopStaticRope = () => {
        const { scene } = this;
        const myPoints = [];
        const startY = 0;
        const xOffset = 0.05;
        const circleRadius = 0.05;
        for (let x = -xOffset; x <= xOffset; x += 0.002) {
            const y = Math.sqrt(Math.pow(circleRadius, 2) - Math.pow(x, 2));
            myPoints.push(new Vector3(x, y, 0));
        }
        myPoints.push(new Vector3(xOffset, startY, 0));
        const myShape = [];
        const radius = 0.003;
        for (let i = 0; i < 2 * Math.PI + 0.01; i += Math.PI / 8) {
            myShape.push(new Vector3(Math.cos(i), Math.sin(i) * 0.3, 0).scale(radius));
        }

        return MeshBuilder.ExtrudeShape("ext", { shape: myShape, path: myPoints }, scene);
    };

    createRope (xOffset = 0, topXOffset = 0, zOffset = 0, deltaOffset: Vector3 = new Vector3(0, 0, 0), startY = 0.001, finalY = -0.36, damping = 0.07) {
        const { scene } = this;
        const nbPoints = 10;
        const myPoints = [];
        for (let i = 0; i < nbPoints; i++) {
            myPoints.push((new Vector3(topXOffset, startY, 0)).addInPlace(deltaOffset), (new Vector3(xOffset, Math.abs(finalY - startY) / -nbPoints * (i + 1), zOffset)));
        }
        const myShape = [];
        const radius = 0.003;
        for (let i = 0; i < 2 * Math.PI + 0.01; i += Math.PI / 8) {
            myShape.push(new Vector3(Math.cos(i), Math.sin(i) * 0.3, 0).scale(radius));
        }

        const rope = MeshBuilder.ExtrudeShape("ext", { shape: myShape, path: myPoints }, scene);

        rope.physicsImpostor = new PhysicsImpostor(rope, PhysicsImpostor.RopeImpostor, { mass: 0.1, shape: myShape, path: myPoints, damping }, scene);
        rope.physicsImpostor.velocityIterations = 10;
        rope.physicsImpostor.positionIterations = 10;
        rope.physicsImpostor.stiffness = 1;

        return rope;
    }

    makePhysicsObject = (childMeshes: AbstractMesh[], scaling: number, initialPosition: Vector3) => {
        // Create physics root and position it to be the center of mass for the imported mesh
        const physicsRoot = new Mesh("physicsRoot", this.scene);

        // For all children labeled box (representing colliders), make them invisible and add them as a child of the root object
        childMeshes.forEach((m) => {
            if (m.name.includes("box")) {
                m.isVisible = false;
                m.position.y += 0.2;
                physicsRoot.addChild(m);
            } else {
                m.position.z -= 0.07;
            }
        });

        // Add all root nodes within the loaded gltf to the physics root
        childMeshes.forEach((m) => {
            if (m.parent == null) {
                physicsRoot.addChild(m);
            }
        });

        physicsRoot.position.copyFrom(initialPosition);
        physicsRoot.position.y -= 0.4;

        // Make every collider into a physics impostor
        physicsRoot.getChildMeshes().forEach((m) => {
            if (m.name.includes("box")) {
                m.scaling.x = Math.abs(m.scaling.x);
                m.scaling.y = Math.abs(m.scaling.y);
                m.scaling.z = Math.abs(m.scaling.z);
                m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 0.1 }, this.scene);
            }
        });

        // Scale the root object and turn it into a physics impostor
        physicsRoot.scaling.scaleInPlace(scaling);
        physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 5, friction: 0 }, this.scene);
        physicsRoot.physicsImpostor.physicsBody.setCollisionFlags(0);
        physicsRoot.physicsImpostor.physicsBody.setRollingFriction(0.4);

        return physicsRoot;
    };

    async update (result: PoseResult, stream: HTMLCanvasElement): Promise<void> {
        await super.update(result, stream);

        if ((this.physicsTopLink != null) && this.started && (this.shoulderPositionSphere != null) && (this.hipsBoneObject != null)) {
            this.lerpStore.shoulderPosition = this.shoulderPositionSphere.getAbsolutePosition().clone();
            // this.lerpStore.shoulderPosition.y -= 0.02;
            const angles = this.hipsBoneObject.absoluteRotationQuaternion.toEulerAngles();
            this.lerpStore.shoulderRotation = Quaternion.FromEulerAngles(0, angles.y - 5 * Math.PI / 12, 0);
            if (!IS_DEBUG_MODE) {
                this.physicsTopLink.position = Vector3.Lerp(this.physicsTopLink.position, this.lerpStore.shoulderPosition, 0.5);
                this.physicsTopLink.rotationQuaternion = Quaternion.Slerp(this.physicsTopLink.rotationQuaternion ?? Quaternion.Identity(), this.lerpStore.shoulderRotation, 0.5);
            }
        }
        if (this.hipsImpostorObject != null) {
            this.lerpStore.hipsPosition = this.hipsImpostorObject.getAbsolutePosition().clone();
            this.lerpStore.hipsRotation = this.hipsImpostorObject.absoluteRotationQuaternion;
        }
    }

    updateBagPosition () {
        if (this.physicsTopLink != null && (this.scene != null)) {
            // const deltaSeconds = this.scene.getEngine().getDeltaTime() / 1000;
            // this.physicsTopLink.position = Vector3.Lerp(this.physicsTopLink.position, this.lerpStore.shoulderPosition, Math.min(deltaSeconds * 30, MIN_LERP_ALPHA));
            // this.physicsTopLink.rotationQuaternion = Quaternion.Slerp(this.physicsTopLink.rotationQuaternion ?? Quaternion.Identity(), this.lerpStore.shoulderRotation, Math.min(deltaSeconds * 30, MIN_LERP_ALPHA));
            if (!IS_DEBUG_MODE) {
                this.physicsTopLink.position = Vector3.Lerp(this.physicsTopLink.position, this.lerpStore.shoulderPosition, 0.1);
                this.physicsTopLink.rotationQuaternion = Quaternion.Slerp(this.physicsTopLink.rotationQuaternion ?? Quaternion.Identity(), this.lerpStore.shoulderRotation, 0.1);
            }
        }
        TWEEN.update();
    }
}
