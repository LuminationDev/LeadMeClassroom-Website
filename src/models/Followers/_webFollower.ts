import type { Tab } from "../index";
import { v4 as uuidv4 } from 'uuid';
import Follower from "@/models/Followers/_follower";
import * as REQUESTS from "@/constants/_requests";

/**
 * A class to describe the outline of a follower that is being attached
 * to the firebase leader.
 */
class WebFollower extends Follower {
    tabs: Tab[];
    webRTC: any;
    UUID: any;
    imageBase64: string|null|undefined;
    collectingScreenshotFailed: boolean|null|undefined;
    monitoring: boolean|null|undefined;
    permission: string|null|undefined;
    muteAll: boolean|null|undefined;
    offTask: boolean|null|undefined;

    constructor(classCode = "", name = "", uniqueId = uuidv4()) {
        super(classCode, name, uniqueId, REQUESTS.WEB)
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

    get activeTaskIconUrl(): string|null {
        if(!this.tabs) {
            return null
        }

        if(this.tabs.length === 0) {
            return null
        }

        return this.tabs[0].getFavicon()
    }

    get activeTaskName(): string|null  {
        if(!this.tabs) {
            return 'No tabs open...'
        }

        if(this.tabs.length === 0) {
            return 'No tabs open...'
        }

        return this.tabs[0].name
    }
}

export default WebFollower;
