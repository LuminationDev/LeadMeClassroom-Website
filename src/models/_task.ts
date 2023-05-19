import * as REQUESTS from "../constants/_requests";

class Task {
    private readonly name: string;
    private readonly packageName: string;
    private readonly type: string;

    constructor(name: string, packageName: string, type: string) {
        this.name = name;
        this.packageName = packageName;
        this.type = type
    }

    getName = () => {
        return this.name;
    }

    getPackageName = () => {
        return this.packageName;
    }

    getType = () => {
        return this.type;
    }

    toStringEntry = () => {
        return `${this.name}|${this.packageName}|${this.type}`;
    }

    /**
     * Based on this tasks type, create/return a request object that can be sent to firebase
     * to trigger this application.
     */
    toRequest() {
        switch (this.type) {
            case "Application":
                return { type: REQUESTS.FORCEACTIVEAPP, action: this.packageName };
            case "LINK":
            case "Website":
                return { type: REQUESTS.WEBSITE, action: this.packageName };
            case "YOUTUBE":
            case "Video":
                return { type: REQUESTS.FORCEACTIVEVIDEOLINK, action: this.packageName };
            default:
                console.log("Task is of unknown type");
                return null;
        }
    }
}

export default Task;