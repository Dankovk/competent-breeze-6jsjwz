import type Havok from "@babylonjs/havok";
import {
    type Scene,
    Vector3,
    HavokPlugin,
    type Mesh,
    type AbstractMesh,
    PhysicsAggregate,
    PhysicsShapeType,
    PhysicsMotionType,
    Physics6DoFConstraint,
    PhysicsConstraintAxis,
    Quaternion
} from "@babylonjs/core";
import { AbstractPhysicsPlugin } from "@/types/physics-plugin";

function lerp (start: number, stop: number, amount: number) {
    return start * (1 - amount) + stop * amount;
}

export class HavokPhysics extends AbstractPhysicsPlugin {
    readonly plugin: HavokPlugin;
    scene: Scene;

    constructor (private readonly hk: Havok) {
        super();
        this.plugin = new HavokPlugin(true, hk);
    }

    async setup (): Promise<void> {
        // Havok-specific setup logic
    }

    addPhysicsTransform (physicsPivot: Mesh, referencePositionSphere: Mesh) {
        const LERP_AMOUNT = 0.3;
        const bodyId = physicsPivot?.physicsBody?._pluginData.hpBodyId;

        if (physicsPivot != null && (referencePositionSphere != null)) {
            const pos = referencePositionSphere.getAbsolutePosition();
            const smooth = Vector3.Lerp(physicsPivot.position, pos.clone(), LERP_AMOUNT);
            const position = [smooth.x, smooth.y, smooth.z];
            const angles = referencePositionSphere.absoluteRotationQuaternion.toEulerAngles();
            const quaternion = Quaternion.FromEulerAngles(angles.x, angles.y, angles.z);
            const smoothQ = Quaternion.Slerp(physicsPivot.rotationQuaternion ?? Quaternion.Identity(), quaternion, LERP_AMOUNT);
            this.plugin._hknp.HP_Body_SetQTransform(bodyId, [position, [smoothQ.x, smoothQ.y, smoothQ.z, smoothQ.w]]);
        }
    }

    updatePhysicsPivotPosition (physicsPivot: Mesh, referencePositionSphere: AbstractMesh) {
        // const bodyId = physicsPivot?.physicsBody?._pluginData.hpBodyId;

        const pos = referencePositionSphere.getAbsolutePosition();
        const angles = referencePositionSphere.absoluteRotationQuaternion.toEulerAngles();
        const quat = Quaternion.FromEulerAngles(angles.x, angles.y, angles.z);
        const smoothQ = Quaternion.Slerp(physicsPivot.rotationQuaternion ?? Quaternion.Identity(), quat, 0.5);

        const LERP = 0.4;

        const smoothPositionDeltaX = lerp(physicsPivot.position.x, pos.clone().x, LERP) - physicsPivot.position.x;
        const smoothPositionDeltaY = lerp(physicsPivot.position.y, pos.clone().y, LERP) - physicsPivot.position.y;
        const smoothPositionDeltaZ = lerp(physicsPivot.position.z, pos.clone().z, LERP) - physicsPivot.position.z;

        const invDt = 60;
        // @ts-ignore
        physicsPivot.physicsBody.setLinearVelocity(new Vector3(smoothPositionDeltaX * invDt, smoothPositionDeltaY * invDt, smoothPositionDeltaZ * invDt));
        physicsPivot.rotationQuaternion = smoothQ;
        // this.physicsCorePlugin._hknp.HP_Body_SetQTransform(bodyId, [position, [smoothQ.x, smoothQ.y, smoothQ.z, smoothQ.w]]);
    }

