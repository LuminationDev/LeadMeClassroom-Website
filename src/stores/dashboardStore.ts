import { defineStore } from "pinia";
import * as REQUESTS from "../constants/_requests.js";
import Firebase from '../controller/_firebase';
import { Leader, MobileFollower, Tab, WebFollower } from '../models';
import { useWebRTCStore } from "./webRTCStore";
import type { User } from "@firebase/auth";
import { getAuth, sendPasswordResetEmail } from "@firebase/auth";
import type { Application } from "@/models";

interface userDetails {
    name: string,
    marketing: string
}

const firebase = new Firebase();
const leaderDetails = <userDetails>await firebase.getDisplayDetails();

/**
 * When the dashboard is first loaded or if the page is refreshed check to see if there was
 * an active class set the necessary details.
 */
async function onLoad() {
    return "";
}

let activeCode = await onLoad();

const toDataURL = (url: string) => fetch(url)
    .then(response =>  response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }));

export const useDashboardStore = defineStore("dashboard", {
    state: () => {
        return {
            view: "dashboard",
            accountView: "menu",
            firebase: firebase,
            classCode: activeCode,
            leaderName: leaderDetails.name,
            marketing: <string|null>leaderDetails.marketing,
            webFollowers: <WebFollower[]>([]),
            webTasks: <String[]>([]),
            mobileFollowers: <MobileFollower[]>([]),
            mobileTasks: <String[]>([]),
            webLink: "",
            leader: new Leader(leaderDetails.name),
            webRTCPinia: useWebRTCStore(),
            user: <User|null>null
        }
    },

    actions: {
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
            activeCode = this.leader.getClassCode();

            //Calling before class code can be attached?
            this.firebase.connectAsLeader(<Leader>this.leader, () => { this.attachClassListeners(false )});
            await this.clearTasks();
            // todo - store classcode somewhere

            await new Promise(res => setTimeout(res, 200));
            this.classCode = this.leader.getClassCode();
        },

        /**
         * Using callback functions attach listeners to within the firebase real time database.
         * @param active A boolean representing if a class is already running when the screen loads.
         */
        async attachClassListeners(active: boolean) {
            //Do not attach listeners if there is not an active class on creation/load/reload
            if(activeCode === "") { return; }

            //Override the auto generated code if there is a saved one
            this.leader.setClassCode(activeCode);

            //Set up the streaming connection
            this.webRTCPinia.setConnectionDetails(this.sendIceCandidates, activeCode);

            this.firebase.followerListeners(
                activeCode,
                this.followerResponse,
                this.updateActiveFollower,
                this.followerDisconnected,
                this.webFollowerAdded,
                this.mobileFollowerAdded,
                this.readIceCandidate
            );
            this.firebase.tabListeners(
                activeCode,
                this.followerTabChanged,
                this.followerTabRemoved,
                this.followerTabsAdded
            );

            if(!active) { return; }

            this.firebase.reloadFollowers(activeCode, this.followerResponse);
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////GENERIC FUNCTIONS////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Find a follower based on their unique ID and the type of follower.
         * @param ID
         * @param followerType
         */
        findFollowerObject(ID: string, followerType: string): WebFollower | MobileFollower | undefined {
            if (followerType === REQUESTS.WEB) {
                return this.webFollowers.find(element => element.getUniqueId() === ID) as WebFollower;
            } else {
                // @ts-ignore
                return this.mobileFollowers.find(element => element.getUniqueId() === ID) as MobileFollower;
            }
        },

        /**
         * Find a follower's index within the associated array.
         * @param ID
         * @param followerType
         */
        findFollowerIndex(ID: string, followerType: string): number {
            return followerType === REQUESTS.WEB
                ? this.webFollowers.findIndex(element => element.getUniqueId() === ID)
                : this.mobileFollowers.findIndex(element => element.getUniqueId() === ID);
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

            // todo - remove the stored current class code
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
         * Update the dashboard store with the new web follower object that has been entered in firebase.
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
                const action = { type: newValue ? REQUESTS.MUTETAB : REQUESTS.UNMUTETAB, tabId };
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
         * Set the website link in the firebase real-time database that the active students will navigate to.
         */
        async launchWebsite(website: string) {
            const action = { type: REQUESTS.WEBSITE, value: website };
            await this.firebase.requestAction(this.classCode, action, REQUESTS.WEB);
        },

        launchWebsiteIndividual(UUID: string, website: string) {
            const action = { type: REQUESTS.WEBSITE, value: website };
            void this.firebase.requestIndividualAction(this.classCode, UUID, action, REQUESTS.WEB);
        },

        /**
         * Update or create the task array within local storage.
         */
        async updateTasks(task: string, taskType: string) {
            taskType === "web" ? this.webTasks.push(task) : this.mobileTasks.push(task);
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
         * Update the dashboard store with the new mobile follower object that has been entered in firebase.
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
            }), UUID)
            if (appsWithoutImageData.length > 0) {
                this.requestIndividualAction(follower.uniqueId, { type: REQUESTS.UPLOADICONS, action: appsWithoutImageData.join(":") }, REQUESTS.MOBILE)
            }

            follower.muted = false

            const index = this.findFollowerIndex(UUID, REQUESTS.MOBILE);
            if (index === -1) {
                // @ts-ignore
                this.mobileFollowers.push(follower)
            } else {
                // @ts-ignore
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
            if (index === -1) return;

            switch (key){
                case "currentPackage":
                    this.mobileFollowers[index].setCurrentApplication(value);
                    break;
                case "action":
                    this.mobileFollowers[index].action = value;
                    break;
            }
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
                .catch((error) => { return this.getUsefulErrorMessageFromFirebaseCode(error.code); });
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
            return this.getUsefulErrorMessageFromFirebaseCode(result);
        },

        getUsefulErrorMessageFromFirebaseCode(error: string) {
            switch (error) {
                case 'auth/email-already-exists':
                    return 'This email is already in use. Try signing in instead.'
                case 'auth/id-token-expired':
                case 'auth/id-token-revoked':
                case 'auth/invalid-id-token':
                    return 'Your login session has expired. Please logout and try again'
                case 'auth/invalid-email':
                case 'auth/user-mismatch':
                    return 'This email is invalid. Please check your email address and try again.'
                case 'auth/invalid-password':
                    return 'This password is invalid. Please check that it is at least 6 characters.'
                case 'auth/user-not-found':
                    return 'No account was found for these login details. Please check your details and try again.'
                case 'auth/wrong-password':
                    return 'This password does not match the login details for this account. Please try again.'
                case 'auth/too-many-requests':
                    return 'Too many attempts have been made to login to this account. Please reset your password or try again later.'
                default:
                    return 'An error has occurred. Please contact support and give them this error code: ' + error
            }
        },

        /**
         * Change the display name for a user within their firebase account, upon success change the locally held store
         * name as well.
         * @param name A string representing the new display name.
         */
        async changeDisplayName(name: string) {
            await this.firebase.setDisplayName(name);
            this.leaderName = name;
        },

        /**
         * Change whether a user has accepted or denied permission to be contacted for marketing purposes.
         * @param preference A boolean representing if they have opted in for marketing.
         */
        async changeMarketingPreference(preference: boolean) {
            this.marketing = <string|null>await this.firebase.setMarketingPreference(preference);
        },
    }
});
