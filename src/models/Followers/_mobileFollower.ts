import type { Follower, Task } from "../index";
import { Application, Video } from "../index";
import { v4 as uuidv4 } from 'uuid';
import * as REQUESTS from "../../constants/_requests";
import { ref } from "vue";
import type {Ref, UnwrapRef} from "vue";

/**
 * A class to describe the outline of a follower that is being attached
 * to the firebase leader.
 */
class MobileFollower implements Follower {
    classCode: string;
    name: string;
    uniqueId: string;
    action: string = "none";
    source: string = "none";
    currentApplication: Ref<UnwrapRef<string>> = ref(REQUESTS.MOBILE_PACKAGE);
    applications: Application[];
    videos: Video[];
    webRTC: any;
    UUID: any;
    tasks: Task[];
    permission: string|null|undefined;
    muted: boolean|null|undefined;
    audible: boolean|null|undefined;
    disconnected: boolean = false;
    offTask: boolean|null|undefined;

    constructor(classCode = "", name = "", apps: any, videos: any, uniqueId = uuidv4()) {
        this.classCode = classCode;
        this.uniqueId = uniqueId;
        this.name = name;
        this.applications = this.followerApplicationsAdded(apps);
        this.videos = this.followerVideosAdded(videos);
        this.permission = null;
        this.tasks = [];
    }

    followerApplicationsAdded(response: any) {
        const applications: Array<Application> = []

        //Bail out early if nothing has been recorded
        if(response === null || response === undefined) return applications;

        Object.values(response).forEach((application: any) => {
            if(application.name === undefined && application.packageName === undefined) { return; }
            const newApp = new Application(application.packageName, application.name, application.packageName)
            applications.push(newApp)
        })

        return applications;
    }

    followerVideosAdded(response: any) {
        const videos: Array<Video> = []

        //Bail out early if nothing has been recorded
        if(response === null || response === undefined) return videos;

        Object.values(response).forEach((video: any) => {
            if(video.name === undefined && video.duration === undefined) { return; }
            const newApp = new Video(video.name, video.name, video.duration)
            videos.push(newApp)
        })

        return videos;
    }

    setCurrentApplication = (currentApplication: string) => {
        this.currentApplication.value = currentApplication;
        const app = this.applications.find(res => res.id === currentApplication);
        if(app === undefined) return; //TODO they may be on the home page?

        this.applications.unshift(this.applications.splice(this.applications.indexOf(app), 1)[0]);
    }

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

export default MobileFollower;