class Video {
    id: string;
    name: string;
    duration: string;
    lastActivated?: number;

    constructor(id: string, name: string, duration: string, lastActivated: number = Date.now()) {
        this.id = id;
        this.name = name;
        this.duration = duration;
        this.lastActivated = lastActivated
    }

    getName = () => {
        return this.name;
    }

    getDuration = () => {
        return this.duration;
    }
}

export default Video;