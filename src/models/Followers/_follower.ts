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

    protected constructor(classCode: string, name: string, uniqueId: string, type: string) {
        this.classCode = classCode;
        this.name = name;
        this.uniqueId = uniqueId;
        this.type = type;
        this.tasks = [];
        this.locked = false;
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
