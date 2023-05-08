//Functions types described here are meant for overriding the regular typescript 'Function' type when using a function
//as a callback between functions or classes. Typescript wraps the basic 'Function' in an eval() which is strictly
//prohibiting within Chrome web extensions, using the types below overrides this issue.

//Assistant page callback
export type assistantCallbackFunction = (data: any) => void;

//Generating a session for dashboardStore
export type generateType = () => void;

//Follower functions for dashboardStore
export type responseType = (UUID: string, response: any, name: string, key: string|null) => void;
export type disconnectedType = (UUID: string, followerType: string) => void;
export type addedType = (UUID: string, snapshot: any) => void;
export type readIceCandidateType = (UUID: string, snapshot: any) => void;

//Follower tab functions for dashboardStore
export type tabChangedType = (UUID: string, response: any, key: string) => void;
export type tabRemovedType = (UUID: string, key: string) => void;
export type tabsAddedType = (UUID: string, response: any) => void;