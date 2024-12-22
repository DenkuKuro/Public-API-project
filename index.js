import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const title = 'Attack on titan';
const baseURl = 'https://api.mangadex.org';

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    try {
        const getManga = await axios.get(baseURl + "/manga/", {
            params: {
                title: title,
            },
        });
        const manga = getManga.data.data.find( (value) => {
                return value.attributes.title.en.toLowerCase() === title.toLowerCase();
            }
        );
        let volumeCover;
        let page = 0;
        let mangaCovers = await axios.get(baseURl + "/cover/", {
            params: {
                limit: 10,
                offset: 0,
                "manga[]": manga.id,
            },
        });
        let pageTotal = mangaCovers.data.total;  
        while (page  < pageTotal) {
            try {
                mangaCovers = await axios.get(baseURl + "/cover/", {
                    params: {
                        limit: 10,
                        offset: page,
                        "manga[]": manga.id,
                    },
                });
                volumeCover = mangaCovers.data.data.find( (value) => {
                    return value.attributes.volume === "1";
                });
                if (volumeCover !== undefined && volumeCover.attributes.volume === "1") break;
            } catch (error) {
                console.error("Failed to make request for cover: ", error.message);
            }
            page += 10;
        }
        const mangaVolumes = manga.attributes.lastVolume;
        const coverFileName = volumeCover.attributes.fileName;
        const coverArt = `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.256.jpg`;
        res.render("index.ejs", { coverArt, volumes: mangaVolumes });
    } catch (error) {
        console.error("Failed to make request:", error.message);
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});