import { devConfig, prodConfig } from './_service';
import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app'
import type { FirebaseStorage } from 'firebase/storage'
import { getStorage, ref as storageRef, getDownloadURL, deleteObject, listAll } from 'firebase/storage'
import {
    Database,
    getDatabase,
    ref,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    get,
    update,
    push,
    remove,
    off
} from 'firebase/database';
import { browserLocalPersistence, getAuth, setPersistence, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateEmail } from "@firebase/auth";
import * as REQUESTS from '../constants/_requests';
import type { Leader } from "../models";
import type {
    addedType,
    assistantCallbackFunction,
    disconnectedType, generateType, mobileFollowerUpdate,
    readIceCandidateType,
    responseType, tabChangedType, tabRemovedType, tabsAddedType
} from "@/constants/_functionTypes";
import { toDataURL } from "@/controller/_dataRequests";

const config = prodConfig;

interface AppIcon {
    imageName: string
    imageData: string
}

class Firebase {
    private readonly callback: assistantCallbackFunction|null;
    private readonly firebase: FirebaseApp|undefined;
    private readonly db: Database;
    private readonly storage: FirebaseStorage;
    private readonly webMessageRef = "webMessages";
    private readonly webFollowerRef = "webFollowers";
    private readonly mobileMessageRef = "mobileMessages";
    private readonly mobileFollowerRef = "mobileFollowers";
    private appIconsList: Array<AppIcon> = [];
    private curatedContentUrls: any = {}

    constructor(callback: any = null) {
        this.callback = callback;

        try {
            this.firebase = initializeApp(config);
        } catch (err: any) {
            if (!/already exists/.test(err.message)) {
                console.error('Firebase initialization error', err.stack);
            }
        }

        //Real-time database reference
        this.db = getDatabase(this.firebase);
        this.storage = getStorage(this.firebase);
        getAuth()
        const listRef = storageRef(this.storage, 'app_icons/')
        listAll(listRef).then((res) => {
            res.items.forEach((element) => {
                getDownloadURL(element).then((result) => {
                    toDataURL(result).then((imageData) => {
                        if (typeof imageData === "string") {
                            this.appIconsList.push({
                                imageName: element.name,
                                imageData: imageData
                            })
                        }
                    })
                })
            })
        })
    }

    async getCuratedContentImageUrl(url: string) {
        const refString = 'preview_images/'  + url.replaceAll('/', '-') + '.jpg'
        if (this.curatedContentUrls[refString]) {
            return this.curatedContentUrls[refString]
        }
        const ref = storageRef(this.storage, refString)
        const result = await getDownloadURL(ref).catch(async (error) => {
            if (error.code.includes('storage/object-not-found')) {
                const token = await getAuth().currentUser?.getIdToken()
                fetch("https://us-central1-browserextension-bc94e.cloudfunctions.net/fetchPreviewImage", {
                    method: "POST",
                    body: JSON.stringify({
                        url,
                        token
                    })
                }).then(response => {
                    getDownloadURL(ref).then((url) => {
                        this.curatedContentUrls[refString] = url
                        return Promise.resolve(url)
                    })
                })
            }
        })
        this.curatedContentUrls[refString] = result
        return result
    }

    /**
     * Get an application icon from the preloaded list.
     * @param appPackageName A string of the application name to load.
     */
    getAppIcon(appPackageName: string) {
        const index = this.appIconsList.findIndex(element => element.imageName === (appPackageName + ".JPG"))
        if (index !== -1) {
            return this.appIconsList[index].imageData
        }
        return null
    }

    /**
     * Get the display name and photoURL (used as marketing preference) of the currently active user.
     * @returns {object} An object representing a users details.
     */
    getDisplayDetails = async () => {
        await setPersistence(getAuth(), browserLocalPersistence);

        const currentUser = getAuth().currentUser;
        return {
            name: currentUser?.displayName ?? "",
            marketing: currentUser?.photoURL === 'true',
            email: currentUser?.email ?? ""
        };
    }

    /**
     * Set a new password for the currently active user. Reauthenticate the user before attempting to change the current
     * password.
     * @param email
     * @param currentPassword
     * @param newPassword
     */
    setPassword = async (email: string, currentPassword: string, newPassword: string) => {
        const user = getAuth().currentUser;
        const credential = EmailAuthProvider.credential(email, currentPassword);

        return reauthenticateWithCredential(user!, credential).then(async result => {
            if(result) {
                await updatePassword(user!, newPassword);
            }

            return "success";
        }).catch(error => {
            return error.code;
        });
    }

    /**
     * Update the display name of the currently active user.
     * @param name
     */
    setDisplayName = async (name: string) => {
        await updateProfile(getAuth().currentUser!, {displayName: name})
    }

    /**
     * Update the email address of the currently active user.
     * @param email
     */
    setEmailAddress = async (email: string): Promise<string> => {
        const user = getAuth().currentUser;
        if (user) {
            return updateEmail(user, email).then(() => {
                return "success";
            }).catch(error => {
                return this.getUsefulErrorMessageFromFirebaseCode(error.code);
            });
        }
        return "No user found";
    }

