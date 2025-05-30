import React from "react";
import LoadingSVG from '../assest/loading.svg'

const LoadingPage = () => {
    return (
        <div className="flex items-center justify-center" style={{ height: "90vh" }}>
            <div>
                <img className="mx-auto h-[150px] mb-3" src={LoadingSVG} alt="loading..." />
                <div className="flex items-center justify-center gap-3">
                    <svg className="size-[25px] rounded-full animate-spin border-[2px] border-primary-400 border-dotted">
                        {/* ... */}
                    </svg>
                    <h2 className="text-xl">Please wait, Loading...</h2>
                </div>
            </div>
        </div>
    );
};



// const express = require("express");
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const app = express();

// const upload = multer({ dest: "uploads/" }); // folder to store videos

// // Upload route
// app.post("/upload", upload.single("video"), (req, res) => {
//     res.send({ message: "Video uploaded!" });
// });

// // Stream route
// app.get("/video/:filename", (req, res) => {
//     const videoPath = path.join(__dirname, "uploads", req.params.filename);
//     const stat = fs.statSync(videoPath);
//     const fileSize = stat.size;
//     const range = req.headers.range;

//     if (range) {
//         const parts = range.replace(/bytes=/, "").split("-");
//         const start = parseInt(parts[0], 10);
//         const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
//         const chunkSize = end - start + 1;
//         const file = fs.createReadStream(videoPath, { start, end });
//         const head = {
//             "Content-Range": `bytes ${start}-${end}/${fileSize}`,
//             "Accept-Ranges": "bytes",
//             "Content-Length": chunkSize,
//             "Content-Type": "video/mp4",
//         };
//         res.writeHead(206, head);
//         file.pipe(res);
//     } else {
//         const head = {
//             "Content-Length": fileSize,
//             "Content-Type": "video/mp4",
//         };
//         res.writeHead(200, head);
//         fs.createReadStream(videoPath).pipe(res);
//     }
// });

// app.listen(3000, () => console.log("Server started on http://localhost:3000"));


export default LoadingPage;