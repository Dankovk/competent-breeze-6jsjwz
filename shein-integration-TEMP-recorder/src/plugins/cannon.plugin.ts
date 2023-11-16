import {
    type AbstractMesh,
    CannonJSPlugin,
    Mesh, MeshBuilder,
    PhysicsImpostor,
    PhysicsJoint,
    Quaternion,
    type Scene, StandardMaterial,
    Vector3
} from "@babylonjs/core";
import * as CANNON from "../../node_modules/cannon/build/cannon.js";
import { AbstractPhysicsPlugin } from "@/types/physics-plugin";

export class CannonPhysics extends AbstractPhysicsPlugin {
    readonly plugin: CannonJSPlugin;
    scene: Scene;

    constructor () {
        super();
        this.plugin = new CannonJSPlugin(true, 10, CANNON);
    }

    async setup (): Promise<void> {
        // Cannon-specific setup logic
    }

    addPhysicsTransform (physicsPivot: Mesh, referencePositionSphere: Mesh) {
        const angles = referencePositionSphere.absoluteRotationQuaternion.toEulerAngles();
        physicsPivot.position = referencePositionSphere.getAbsolutePosition();
        physicsPivot.rotationQuaternion = Quaternion.FromEulerAngles(angles.x, angles.y, angles.z);
    }

    updatePhysicsPivotPosition (physicsPivot: Mesh, referencePositionSphere: Mesh) {
        physicsPivot.position = referencePositionSphere.getAbsolutePosition();
        physicsPivot.rotationQuaternion = referencePositionSphere.absoluteRotationQuaternion;
    }

    createBodyImpostors () {
        if (!this.scene) {
            return;
        }
        const hipsImpostor = MeshBuilder.CreateBox("bodyimpostorCylinder", { height: 1.5, width: 0.27, depth: 0.5 });
        hipsImpostor.material = new StandardMaterial("transparent_body_impostor", this.scene);
        hipsImpostor.material.alpha = 0;
        const hips = this.scene.getTransformNodeByName("Hips");
        if (hips != null) {
            this.scene.onBeforeRenderObservable.add(() => {
                hipsImpostor.position = hips.getAbsolutePosition();
                hipsImpostor.rotationQuaternion = hips.absoluteRotationQuaternion;
            });
        }
        hipsImpostor.physicsImpostor = new PhysicsImpostor(hipsImpostor, PhysicsImpostor.BoxImpostor, {
            mass: 0,
            friction: 0
        }, this.scene);
    }

    addPhysicsToMesh (mesh: AbstractMesh, physicsTopLink: Mesh, initialPosition: Vector3, options: any, zOffset = 0): Mesh {
        if (this.scene == null) return;
        this.createBodyImpostors();

        physicsTopLink.physicsImpostor = new PhysicsImpostor(physicsTopLink, PhysicsImpostor.NoImpostor, {
            mass: 0,
            restitution: 0,
            friction: 0
        }, this.scene);

        const physicsRoot = new Mesh("physicsRoot", this.scene);
        const impostor = this.scene.getMeshByName("impostor");

        if (impostor != null) {
            impostor.isVisible = false;
        }

        mesh.getChildMeshes().forEach((m) => {
            m.visibility = 0;

            if (m.name.includes("impostor")) {
                physicsRoot.addChild(m);
                m.scaling.x = Math.abs(m.scaling.x);
                m.scaling.y = Math.abs(m.scaling.y);
                m.scaling.z = Math.abs(m.scaling.z);
                m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 0.1 }, this.scene);
            } else {
                physicsRoot.addChild(m);
            }
            m.position.z -= zOffset;
        });

        physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 0.1 }, this.scene);
        physicsRoot.physicsImpostor.physicsBody.linearDamping = 0.9;
        physicsRoot.physicsImpostor.physicsBody.angularDamping = 0.9;

        const joint1 = new PhysicsJoint(PhysicsJoint.HingeJoint, {
            mainPivot: new Vector3(0, 0, 0),
            connectedPivot: new Vector3(0, 0.02, 0),
            mainAxis: new Vector3(0, 0, 1),
            connectedAxis: new Vector3(0, 0, 1)
        });

        physicsTopLink.physicsImpostor.addJoint(physicsRoot.physicsImpostor, joint1);

        physicsTopLink.position = initialPosition.clone();
        physicsRoot.position = initialPosition.clone();

        this.scene.physicsEnabled = true;

        return physicsTopLink;
    }

    addPhysicsToEarringsMesh (mesh: AbstractMesh, physicsTopLink: Mesh, initialPosition: Vector3): Mesh {
        if (this.scene == null) { return; }
        physicsTopLink.position.copyFrom(initialPosition);

        physicsTopLink.physicsImpostor = new PhysicsImpostor(physicsTopLink, PhysicsImpostor.NoImpostor, {
            mass: 0,
            restitution: 0,
            friction: 0
        }, this.scene);

        const physicsRoot = new Mesh("physicsRoot", this.scene);

        const childMeshes = mesh.getChildMeshes();
        childMeshes.forEach((m) => {
            if (m.name.includes("box")) {
                m.isVisible = false;
                physicsRoot.addChild(m);
            } else {
                physicsRoot.addChild(m);
            }
        });

        physicsRoot.position.copyFrom(initialPosition);

        // Make every collider into a physics impostor
        physicsRoot.getChildMeshes().forEach((m) => {
            if (m.name.includes("box")) {
                m.scaling.x = Math.abs(m.scaling.x);
                m.scaling.y = Math.abs(m.scaling.y);
                m.scaling.z = Math.abs(m.scaling.z);
                m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 0.1 }, this.scene);
            }
        });

        physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 1 }, this.scene);

        physicsRoot.physicsImpostor.physicsBody.linearDamping = 0.6;
        physicsRoot.physicsImpostor.physicsBody.angularDamping = 0.6;

        const isLeft = mesh.name.includes("L");

        const rotationAxisA = 1;
        const joint1 = new PhysicsJoint(PhysicsJoint.HingeJoint, {
            mainPivot: new Vector3(0, 0, 0),
            connectedPivot: new Vector3(0, 0.034, 0),
            mainAxis: new Vector3(isLeft ? rotationAxisA : -rotationAxisA, 0, 1),
            connectedAxis: new Vector3(0, 0, 1)
        });

        physicsTopLink.physicsImpostor.addJoint(physicsRoot.physicsImpostor, joint1);
        return physicsTopLink;
    }
}