    addPhysicsToMesh (mesh: AbstractMesh, physicsTopLink: Mesh, initialPosition: Vector3, options = {
        damping: 20,
        mass: 1,
        friction: 1,
        restitution: 1,
        limits: {
            z: {
                minLimit: -Math.PI / 2, maxLimit: Math.PI / 2
            }
        },
        constraintOptions: {
            axisA: new Vector3(1, 0, 0.3)
        }
    }): Mesh {
        if (this.scene == null) return;

        const sphereAggregate = new PhysicsAggregate(physicsTopLink, PhysicsShapeType.SPHERE, {
            mass: 0,
            restitution: 0.75,
            friction: 1
        }, this.scene);
        physicsTopLink?.physicsBody?.setMotionType(PhysicsMotionType.STATIC);

        const impostor = this.scene.getMeshByName("impostor");

        if (impostor == null) {
            return;
        }

        const boxAggregate = new PhysicsAggregate(impostor, PhysicsShapeType.BOX, {
            mass: options.mass,
            restitution: options.restitution,
            friction: options.friction
        }, this.scene);
        boxAggregate.body.setAngularDamping(options.damping);
        impostor.setParent(null);
        impostor.isVisible = false;
        const box = impostor;
        mesh.getChildMeshes().forEach((m) => {
            m.visibility = 0; // show only when tracking is active

            if (!m.name.includes("impostor")) {
                impostor.addChild(m);
            }
        });
        const constraint = new Physics6DoFConstraint({
            pivotA: new Vector3(0, 0, 0),
            pivotB: new Vector3(0, 0, 0),
            ...options.constraintOptions
        }, [
            { axis: PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0 },
            { axis: PhysicsConstraintAxis.ANGULAR_X, minLimit: -Math.PI / 2, maxLimit: Math.PI / 2 },
            { axis: PhysicsConstraintAxis.ANGULAR_Z, ...options.limits.z },
            { axis: PhysicsConstraintAxis.ANGULAR_Y, minLimit: 0, maxLimit: 0 }
        ], this.scene);
        if ((physicsTopLink?.physicsBody) != null) {
            box?.physicsBody?.addConstraint(physicsTopLink?.physicsBody, constraint);
        }
        this.scene.physicsEnabled = true;
        // this.addDebugGizmo(physicsTopLink);
        return physicsTopLink;
    }

    addPhysicsToEarringsMesh (mesh: AbstractMesh, physicsTopLink: Mesh, initialPosition: Vector3): Mesh {
        if (this.scene == null) { return; }

        const sphereAggregate = new PhysicsAggregate(physicsTopLink, PhysicsShapeType.SPHERE, { mass: 0, restitution: 0.75, friction: 1 }, this.scene);
        physicsTopLink.physicsBody?.setMotionType(PhysicsMotionType.ANIMATED);
        // @ts-ignore
        physicsTopLink.physicsBody.disablePreStep = false;

        const childMeshes = mesh.getChildMeshes();
        const impostor = childMeshes.find(el => el.name.includes("box"));

        if (impostor == null) {
            throw new Error("Impostor is not found");
        }
        const boxAggregate = new PhysicsAggregate(impostor, PhysicsShapeType.BOX, { mass: 0.1 }, this.scene);
        const damping = 7;
        boxAggregate.body.setLinearDamping(damping);
        boxAggregate.body.setAngularDamping(damping);
        // this.physicsCorePlugin._hknp.HP_Body_SetGravityFactor(boxAggregate.body._pluginData.hpBodyId, 0.7);
        impostor.setParent(null);
        impostor.isVisible = false;

        childMeshes.forEach((m) => {
            if (!m.name.includes("box")) {
                impostor.addChild(m);
            }
        });

        const isLeft = mesh.name.includes("L");

        const EARRINGS_OCCLUDER_ANGLE_THRESHOLD = Math.PI / 10;

        const rotationAxisA = 1.2;
        const constraint = new Physics6DoFConstraint({
            pivotA: new Vector3(0, 0.033, 0),
            pivotB: new Vector3(0, 0, 0),
            axisA: new Vector3(1, 0, isLeft ? rotationAxisA : -rotationAxisA)
        }, [
            { axis: PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0 },
            { axis: PhysicsConstraintAxis.ANGULAR_X, minLimit: -Math.PI / 2, maxLimit: Math.PI / 2 },
            { axis: PhysicsConstraintAxis.ANGULAR_Z, minLimit: isLeft ? -Math.PI / 2 : -EARRINGS_OCCLUDER_ANGLE_THRESHOLD, maxLimit: isLeft ? EARRINGS_OCCLUDER_ANGLE_THRESHOLD : Math.PI / 2 },
            { axis: PhysicsConstraintAxis.ANGULAR_Y, minLimit: 0, maxLimit: 0 }
        ], this.scene);

        // const constraint2 = new BallAndSocketConstraint(new Vector3(0, 0.03, 0), new Vector3(0, 0, 0), undefined, undefined, this.scene);

        if ((physicsTopLink?.physicsBody) != null) {
            impostor?.physicsBody?.addConstraint(physicsTopLink?.physicsBody, constraint);
        }

        this.scene.physicsEnabled = true;
        return physicsTopLink;
    };
}
