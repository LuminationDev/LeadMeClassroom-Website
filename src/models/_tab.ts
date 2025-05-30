class Tab {
    name: string;
    favicon: string;
    url: string;
    id: string;
    index: number;
    windowId: number;
    lastActivated?: number;
    closing: boolean = false;
    audible: boolean = false;
    muted: boolean = false;
    muting: boolean = false;

    constructor(id: string, index: number, windowId: number, name: string, favicon: string, url: string, lastActivated: number = Date.now()) {
        this.favicon = favicon;
        this.url = url;
        this.name = name;
        this.id = id;
        this.index = index;
        this.windowId = windowId;
        this.lastActivated = lastActivated
    }

    getTabUrlWithoutHttp()
    {
        return this.url.replace("https://", "").replace("http://", "")
    }

    getFavicon()
    {

        if (this.url.startsWith("chrome://") && (!this.favicon || (this.favicon && !this.favicon.length))) {
            return "https://www.google.com/favicon.ico"
        }
        return this.favicon
    }

    getCleanTabName(): string {
        // Regular expression to match parentheses and their contents
        const regex = /\s?\(\d+\)\s?/g;

        // Replace all occurrences of the matched pattern with an empty string
        return this.name.replace(regex, '');
    }

    getDomainFromLink(): string | null {
        try {
            const url = new URL(this.url);

            let hostname = url.hostname;

            // Remove "www." from the start of the domain name if it exists
            if (hostname.startsWith('www.')) {
                hostname = hostname.slice(4);
            }

            return hostname;
        } catch (error) {
            console.error('Error parsing the URL:', error);
            return null;
        }
    }
}

export default Tab;