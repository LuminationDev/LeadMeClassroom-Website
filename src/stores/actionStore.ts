import { defineStore } from "pinia";
import type { Follower } from "@/models";
import { Application, CuratedContentItem, Video, Task } from "@/models";
import * as REQUESTS from "@/constants/_requests";
import type { UpdateFollowerTasksCallback } from "@/constants/_functionTypes";

/**
 * Responsible for storing data that relates to sending and sharing content to different users. This allows for
 * navigating between the modals and classroom page whilst saving selected states. NO user management is to be used
 * here, it is specifically for content sharing.
 */
export const useActionStore = defineStore("action", {
    state: () => {
        return {
            panelName: <string>'menu', //The current panel of the content modal
            viewDescription: <string>'', //The individual item a user may be viewing
            selectedItems: [] as Task[],
            selectedFollowers: [] as Follower[],
            selecting: <boolean>false, //Whether the user is selecting users
            shareType: <string>'', //Determines the request type to send to firebase
            websiteURL: <string>'', //A common storage place for the latest URL to be sent to the users
            showModal: <boolean>false //Central location to open/close the content modal
        }
    },
    actions: {
        /**
         * Handles the selection of a follower.
         * @param follower - The {@link Follower} to handle.
         * @param value - The selection value. If true, the follower will be selected. If false, the follower will be deselected.
         */
        handleFollowerSelection(follower: Follower, value: boolean) {
            const index = this.selectedFollowers.findIndex(element => element.getUniqueId() === follower.getUniqueId())
            if (value) {
                if (index === -1) {
                    this.selectedFollowers.splice(0, 0, follower)
                }
            } else {
                if (index !== -1) {
                    this.selectedFollowers.splice(index, 1)
                }
            }
        },

        /**
         * Adds or removes an application from the selected items.
         * @param application - The {@link Application} to add or remove.
         */
        addOrRemoveApplication(application: Application) {
            const index = this.selectedItems.findIndex(app => app.getPackageName() === application.packageName);

            if (index > -1) {
                this.selectedItems.splice(index, 1);
            } else {
                const task = new Task(application.name, application.packageName, "Application")
                this.selectedItems.push(task);
            }
        },

        /**
         * Adds or removes a curated content item from the selected items.
         * @param contentItem - The {@link CuratedContentItem} to add or remove.
         */
        addOrRemoveCuratedContentItem(contentItem: CuratedContentItem) {
            // Convert back to CuratedContentItem using type assertion
            const curatedContentItem: CuratedContentItem = contentItem as CuratedContentItem;
            const index = this.selectedItems.findIndex(app => app.getPackageName() === curatedContentItem.getLink());
            if (index > -1) {
                this.selectedItems.splice(index, 1);
            } else {
                const task = new Task(curatedContentItem.getTitle(), curatedContentItem.getLink(), curatedContentItem.getType());
                this.selectedItems.push(task);
            }
        },

        /**
         * Adds or removes a video item from the selected items.
         * @param video - The {@link Video} to add or remove.
         */
        addOrRemoveVideo(video: Video) {
            const index = this.selectedItems.findIndex(app => app.getName() === video.getName());

            if (index > -1) {
                this.selectedItems.splice(index, 1);
            } else {
                const task = new Task(video.name, video.getName(), "Video_local")
                this.selectedItems.push(task);
            }
        },

        /**
         * Shares content with selected followers.
         * @param callback - The {@link UpdateFollowerTasksCallback} function to handle the update of follower tasks.
         */
        shareContent(callback: UpdateFollowerTasksCallback) {
            if(this.shareType === '' || this.selectedFollowers.length === 0) {
                return;
            }

            switch (this.shareType) {
                case "website":
                    this.sendWebsite(callback);
                    break;

                case "curated":
                    this.sendCuratedContent(callback);
                    break;

                case "video":
                case "app":
                    this.sendApplicationOrVideo(callback);
                    break;
            }

            //Clean up the selection and action bar
            this.selectedFollowers = [];
            this.selecting = false;
            this.shareType = '';
        },

        isYouTubeLink(link: string) {
            const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;
            return youtubeRegex.test(link);
        },

        isVimeoLink(link: string) {
            const vimeoRegex = /^(http(s)?:\/\/)?(www\.)?vimeo\.com\/(\d+)($|\/)/;
            return vimeoRegex.test(link);
        },

        //TODO TASKS NOT SETUP FOR WEB USERS - MAY RESULT IN WEIRD STUFF
        sendWebsite(callback: UpdateFollowerTasksCallback) {
            this.selectedFollowers.forEach(follower => {
                let format = "Website";
                let type = "Website";

                if (follower.type === REQUESTS.MOBILE && (this.isVimeoLink(this.websiteURL) || this.isYouTubeLink(this.websiteURL))) {
                    format = "VR Video";
                    type = "Video";
                }

                follower.tasks = Array.from(new Set(follower.tasks.concat([new Task(format, this.websiteURL, type)])));
                callback(follower.getUniqueId(), follower.tasks.map(app => app.toStringEntry()), follower.type);
            });
        },

        //TODO TASKS NOT SETUP FOR WEB USERS - MAY RESULT IN WEIRD STUFF
        sendCuratedContent(callback: UpdateFollowerTasksCallback) {
            this.selectedFollowers.forEach(follower => {
                //Update the task list
                follower.tasks = Array.from(new Set(follower.tasks.concat(this.selectedItems)));
                callback(follower.getUniqueId(), follower.tasks.map(app => app.toStringEntry()), follower.type);
            });
        },

        //TODO TASKS NOT SETUP FOR WEB USERS - MAY RESULT IN WEIRD STUFF
        sendApplicationOrVideo(callback: UpdateFollowerTasksCallback) {
            this.selectedFollowers.forEach(follower => {
                //Only Mobile users can be shared a local file
                if (follower.type === REQUESTS.WEB) {
                    return;
                }
                follower.tasks = Array.from(new Set(follower.tasks.concat(this.selectedItems)));
                callback(follower.getUniqueId(), follower.tasks.map(app => app.toStringEntry()), follower.type);
            });
        }
    },
    getters: {

    }
});
