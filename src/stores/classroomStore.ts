import { defineStore } from "pinia";
import { useStorage } from "@/hooks/useStorage";
import * as REQUESTS from "../constants/_requests.js";
import Firebase from '../controller/_firebase';
import { Leader, MobileFollower, Tab, WebFollower } from '@/models';
import { useWebRTCStore } from "./webRTCStore";
import type { User } from "@firebase/auth";
import { getAuth, sendPasswordResetEmail } from "@firebase/auth";
import type { Application, Video, Follower, CuratedContentItem } from "@/models";
import { getCuratedContentData, toDataURL } from "@/controller/_dataRequests";
import { cloneDeep } from "lodash";

interface userDetails {
    name: string,
    marketing: boolean,
    email: string
}

const firebase = new Firebase();
const { getLocalStorage, setLocalStorage, removeLocalStorage } = useStorage();

/**
 * When the classroom is first loaded or if the page is refreshed check to see if there was
 * an active class set the necessary details.
 */
export const useClassroomStore = defineStore("classroom", {
    state: () => {
        return {
            view: "classroom",
            accountView: "main",
            firebase: firebase,
            classCode: "",
            leaderName: "",
            leaderEmail: "",
            marketing: <boolean>false,
            webFollowers: [] as WebFollower[],
            webTasks: [] as String[],
            mobileFollowers: [] as MobileFollower[],
            mobileTasks: [] as String[],
            webLink: "",
            leader: <Leader|null>null,
            webRTCPinia: useWebRTCStore(),
            user: <User|null>null,
            curatedContent: [] as CuratedContentItem[]
        }
    },

    actions: {
        async loadCuratedContent() {
            this.curatedContent = await getCuratedContentData()
        },

        async loadLeaderDetails() {
            const leaderDetails = <userDetails>await firebase.getDisplayDetails();
            this.leaderName = leaderDetails.name
            this.marketing = leaderDetails.marketing
            this.leaderEmail = leaderDetails.email
            this.leader = new Leader(this.leaderName)
        },

        async onLoad() {
            const currentClass = await getLocalStorage("CurrentClass") as string;
            this.classCode = currentClass ? currentClass : "";
        },
        /**
         * Change the current panel to the supplied one.
         */
        changeView(panel: string) {
            this.view = panel;
        },

        /**
         * Change the current account panel to the supplied one.
         */
        changeAccountView(panel: string) {
            this.accountView = panel;
        },

        /**
         * Generate a new class code for the current session, attaching the necessary listeners to
         * the firebase real-time database.
         */
        async generateSession() {
            //Remove the strange firebase bug from application storage
            localStorage.removeItem("firebase:previous_websocket_failure")

            console.log('generating')
            //Hold a temporary reference to be checked against saved/new codes
            const activeCode = this.leader?.getClassCode();

            //Calling before class code can be attached?
            this.firebase.connectAsLeader(<Leader>this.leader, () => { this.attachClassListeners(false )});
            await this.clearTasks();
            await setLocalStorage("CurrentClass", this.leader?.getClassCode());

            await new Promise(res => setTimeout(res, 200));
            this.classCode = this.leader?.getClassCode() ?? '';
        },

        /**
         * Using callback functions attach listeners to within the firebase real time database.
         * @param active A boolean representing if a class is already running when the screen loads.
         */
        async attachClassListeners(active: boolean) {
            //Do not attach listeners if there is not an active class on creation/load/reload
            if(this.classCode === "") { return; }

            //Override the auto generated code if there is a saved one
            this.leader?.setClassCode(this.classCode);

            //Set up the streaming connection
            this.webRTCPinia.setConnectionDetails(this.sendIceCandidates, this.classCode);

            this.firebase.followerListeners(
                this.classCode,
                this.followerResponse,
                this.updateActiveFollower,
                this.followerDisconnected,
                this.webFollowerAdded,
                this.mobileFollowerAdded,
                this.readIceCandidate
            );
            this.firebase.tabListeners(
                this.classCode,
                this.followerTabChanged,
                this.followerTabRemoved,
                this.followerTabsAdded
            );

            if(!active) { return; }

            this.firebase.reloadFollowers(this.classCode, this.followerResponse);
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////GENERIC FUNCTIONS////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Find a follower based on their unique ID and the type of follower.
         * @param UUID
         * @param followerType
         */
        findFollowerObject(UUID: string, followerType: string): WebFollower | MobileFollower | undefined {
            if (followerType === REQUESTS.WEB) {
                return this.webFollowers.find(element => element.getUniqueId() === UUID) as WebFollower;
            } else {
                // @ts-ignore
                return this.mobileFollowers.find(element => element.getUniqueId() === UUID) as MobileFollower;
            }
        },

        /**
         * Find a follower's index within the associated array.
         * @param UUID
         * @param followerType
         */
        findFollowerIndex(UUID: string, followerType: string): number {
            return followerType === REQUESTS.WEB
                ? this.webFollowers.findIndex(element => element.getUniqueId() === UUID)
                : this.mobileFollowers.findIndex(element => element.getUniqueId() === UUID);
        },

        /**
         * Update a variable within a follower's data model with the supplied
         * data.
         * @param UUID
         * @param type
         * @param key
         * @param value
         */
        updateFollowerData(UUID: string, type: string, key: string, value: any) {
            const followerToUpdate = this.findFollowerObject(UUID, type);
            if (followerToUpdate) {
                // @ts-ignore
                followerToUpdate[key as keyof typeof followerToUpdate] = value;
            }
        },

        /**
         * Rename a selected follower
         * @param newName
         * @param UUID
         * @param followerType
         */
        async renameFollower(newName: string, UUID: string, followerType: string) {
            await this.firebase.updateFollower(this.classCode, UUID, {name: newName}, followerType);
        },

        /**
         * Send an action to all connected students.
         * @param action
         * @param followerType
         */
        requestAction(action: object, followerType: string) {
            void this.firebase.requestAction(this.classCode, action, followerType);
        },

        /**
         * Send an action to an individual student.
         * @param UUID
         * @param action
         * @param followerType
         */
        requestIndividualAction(UUID: string, action: object, followerType: string) {
            void this.firebase.requestIndividualAction(this.classCode, UUID, action, followerType);
        },

        /**
         * Notify a selected follower that they have been removed from the class.
         * @param UUID
         * @param followerType
         */
        async endIndividualSession(UUID: string, followerType: string) {
            await this.firebase.requestIndividualAction(
                this.classCode, UUID,
                { type: REQUESTS.REMOVED },
                followerType
            );
        },

        /**
         * Notify followers a session is ending and delete database class entry
         */
        async endSession() {
            localStorage.removeItem("firebase:previous_websocket_failure")
            await this.firebase.requestAction(this.classCode, {type: REQUESTS.ENDSESSION}, REQUESTS.WEB);
            await this.firebase.requestAction(this.classCode, {type: REQUESTS.ENDSESSION}, REQUESTS.MOBILE);
            this.firebase.removeClass(this.classCode);
            this.webFollowers = [];
            this.mobileFollowers = [];

            await removeLocalStorage("CurrentClass");
            await this.clearTasks();

            await new Promise(res => setTimeout(res, 200));
            this.classCode = "";
        },

        /**
         * Notify the leader that a web follower has disconnected
         * @param UUID A string representing the unique ID of a student.
         * @param followerType
         */
        followerDisconnected(UUID: string, followerType: string) {
            const follower = this.findFollowerObject(UUID, followerType);
            if (!follower) { return }
            follower.disconnected = true;
        },

        /**
         * Notify the leader that a follower has disconnected
         * @param UUID A string representing the unique ID of a student.
         * @param followerType
         */
        removeFollower(UUID: string, followerType: string) {
            const index = this.findFollowerIndex(UUID, followerType);
            if (index === -1) return;

            followerType === REQUESTS.WEB ?
                this.webFollowers.splice(index, 1) :
                this.mobileFollowers.splice(index, 1);
        },

        /**
         * Request that a follower makes the supplied media the active media within their associated application.
         * @param UUID
         * @param action
         * @param followerType
         */
        requestActiveMedia(UUID: string, action: object, followerType: string) {
            const follower = this.findFollowerObject(UUID, followerType);
            if (follower) {
                this.requestIndividualAction(UUID, action, followerType)
            }
        },

        /**
         * Lock or unlock a users screen, a web user will have their current tabs blacked out by a div, any new tabs will
         * immediately be blacked out as well. A mobile device will have the full screen blocked from use.
         * @param follower A {@link Follower} object.
         * @param lock A boolean of whether to lock the device or unlock.
         */
        lockScreens(follower: Follower, lock: boolean) {
            this.requestIndividualAction(follower.getUniqueId(),{
                type: REQUESTS.SCREENCONTROL,
                action: lock ? REQUESTS.BLOCK : REQUESTS.UNBLOCK
            }, follower.type);

            //Change the local follower data
            this.updateFollowerData(
                follower.getUniqueId(),
                follower.type,
                'locked',
                lock);
        },

        /**
         * Mute or unmute the follower's device, a web user will have all tabs muted while a mobile user will have the device
         * itself muted. Depending on the saved muted value on the follower model the command will send a mute or unmute command.
         * @param follower A {@link Follower} object.
         * @param mute A boolean of whether to mute the device or unmute.
         */
        muteSound(follower: Follower, mute: boolean | undefined | null) {
            if(mute === null || mute === undefined) {
                mute = true;
            }

            //Send the command
            this.requestIndividualAction(follower.getUniqueId(),{
                type: follower.type === REQUESTS.WEB ? REQUESTS.MUTETAB : REQUESTS.DEVICEAUDIO,
                tabs: 'multiTab',
                action: mute ? REQUESTS.MUTETAB : REQUESTS.UNMUTETAB
            }, follower.type);

            //Change the local follower data
            this.updateFollowerData(
                follower.getUniqueId(),
                follower.type,
                'muted',
                mute);
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////WEB FUNCTIONS///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Send WebRTC ice candidates to the Firebase database
         * @param senderId The unique ID of the sender to differentiate between the sender and receiver.
         * @param UUID The unique ID of the student which acts as the database reference location
         * @param data An object that contains the latest ice candidates
         */
        sendIceCandidates(senderId: string, UUID: string, data: string) {
            this.firebase.sendIceCandidates(senderId, UUID, data, this.classCode);
        },

        /**
         * Read the latest ice candidates and send them through to the WebRTC store for further action.
         * @param UUID The unique ID (key) of the student connection in the WebRTC connection objects
         * @param snapshot A firebase snapshot containing the ice information.
         */
        readIceCandidate(UUID: string, snapshot: any) {
            this.webRTCPinia.readIceCandidate(UUID, snapshot)
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param UUID
         * @param response
         * @param name
         * @param key
         */
        followerResponse(UUID: string, response: any, name: string, key: string|null) {
            if (key === "screenshot") {
                toDataURL(response).then((result) => {
                    if (typeof result === "string") {
                        this.updateFollowerScreenshot(UUID, result)
                        void this.updateFollowerCaptureFailed(UUID, false)
                    }
                })
                return
            }
            switch (response.type) {
                case REQUESTS.MONITORPERMISSION:
                    void this.monitorRequestResponse(UUID, response.message);
                    break;
                case REQUESTS.CAPTURE_FAILED:
                    void this.updateFollowerCaptureFailed(UUID, true)
                    break;
                default:
                    console.log(response);
                    console.log("Unknown command");
            }
        },

        /**
         * Update the classroom store with the new web follower object that has been entered in firebase.
         * @param UUID
         * @param snapshot
         */
        webFollowerAdded(UUID: string, snapshot: any) {
            const follower = new WebFollower(this.classCode, snapshot.name, UUID)
            follower.monitoring = false
            follower.muted = false
            follower.muteAll = false
            follower.tabs = snapshot.tabs
            if (snapshot.screenshot) {
                toDataURL(snapshot.screenshot).then((result) => {
                    if (typeof result === "string") {
                        this.updateFollowerScreenshot(UUID, result)
                    }
                })
            }
            const index = this.webFollowers.findIndex(element => element.getUniqueId() === UUID)
            if (index === -1) {
                this.webFollowers.push(follower)
            } else {
                this.webFollowers.splice(index, 1, follower)
            }

            this.webRTCPinia.createNewConnection(UUID);
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param UUID
         * @param response
         * @param key
         */
        followerTabChanged(UUID: string, response: any, key: string) {
            const newTab = new Tab(key, response.index, response.windowId, response.name, response.favicon, response.url, response.lastActivated)
            newTab.audible = response.audible ?? false
            newTab.muted = response.muted ?? false
            this.updateFollowerTab(UUID, newTab)
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param UUID
         * @param key
         */
        followerTabRemoved(UUID: string, key: string) {
            this.removeFollowerTab(UUID, key)
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param UUID
         * @param response
         */
        followerTabsAdded(UUID: string, response: any) {
            const tabs: Array<Tab> = []
            Object.values(response).forEach((tab: any) => {
                if(tab.name === undefined && tab.id === undefined) { return; }

                console.log("adding a tab", JSON.stringify(tab))
                const newTab = new Tab(tab.id, tab.index, tab.windowId, tab.name, tab.favicon, tab.url, tab.lastActivated)
                newTab.audible = tab.audible ?? false
                newTab.muted = tab.muted ?? false
                tabs.push(newTab)
            })
            this.setFollowerTabs(UUID, tabs)
        },

        /**
         * Add new follower or update an existing one
         * @param UUID
         * @param capture
         */
        updateFollowerScreenshot(UUID: string, capture: string) {
            const follower = this.findFollowerObject(UUID, REQUESTS.WEB) as WebFollower;
            if (follower) {
                follower.imageBase64 = capture
            }
        },

        /**
         * Add new follower or update an existing one
         * @param UUID
         * @param value
         */
        updateFollowerCaptureFailed(UUID: string, value: boolean) {
            const follower = this.findFollowerObject(UUID, REQUESTS.WEB) as WebFollower;
            if (follower) {
                follower.collectingScreenshotFailed = value
            }
        },

        /**
         * Add new follower or update an existing one
         * @param UUID
         * @param tab
         */
        updateFollowerTab(UUID: string, tab: Tab) {
            const follower = this.findFollowerObject(UUID, REQUESTS.WEB) as WebFollower;
            if (follower) {
                follower.updateIndividualTab(tab.id, tab)
            }
        },

        /**
         * Add new follower or update an existing one
         * @param UUID
         * @param id
         */
        removeFollowerTab(UUID: string, id: string) {
            const follower = this.findFollowerObject(UUID, REQUESTS.WEB) as WebFollower;
            if (follower) {
                follower.removeTab(id)
            }
        },

        /**
         * Add new follower or update an existing one
         * @param UUID
         * @param id
         */
        requestDeleteFollowerTab(UUID: string, id: string) {
            const follower = this.findFollowerObject(UUID, REQUESTS.WEB) as WebFollower;

            if (follower) {
                const action = { type: REQUESTS.DELETE_TAB, tabId: id };
                void this.firebase.requestIndividualAction(this.classCode, follower.getUniqueId(), action, REQUESTS.WEB);
                const index = follower.tabs.findIndex(element => id === element.id)
                if (index !== -1) {
                    follower.tabs[index].closing = true
                }
            }
        },

        /**
         * Add new follower or update an existing one
         * @param UUID
         * @param tabId
         * @param newValue
         */
        requestUpdateMutingTab(UUID: string, tabId: string, newValue: boolean) {
            const follower = this.findFollowerObject(UUID, REQUESTS.WEB) as WebFollower;

            if (follower) {
                const action = { type: REQUESTS.MUTETAB, action: newValue ? REQUESTS.MUTETAB : REQUESTS.UNMUTETAB, tabId };
                console.log(action)
                void this.firebase.requestIndividualAction(this.classCode, follower.getUniqueId(), action, REQUESTS.WEB);
                const index = follower.tabs.findIndex(element => tabId === element.id)
                if (index !== -1) {
                    follower.tabs[index].muting = true
                }
            }
        },

        /**
         * Add new follower or update an existing one
         * @param UUID
         * @param tabs
         */
        setFollowerTabs(UUID: string, tabs: Tab[]) {
            const follower = this.findFollowerObject(UUID, REQUESTS.WEB) as WebFollower;
            if (follower) {
                follower.tabs = tabs
            }
        },

        /**
         * Notify the leader a follower has responded to the monitor request
         * @param UUID
         * @param message
         */
        async monitorRequestResponse(UUID: string, message: string) {
            const follower = this.findFollowerObject(UUID, REQUESTS.WEB) as WebFollower;
            if (!follower) { return }

            switch(message){
                case "granted":
                    follower.permission = "connecting";
                    await this.webRTCPinia.startFollowerStream(UUID);

                    //Wait while the webRTC connections are established in the background
                    setTimeout(() => {
                        // @ts-ignore
                        follower.permission = "granted";
                    }, 750);
                    break;

                case "denied":
                    follower.permission = "denied";
                    console.log("User has denied the monitor request");
                    break;

                case "stopped":
                    follower.permission = "stopped";
                    console.log("The user has stopped the monitoring request");
                    break;
            }
        },

        /**
         * Clear the current tasks from the local storage
         */
        clearTasks() {
            this.webTasks = [];
            this.mobileTasks = [];
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////MOBILE FUNCTIONS/////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Update the classroom store with the new mobile follower object that has been entered in firebase.
         * @param UUID
         * @param snapshot
         */
        mobileFollowerAdded(UUID: string, snapshot: any) {
            const appsWithoutImageData: Array<string> = []
            const follower = new MobileFollower(this.classCode, snapshot.name, snapshot.applications.map((element: Application) => {
                if (!this.firebase.getAppIcon(element.packageName)) {
                    appsWithoutImageData.push(element.packageName)
                }
                return element
            }), snapshot.videos, UUID)
            if (appsWithoutImageData.length > 0) {
                this.requestIndividualAction(follower.uniqueId, { type: REQUESTS.UPLOADICONS, action: appsWithoutImageData.join(":") }, REQUESTS.MOBILE)
            }

            follower.muted = false

            const index = this.findFollowerIndex(UUID, REQUESTS.MOBILE);
            if (index === -1) {
                this.mobileFollowers.push(follower)
            } else {
                this.mobileFollowers.splice(index, 1, follower)
            }
        },

        /**
         * Update a mobile followers current application.
         * @param UUID A string representing the unique ID of a student.
         * @param key
         * @param value A string representing the package name of the active application.
         */
        updateActiveFollower(UUID: string, key: string, value: string) {
            const index = this.findFollowerIndex(UUID, REQUESTS.MOBILE);
            const follower = cloneDeep(this.mobileFollowers[index])
            if (index === -1) return;

            switch (key){
                case "currentPackage":
                    follower.currentApplication = value
                    // eslint-disable-next-line no-case-declarations
                    const app = follower.applications.find(item => item.id === value)
                    if (app) {
                        follower.applications.unshift(follower.applications.splice(follower.applications.indexOf(app), 1)[0])
                    }
                    break;
                case "action":
                    follower.action = value;
                    break;
                case "source":
                    follower.source = value;
                    break;
                case "name":
                    follower.name = value;
                    break;
            }
            this.mobileFollowers.splice(index, 1, follower)
        },

        /**
         * Return an array of all the unique applications stored on mobile followers devices.
         */
        collectUniqueApplications(): Application[] | undefined {
            const uniqueApplications = new Set<Application>(
                this.mobileFollowers.flatMap(follower => follower.applications)
            );

            return Array.from(uniqueApplications);
        },

        /**
         * Return an array of all the unique videos stored on mobile followers devices.
         */
        collectUniqueVideos(): Video[] | undefined {
            const uniqueVideos = new Set<Video>(
                this.mobileFollowers.flatMap(follower => follower.videos)
            );

            return Array.from(uniqueVideos);
        },

        /**
         * Rename a selected follower
         * @param UUID
         * @param tasks
         * @param followerType
         */
        async updateFollowerTasks(UUID: string, tasks: string[], followerType: string) {
            await this.firebase.updateFollower(this.classCode, UUID, {tasks: tasks}, followerType);
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////ACCOUNT FUNCTIONS//////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Send the firebase password reset email off to the supplied user.
         */
        async handlePasswordReset(email: string) {
            const auth = getAuth();
            return await sendPasswordResetEmail(auth, email)
                .then(() => { return "success"; })
                .catch((error) => { return this.firebase.getUsefulErrorMessageFromFirebaseCode(error.code); });
        },

        /**
         * Change the password of the currently signed-in user.
         * @param email
         * @param currentPassword
         * @param newPassword
         */
        async changeUserPassword(email: string, currentPassword: string, newPassword: string) {
            const result = await this.firebase.setPassword(email, currentPassword, newPassword);

            if(result === "success") { return result; }
            return this.firebase.getUsefulErrorMessageFromFirebaseCode(result);
        },

        /**
         * Change the display name for a user within their firebase account, upon success change the locally held store
         * name as well.
         * @param name A string representing the new display name.
         */
        async changeDisplayName(name: string): Promise<string> {
            await this.firebase.setDisplayName(name);
            this.leaderName = name;
            return "success";
        },

        /**
         * Change the email associated with the firebase account. This can only be performed on a logged-in user that
         * has recently logged in.
         * @param email
         */
        async changeEmailAddress(email: string): Promise<string> {
            const result = await this.firebase.setEmailAddress(email);

            if (result === "success") {
                this.leaderEmail = email;
            }

            return result;
        },

        /**
         * Change whether a user has accepted or denied permission to be contacted for marketing purposes.
         * @param preference A boolean representing if they have opted in for marketing.
         */
        async changeMarketingPreference(preference: boolean): Promise<string> {
            this.marketing = <boolean>await this.firebase.setMarketingPreference(preference);
            return "success";
        },
    }
});
