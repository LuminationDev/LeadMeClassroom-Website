import { Application, Task, Video } from "../index";
import { v4 as uuidv4 } from 'uuid';
import * as REQUESTS from "../../constants/_requests";
import Follower from "@/models/Followers/_follower";
import { useClassroomStore } from "@/stores/classroomStore";

/**
 * A class to describe the outline of a follower that is being attached
 * to the firebase leader.
 */
class MobileFollower extends Follower {
    action: string = "none";
    source: string = "none";
    currentApplication: string = REQUESTS.MOBILE_PACKAGE;
    applications: Application[];
    videos: Video[];
    permission: string|null|undefined;
    audible: boolean|null|undefined;
    offTask: boolean|null|undefined;
    classroomPinia: any;

    constructor(classCode = "", name = "", apps: any, videos: any, locked: boolean = false, muted: boolean = false, tasks: Task[] = [], uniqueId = uuidv4()) {
        super(classCode, name, uniqueId, REQUESTS.MOBILE, locked, muted, tasks);
        this.applications = this.followerApplicationsAdded(apps);
        this.videos = this.followerVideosAdded(videos);
        this.permission = null;
        this.classroomPinia = useClassroomStore() // todo - I don't want this in here
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

    get activeTaskIconUrl(): string|null {
        return this.classroomPinia.firebase.getAppIcon(this.currentApplication)
    }

    get activeTaskName(): string|null {
        const app = this.applications.find(res => res.id === this.currentApplication);
        return app ? app.getName() : 'No active app...'
    }

    get activeApplication(): Application|undefined {
        return this.applications.find(res => res.id === this.currentApplication);
    }
}

export default MobileFollower;