import type { Follower, Tab } from "../index";
import { v4 as uuidv4 } from 'uuid';

/**
 * A class to describe the outline of a follower that is being attached
 * to the firebase leader.
 */
class WebFollower implements Follower {
    classCode: string;
    name: string;
    uniqueId: string;
    tabs: Tab[];
    webRTC: any;
    UUID: any;
    imageBase64: string|null|undefined;
    collectingScreenshotFailed: boolean|null|undefined;
    monitoring: boolean|null|undefined;
    permission: string|null|undefined;
    muted: boolean|null|undefined;
    muteAll: boolean|null|undefined;
    offTask: boolean|null|undefined;
    disconnected: boolean = false;

    constructor(classCode = "", name = "", uniqueId = uuidv4()) {
        this.classCode = classCode;
        this.uniqueId = uniqueId;
        this.name = name;
        this.tabs = [];
        this.permission = null;
    }

    updateIndividualTab(id: string, newTab: Tab)
    {
        const index = this.tabs.findIndex(tab => (tab.id + "") === id)
        if (index !== -1) {
            const obj = <Tab>this.tabs[index];
            Object.keys(obj).forEach(key => {
                // @ts-ignore
                obj[key] = newTab[key];
            });
        } else {
            this.tabs.push(newTab)
        }
    }

    removeTab(id: string)
    {
        const index = this.tabs.findIndex(tab => (tab.id + "") === id)
        if (index !== -1) {
            this.tabs.splice(index, 1)
        }
    }

    getClassCode = () => {
        return this.classCode;
    }

    getUniqueId = () => {
        return this.uniqueId;
    }
}

export default WebFollower;
