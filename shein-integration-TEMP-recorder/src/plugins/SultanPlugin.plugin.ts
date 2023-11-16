import { type AbstractMesh, Mesh, type Nullable, PhysicsImpostor, Vector3 } from "@babylonjs/core";
import { BagPlugin } from "./BagPlugin.plugin";

export class BagWithSultanPlugin extends BagPlugin {
    createSultan () {
        const { scene } = this;
        if (scene != null) {
            const sultanArmature = this.scene?.getTransformNodeById("Armature.001");
            const sultanLink = Mesh.CreateSphere("sultanSphere", 16, 0.02, scene);

            const sultanStart = this.scene?.getTransformNodeByName("sultanstart") as Mesh;
            const sultanPosition = new Vector3();
            sultanStart.computeWorldMatrix(true).decompose(undefined, undefined, sultanPosition);
            sultanLink.position = sultanPosition;
            sultanLink.setEnabled(false);
            sultanLink.physicsImpostor = new PhysicsImpostor(sultanLink, PhysicsImpostor.NoImpostor, { mass: 0 }, scene);

            const hitboxSultan = this.scene?.getMeshByName("sultancontainer");
            const hitboxSultanPosition = new Vector3();
            hitboxSultan?.computeWorldMatrix(true).decompose(undefined, undefined, hitboxSultanPosition);

            if (sultanArmature != null) {
                const sultanPhysicsRoot = this.makeSultanPhysics([...sultanArmature.getChildMeshes(), this.scene?.getMeshByName("sultan_primitive0"), this.scene?.getMeshByName("sultan_primitive1")], hitboxSultanPosition.clone());
                (sultanPhysicsRoot.physicsImpostor as PhysicsImpostor).physicsBody.setCollisionFlags(0);

                const initialPosition = sultanLink.getAbsolutePosition().clone();
                const rope = this.createRope(-0.03, 0, -0.003, initialPosition, 0, -0.053);
                const leatherMaterial = this.importLeatherMaterial();
                rope.material = leatherMaterial;
                (rope.physicsImpostor as PhysicsImpostor).addHook(sultanLink.physicsImpostor, 0, 1, true);
                (rope.physicsImpostor as PhysicsImpostor).addHook(sultanPhysicsRoot.physicsImpostor as PhysicsImpostor, 1, 1, true);

                this.scene?.onBeforeRenderObservable.add(() => {
                    sultanStart?.getWorldMatrix().decompose(undefined, undefined, sultanPosition);
                    sultanLink.position = sultanPosition;
                });

                const sultanSpeedReductionPerSecond = 0.05;
                // const delta = 8.5 / 1000;
                const physicsRootImpostor = sultanPhysicsRoot.physicsImpostor as PhysicsImpostor;
                scene.onBeforeRenderObservable.add(() => {
                    const delta = scene.getEngine().getDeltaTime() / 1000;
                    let v = physicsRootImpostor.getLinearVelocity() ?? new Vector3();
                    physicsRootImpostor.setLinearVelocity(v.scale(Math.pow(sultanSpeedReductionPerSecond, delta)));
                    v = physicsRootImpostor.getAngularVelocity() ?? new Vector3();
                    physicsRootImpostor.setAngularVelocity(v.scale(Math.pow(sultanSpeedReductionPerSecond, delta)));
                });
            }
        }
    }

    makeSultanPhysics = (newMeshes: Array<Nullable<AbstractMesh> | undefined>, position: Vector3) => {
        const physicsRoot = new Mesh("sultanPhysicsRoot", this.scene);
        const yOffset = 0.2;

        physicsRoot.position = position;
        physicsRoot.position.x -= 0.01;
        // physicsRoot.position.y += 0.015;

        // For all children labeled box (representing colliders), make them invisible and add them as a child of the root object
        newMeshes.forEach((m, i) => {
            if (m?.name.includes("sultancontainer")) {
                m.position.y += yOffset;
                m.isVisible = false;
                physicsRoot.addChild(m);
            }
        });

        // Add all root nodes within the loaded gltf to the physics root
        newMeshes.forEach((m, i) => {
            if (m?.parent == null) {
                physicsRoot.addChild(m as AbstractMesh);
            }
            if (m?.name === "sultan_primitive1" || m?.name === "sultan_primitive0") {
                // m.position.y -= yOffset;
                physicsRoot.addChild(m);
            }
        });

        // Make every collider into a physics impostor
        physicsRoot.getChildMeshes().forEach((m) => {
            if (m.name.includes("sultancontainer")) {
                m.scaling.x = Math.abs(m.scaling.x);
                m.scaling.y = Math.abs(m.scaling.y);
                m.scaling.z = Math.abs(m.scaling.z);
                m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 0.01 }, this.scene);
            }
        });

        // Scale the root object and turn it into a physics impsotor
        // physicsRoot.scaling.scaleInPlace(scaling);
        physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 0.02 }, this.scene);
        physicsRoot.physicsImpostor.physicsBody.setCollisionFlags(0);

        return physicsRoot;
    };
}