    /**
     * Update the marketing preference of the currently active user.
     * @param preference
     */
    setMarketingPreference = async (preference: boolean) => {
        await updateProfile(getAuth().currentUser!, { photoURL: preference ? 'true' : 'false' })
        return preference;
    }

    /**
     * Update the Real Time Database with the pass object.
     * @param {*} leader An object representing the current leader
     * @param callback
     */
    connectAsLeader(leader: Leader, callback: generateType) {
        this.generateRoom(leader, callback);
    }

    /**
     * Update the Real Time Database with the pass object.
     * @param {*} leader A JSON structured object to be uploaded into the database.
     * @param callback
     */
    generateRoom = (leader: Leader, callback: generateType) => {
        let completedCount = 0
        update(ref(this.db, `classCode`), leader.getClassroomObject()).then(() => {
            completedCount++
        });
        update(ref(this.db, this.webFollowerRef), leader.getDefaultFollowersObject()).then(() => {
            completedCount++
        });
        update(ref(this.db, this.mobileFollowerRef), leader.getDefaultFollowersObject()).then(() => {
            completedCount++
        });
        update(ref(this.db, `tabs`), leader.getDefaultTabsObject()).then(() => {
            completedCount++
        });
        update(ref(this.db, `ice`), leader.getDefaultIceObject()).then(() => {
            completedCount++
        });
        const runCallback = () => {
            setTimeout(() => {
                if (completedCount === 5) {
                    callback()
                } else {
                    runCallback()
                }
            }, 100)
        }
        runCallback()
    }

    /**
     * Add listeners for followers being added and removed to the database
     * @param classCode A string representing the class a teacher is currently controlling.
     * @param followerResponse
     * @param updateActiveFollower
     * @param followerDisconnected
     * @param webFollowerAdded
     * @param mobileFollowerAdded
     * @param readIceCandidate
     */
    followerListeners = (
        classCode: string,
        followerResponse: responseType,
        updateActiveFollower: mobileFollowerUpdate,
        followerDisconnected: disconnectedType,
        webFollowerAdded: addedType,
        mobileFollowerAdded: addedType,
        readIceCandidate: readIceCandidateType) => {

        //Listener for Web Followers
        const followerRef = ref(this.db, `/${this.webFollowerRef}/${classCode}`);
        onChildAdded(followerRef, (snapshot) => {
            webFollowerAdded(snapshot.key!, snapshot.val())
            const name = snapshot.val().name;
            const UUID = snapshot.key;

            const individualRef = ref(this.db, `/${this.webFollowerRef}/${classCode}/${UUID}`);
            onChildChanged(individualRef, (snapshot) => {
                if (snapshot.key === 'screenshot') {
                    const screenshotRef = storageRef(this.storage, `${this.webFollowerRef}/${classCode}/${UUID}`);
                    getDownloadURL(screenshotRef).then(url => {
                        followerResponse(UUID!, url, name, snapshot.key!);
                    })
                } else {
                    followerResponse(UUID!, snapshot.val(), name, snapshot.key!);
                }
            });

            //Add ice listeners
            const iceRef = ref(this.db, `ice/${classCode}/${UUID}`);
            onChildAdded(iceRef, (snapshot) => {
                readIceCandidate(UUID!, snapshot)
            });
        });

        onChildRemoved(followerRef, (snapshot) => {
            followerDisconnected(snapshot.key!, REQUESTS.WEB);
        });

        //Listener for Mobile Followers
        const mobileFollowerRef = ref(this.db, `/${this.mobileFollowerRef}/${classCode}`);
        onChildAdded(mobileFollowerRef, (snapshot) => {

            mobileFollowerAdded(snapshot.key!, snapshot.val())
            const UUID = snapshot.key

            const individualRef = ref(this.db, `/${this.mobileFollowerRef}/${classCode}/${UUID}`);
            onChildChanged(individualRef, (snapshot) => {
                //Listen for currentPackage changes?
                updateActiveFollower(UUID!, snapshot.key!, snapshot.val());
            });
        });

        onChildRemoved(mobileFollowerRef, (snapshot) => {
            followerDisconnected(snapshot.key!, REQUESTS.MOBILE);
        });
    }

    /**
     * Add listeners for followers being added and removed to the database
     * @param classCode A string representing the class a teacher is currently controlling.
     * @param followerTabChanged
     * @param followerTabRemoved
     * @param followerTabsAdded
     */
    tabListeners = (classCode: string, followerTabChanged: tabChangedType, followerTabRemoved: tabRemovedType, followerTabsAdded: tabsAddedType) => {
        const tabRef = ref(this.db, `/tabs/${classCode}`);

        onChildAdded(tabRef, (snapshot) => {
            followerTabsAdded(snapshot.key!, snapshot.val());
            const UUID = snapshot.key;

            const individualTabRef = ref(this.db, `/tabs/${classCode}/${UUID}`);
            onChildChanged(individualTabRef, (snapshot) => {
                followerTabChanged(UUID!, snapshot.val(), snapshot.key!);
            });

            onChildRemoved(individualTabRef, (snapshot) => {
                followerTabRemoved(UUID!, snapshot.key!);
            });
        });
    }

