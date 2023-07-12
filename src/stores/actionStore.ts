import { defineStore } from "pinia";
import type { Task, Follower } from "@/models";

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
    },
    getters: {

    }
});
