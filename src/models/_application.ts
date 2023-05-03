class Application {
    id: string;
    name: string;
    packageName: string;
    lastActivated?: number;
    muted: boolean = false;
    muting: boolean = false;
    audible: boolean = false;

    constructor(id: string, name: string, packageName: string, lastActivated: number = Date.now()) {
        this.id = id;
        this.name = name;
        this.packageName = packageName;
        this.lastActivated = lastActivated
    }

    getIcon = () => {
        return "";
    }

    getName = () => {
        return this.name;
    }

    getPackageName = () => {
        return this.packageName;
    }
}

export default Application;