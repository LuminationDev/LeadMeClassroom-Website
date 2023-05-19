class CuratedContentItem {
    title: string;
    description: string;
    type: string;
    link: string;
    years: string;
    subjects: string;
    topics: string;
    live: string;

    constructor(title: string, description: string, type: string, link: string, years: string, subjects: string, topics: string, live: string) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.link = link;
        this.years = years;
        this.subjects = subjects;
        this.topics = topics;
        this.live = live;
    }

    getTitle = () => {
        return this.title;
    }

    getDescription = () => {
        return this.description;
    }

    getType = () => {
        if(this.type === "YOUTUBE") {
            return "Video";
        } else if(this.type === "LINK") {
            return "Website";
        } else {
            return "Website";
        }
    }

    getLink = () => {
        return this.link;
    }

    getYears = () => {
        return this.years;
    }

    getSubjects = () => {
        return this.subjects;
    }

    getTopics = () => {
        return this.topics;
    }

    getLive = () => {
        return this.live;
    }
}

export default CuratedContentItem;