import {
    type AbstractMesh,
    PointerDragBehavior,
    type TransformNode,
    Vector3,
    type Scene,
    MeshBuilder,
    Angle,
    Ray, Space, type Mesh
} from "@babylonjs/core";

const MIN_PICKED_DISTANCE = 0.1;

export const addDragBehaviour = (mesh: AbstractMesh, localStorageKey: string) => {
    const pointerDragBehavior = new PointerDragBehavior({ dragAxis: new Vector3(1, 0, 0.3) });
    const pointerDragBehavior2 = new PointerDragBehavior({ dragAxis: new Vector3(0, 1, 0) });
    pointerDragBehavior.onDragStartObservable.add(() => {
        window.dispatchEvent(new Event("capture-block"));
    });
    pointerDragBehavior.onDragEndObservable.add(() => {
        window.dispatchEvent(new Event("capture-unblock"));
        const delta = mesh.position;
        localStorage.setItem(localStorageKey, JSON.stringify({ x: delta.x, y: delta.y, z: delta.z }));
    });
    pointerDragBehavior2.onDragStartObservable.add(() => {
        window.dispatchEvent(new Event("capture-block"));
    });
    pointerDragBehavior2.onDragEndObservable.add(() => {
        window.dispatchEvent(new Event("capture-unblock"));
        const delta = mesh.position;
        localStorage.setItem(localStorageKey, JSON.stringify({ x: delta.x, y: delta.y, z: delta.z }));
    });
    mesh.addBehavior(pointerDragBehavior);
    mesh.addBehavior(pointerDragBehavior2);
};

export const addClipsDragBehaviour = (sphere: AbstractMesh, model: TransformNode, localStorageKey: string, scene: Scene, modelDragParams: Record<string, number>) => {
    let isDragged = false;
    const pointerDragBehavior = new PointerDragBehavior({ dragAxis: new Vector3(1, 0, 0.3) });
    const pointerDragBehavior2 = new PointerDragBehavior({ dragAxis: new Vector3(0, 1, 0) });
    const occluder = scene.getMeshByName("HeadOccluder");
    const center = occluder?.position.clone() ?? new Vector3(0, 0, 0);
    const cylinder = MeshBuilder.CreateCylinder("cylinder", { height: 0.1, diameter: 0.025 }, scene);
    const shadowMesh = scene.getMeshByName("shadows");

    if (shadowMesh != null) {
        shadowMesh.setParent(model);
    }

    cylinder.isVisible = false;
    cylinder.setParent(model.parent);
    model.setParent(cylinder);

    const setCylinderPosition = () => {
        cylinder.position = sphere.position.clone();
        cylinder.position.z = 0;
        sphere.position.z = 0;
        if (cylinder.position.x < 0 && cylinder.scaling.x > 0) {
            cylinder.scaling.x *= -1;
        } else if (cylinder.position.x > 0 && cylinder.scaling.x < 0) {
            cylinder.scaling.x *= -1;
        }
        cylinder.lookAt(center);
    };

    const setPositionFromRay = (pickedPoint: Vector3) => {
        const newPoint = pickedPoint;
        sphere.setAbsolutePosition(newPoint);
        cylinder.setAbsolutePosition(newPoint);
    };

    setCylinderPosition();
    setModelParamsForDrag(model, modelDragParams);

    pointerDragBehavior.onDragStartObservable.add(() => {
        window.dispatchEvent(new Event("capture-block"));
    });

    pointerDragBehavior.onDragObservable.add(() => {
        isDragged = true;
        setCylinderPosition();
    });

    const onDragEndObservable = () => {
        window.dispatchEvent(new Event("capture-unblock"));

        if (!isDragged) {
            return;
        }

        let pickingInfo = rayByForward(scene, cylinder, new Vector3(0, 0, 1));
        if ((pickingInfo == null) || pickingInfo?.pickedPoint === null) {
            return;
        }
        if (pickingInfo.distance < MIN_PICKED_DISTANCE) {
            setPositionFromRay(pickingInfo.pickedPoint);
        } else {
            pickingInfo = rayByForward(scene, cylinder, new Vector3(0, 0, -1));
            if (pickingInfo?.pickedPoint != null && pickingInfo.distance < MIN_PICKED_DISTANCE) {
                setPositionFromRay(pickingInfo.pickedPoint);
            }
        }

        cylinder.lookAt(center, 0, 0, 0, Space.LOCAL);
        isDragged = false;
        const delta = sphere.position;
        localStorage.setItem(localStorageKey, JSON.stringify({ x: delta.x, y: delta.y, z: delta.z }));
    };
    pointerDragBehavior.onDragEndObservable.add(() => {
        onDragEndObservable();
    });

    sphere.addBehavior(pointerDragBehavior);
    sphere.addBehavior(pointerDragBehavior2);
};

function setModelParamsForDrag (model: TransformNode, config: Record<string, number>) {
    model.scaling.x *= config?.scaling_x ?? 1;
    model.scaling.y *= config?.scaling_y ?? 1;
    model.scaling.z *= config?.scaling_z ?? 1;
    model.position = new Vector3(config?.position_x ?? 0, 0, config?.position_z ?? -0.008);
    model.rotation = new Vector3(Angle.FromDegrees(config?.rotation_x ?? 0).radians(), Angle.FromDegrees(config?.rotation_y ?? 0).radians(), 0);
}

function vecToLocal (vector: Vector3, sphere: Mesh) {
    const m = sphere.getWorldMatrix();
    const v = Vector3.TransformCoordinates(vector, m);
    return v;
}

function rayByForward (scene: Scene, mesh: Mesh, _forward: Vector3) {
    const origin = mesh.absolutePosition;
    const forward = vecToLocal(_forward, mesh);

    let direction = forward.subtract(origin);
    direction = Vector3.Normalize(direction);
    const ray = new Ray(origin, direction, 1);

    const hit = scene.pickWithRay(ray, (_mesh) => {
        if (_mesh.name === "HeadOccluder") {
            return true;
        }
        return false;
    }, false);
    return hit;
};
