//Load in the Google sheets data for the curated content
import { CuratedContentItem } from "@/models";
import axios from "axios";

const apiKey = import.meta.env.VITE_SHEETS_API_KEY;
const spreadsheetId = import.meta.env.VITE_SHEETS_ID;
const range = 'Sheet1!A1:H100'; // Replace with your desired sheet name and range
const request = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${range}&key=${apiKey}`;

const convertValuesToModel = (values: any[][]): CuratedContentItem[] => {
    //Remove the description row
    const valuesToConvert = values.slice(1);

    return valuesToConvert.map(([title, description, type, link, years, subjects, topics, live]) =>
        new CuratedContentItem(title, description, type, link, years, subjects, topics, live)
    );
}

/**
 * Perform a request to the sheets API, querying for the curated content data rows. Convert the result into an array
 * of CuratedContentItems or return an empty array.
 */
export const getCuratedContentData = async (): Promise<CuratedContentItem[]> => {
    return await axios.get(request).then((res) => {
        return convertValuesToModel(res.data.valueRanges[0].values);
    }).catch(error => {
        console.log(error);
        return [];
    });
}

/**
 * Perform a request to get data from a supplied URL. A file reader wrapped in a promise will return the blob data or
 * the rejection error.
 * @param url A string of the url to request from.
 */
export const toDataURL = (url: string) => fetch(url)
    .then(response =>  response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }));
