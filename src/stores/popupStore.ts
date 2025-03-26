import {defineStore} from "pinia";
import {
    sendEmailVerification,
    sendPasswordResetEmail,
    getAuth,
    signOut
} from '@firebase/auth'
import WebFollower from "../models/Followers/_webFollower";



//name - object
export let usePopupStore = defineStore("popup", {
    //Data
    state: () => {
        return {
            view: "loading",
            username: null,
            follower: new WebFollower(),
            classCode: "",
            error: "",
            name: "",
            previousViews: <string[]>([]),
            justCreatedAccount: false
        };
    },

    //Methods/functions
    actions: {
        /**
         * Change the current panel to the supplied one.
         */
        changeView(panel: string, addToHistory: boolean = true) {
            if (addToHistory) {
                this.previousViews.push(this.view)
            }
            if (panel === 'login' || panel === 'sessionTeacher' || panel === 'sessionStudent') {
                this.previousViews = []
            }
            this.resetStateFields();
            this.view = panel;
        },

        /**
         * Reset any fields that may be used across multiple panels
         */
        resetStateFields() {
            this.error = "";
            this.name = "";
        },



        async resendVerificationEmail() {
            const auth = getAuth()
            if (!auth.currentUser) {
                return;
            }

            await sendEmailVerification(auth.currentUser)
                .then()
                .catch((err) => console.log(err));
        },

        /**
         * Send the firebase password reset email off to the supplied user.
         */
        async handlePasswordReset(email: string) {
            const auth = getAuth();
            await sendPasswordResetEmail(auth, email)
                .then(() => {
                    // Password reset email sent!
                    // ..
                })
                .catch((error) => {
                    const errorCode = error.code;
                    console.log(errorCode);

                    this.error = this.getUsefulErrorMessageFromFirebaseCode(error.code)
                });
        },

        getUsefulErrorMessageFromFirebaseCode(error: string) {
          switch (error) {
              case 'auth/email-already-exists':
              case 'auth/email-already-in-use':
                  return 'This email is already in use. Try signing in instead.'
              case 'auth/id-token-expired':
              case 'auth/id-token-revoked':
              case 'auth/invalid-id-token':
                  return 'Your login session has expired. Please logout and try again'
              case 'auth/invalid-email':
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
         * Sign a teacher out of their currently active session.
         */
        async handleLogoutClick() {
            localStorage.removeItem("firebase:previous_websocket_failure")
            signOut(getAuth()).then(() => {
                this.view = "login"
            });
        }
    },

    //Computed properties
    getters: {
        test() {
            return 10;
        },
    },
});