    //TODO need to reload tasks as well.
    /**
     * Run through all the student entries within the existing class entry and reattach the listeners that may have
     * been severed when a page reload occurred, loading the students again to the classroom as well.
     * @param classCode A string representing the class a teacher is currently controlling.
     * @param followerResponse
     */
    reloadFollowers = (classCode: string, followerResponse: responseType) => {
        const webFollowerRef = ref(this.db, `/${this.webFollowerRef}/${classCode}`);
        get(webFollowerRef).then((snapshot) => {
            snapshot.forEach(entry => {
                followerResponse(entry.key!, entry.val().screenshot, entry.val().name, null);
            });
        });
    }

    /**
     * Update a follower's data entry in firebase. Only the fields present in the details object will be updated.
     * @param classCode A string representing the class a user is registered to.
     * @param UUID A string representing the unique ID of a follower.
     * @param details An object holding the fields to update on the follower.
     * @param followerType
     */
    updateFollower = (classCode: string, UUID: string, details: object, followerType: string) => {
        const followerTypeRef = followerType === REQUESTS.WEB ? this.webFollowerRef : this.mobileFollowerRef;
        const followerRef = ref(this.db, `/${followerTypeRef}/${classCode}/${UUID}`);
        update(followerRef, details).then(() => console.log("Follower updated"));
    }

    /**
     * Sent from a leader, push an action request to all followers. This could be a video_permission, muteTab etc.
     * @param classCode A string representing the class a user is registered to.
     * @param {*} type
     * @param followerType
     */
    requestAction = async (classCode: string, type: object, followerType: string) => {
        const messageRef = followerType === REQUESTS.WEB ? this.webMessageRef : this.mobileMessageRef;
        const msg = push(ref(this.db, `classCode/${classCode}/request/${messageRef}`), type);
        await remove(msg);
    }

    /**
     * Sent from a leader, push an action request to a particular follower. This could be a video_permission, muteTab etc.
     * @param classCode A string representing the class a user is registered to.
     * @param UUID A string representing the unique ID of a follower.
     * @param followerType A string representing what type of follower to message, Web or Mobile.
     * @param {*} type
     */
    requestIndividualAction = async (classCode: string, UUID: string, type: object, followerType: string) => {
        const followerRef = followerType === REQUESTS.WEB ? this.webFollowerRef : this.mobileFollowerRef;
        const msg = push(ref(this.db, `${followerRef}/${classCode}/${UUID}/request`), type);
        await remove(msg);
    }

    /**
     * Remove the entity of a class entry, at the end of a session the details of the connects will be erased.
     * @param {*} classCode A string representing the class a teacher is currently controlling.
     */
    removeClass = (classCode: string) => {
        const classRef = ref(this.db, `classCode/${classCode}`);
        const webFollowersRef = ref(this.db, `${this.webFollowerRef}/${classCode}`);
        const mobileFollowersRef = ref(this.db, `${this.mobileFollowerRef}/${classCode}`);
        const tabsRef = ref(this.db, `tabs/${classCode}`);
        const iceRef = ref(this.db, `ice/${classCode}`);
        const screenshotsRef = storageRef(this.storage, `${classCode}`);

        off(classRef);
        off(webFollowersRef);
        off(mobileFollowersRef);
        off(tabsRef);
        off(iceRef);

        remove(webFollowersRef)
            .then(function () { console.log("Removed followers succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });

        remove(mobileFollowersRef)
            .then(function () { console.log("Removed followers succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });

        remove(tabsRef)
            .then(function () { console.log("Removed tabs succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });

        remove(iceRef)
            .then(function () { console.log("Removed ice succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });

        remove(classRef)
            .then(function () { console.log("Removed class succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });

        // unfortunately we can't just delete the directory, we have to delete each item within it individually
        listAll(screenshotsRef).then((res) => {
            res.items.forEach(screenshotRef => {
                deleteObject(screenshotRef)
                    .then(function () {
                        console.log("Removed screenshots succeeded.")
                    })
                    .catch(function (error) {
                        console.log("Remove failed: " + error.message)
                    });
            })
        });
    }

    /**
     * Send the latest ICE candidates to firebase.
     * @param senderId A unique number representing the sender's ID, to differentiate from a reader.
     * @param UUID A string representing the unique ID of a follower.
     * @param data A JSON string object of the latest ICE candidates.
     * @param classCode A string representing the class a user is registered to.
     */
    sendIceCandidates = (senderId: string, UUID: string, data: string, classCode: string) => {
        const msgRef = ref(this.db, `ice/${classCode}/${UUID}`);
        push(msgRef, { sender: senderId, message: data }).then(msg => remove(msg));
    }

    /**
     * Return a useful human-readable message from a supplied firebase error status.
     * @param error
     */
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
            case 'auth/requires-recent-login':
                return 'A recent login is required for this change.'
            default:
                return 'An error has occurred. Please contact support and give them this error code: ' + error
        }
    }
}

export default Firebase;
