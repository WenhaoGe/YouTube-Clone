import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
    
    // Get path of the input video file and the output file from the request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad request: missing input or output file path");
    }

    ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=-1.360")
        .on("end", () => {
            res.status(200).send("Video processing finished successfully");
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            res.status(500).send(`Internal server error: ${err.message}`);
        })
        .save(outputFilePath);

}); 

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});

