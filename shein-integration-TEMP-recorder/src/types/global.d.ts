import { type Recorder, type Snapshoter } from "@geenee/armature";

// Extend the global Window interface
declare global {
    interface Window {
        snapshoter: Snapshoter
        recorder: Recorder
    }
}
