// GCS file interactions
// local file interactions

import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";


const storage = new Storage();
const rawVideoBucketName = "wenhao-raw-videos";
const processedVideoBucketName = "wenhao-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";


export function setupDirectories() {

    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

export function convertVideo(rawVideoName: string, processedVideoName: string) {

    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360")
        .on("end", () => {
            console.log("Video processing finished successfully");
            resolve();
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });

}

/**
 * 
 * @param fileName - the name of the file to download from
 * @returns a Promise that resolves when the file has been downloaded
 */

export async function downloadRawVideo(fileName: string) {

    await storage.bucket(rawVideoBucketName).file(fileName).download({
        destination: `${localRawVideoPath}/${fileName}`});
    
    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`);
}

/**
 * 
 * @param fileName - the name of the file to upload to
 * @returns a Promise that resolves when the file has been uploaded
 */
export async function uploadProcessedVideo(fileName: string) {

    const bucket = storage.bucket(processedVideoBucketName);
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, { 
        destination: fileName
    });

    console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`);
    await bucket.file(fileName).makePublic();
}

export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * 
 * @param filePath - the path of the file to delete
 * @returns a Promise that resolves when the file has been deleted
 */
function deleteFile(filePath: string): Promise<void> {

    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete file: ${err.message}`);
                    console.log(JSON.stringify(err));
                    reject(err);
                } else {
                    console.log(`File ${filePath} deleted successfully`);
                    resolve();
                }
            });
        } else {
            console.log(`File ${filePath} does not exist. Skipping deletion.`);
            resolve();
        }
    });
}

function ensureDirectoryExistence(directoryPath: string) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
        console.log(`Directory ${directoryPath} created successfully`);
    }
}
