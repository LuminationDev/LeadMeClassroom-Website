export default abstract class Follower {
    classCode: string;
    name: string;
    uniqueId: string;
    type: string;

    protected constructor(classCode: string, name: string, uniqueId: string, type: string) {
        this.classCode = classCode;
        this.name = name;
        this.uniqueId = uniqueId;
        this.type = type;
    }

    abstract get activeTaskIconUrl(): string | null

    abstract get activeTaskName(): string | null

    getClassCode = () => {
        return this.classCode;
    }

    getUniqueId = () => {
        return this.uniqueId;
    }
}
