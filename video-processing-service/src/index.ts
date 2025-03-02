import express from "express";
import { setupDirectories, downloadRawVideo, uploadProcessedVideo, convertVideo, deleteRawVideo, deleteProcessedVideo } from "./storage";

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
    let data;
    try {
        if (!req.body.message || !req.body.message.data) {
            throw new Error("Missing message or data in request body");
        }
        const messageData = req.body.message.data;
        const message = Buffer.from(messageData, "base64").toString('utf-8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error("Missing 'name' property in message payload");
        }
    } catch (error) {
        console.error("Error processing video request:", error); // Log the detailed error
        res.status(400).send("Bad request: missing fileName");
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    // Download the raw video from the cloud storage
    await downloadRawVideo(inputFileName);

    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (error) {
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);

        console.error(error);
        res.status(500).send("Interval server error: video processing failed.");
    }

    // upload the processed video to the cloud storage
    await uploadProcessedVideo(outputFileName);

    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    res.status(200).send("Video processed successfully");
}); 

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});

