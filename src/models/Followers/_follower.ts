import type { Task } from "@/models";

export default abstract class Follower {
    classCode: string;
    name: string;
    uniqueId: string;
    type: string;
    tasks: Task[];
    locked: boolean;
    disconnected: boolean = false;
    muted: boolean|null|undefined;
    monitoring: boolean|null|undefined;
    permission: string|null|undefined;
    imageBase64: string|null|undefined;
    collectingScreenshotFailed: boolean|null|undefined;

    protected constructor(classCode: string, name: string, uniqueId: string, type: string, locked: boolean = false, muted: boolean = false, tasks: Task[] = []) {
        this.classCode = classCode;
        this.name = name;
        this.uniqueId = uniqueId;
        this.type = type;
        this.tasks = [];
        this.locked = locked;
        this.muted = muted;
        this.tasks = tasks;
        this.permission = null;
        this.monitoring = null;
    }

    abstract get activeTaskIconUrl(): string | null

    abstract get activeTaskName(): string | null

    getClassCode = () => {
        return this.classCode;
    }

    getUniqueId = () => {
        return this.uniqueId;
    }

    clearTasks = () => {
        this.tasks = [];
    }
}
