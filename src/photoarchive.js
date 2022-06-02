#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
// const cla = require("command-line-args");

function isIntValue(value, length) {
    const regex = new RegExp(/^\d+$/);
    if (!regex.test(value)) {
        return false;
    }

    return value.length === length;
}

// const argDefs = [
//     // {
//     //     // defv stands for Date Extractor Function Version
//     //     name: "defv",
//     //     alias: "d",
//     //     type: Number,
//     // },
//     {
//         name: "dryrun",
//         alias: "n",
//         type: Boolean,
//         defaultValue: false,
//     },
//     {
//         name: "output",
//         alias: "o",
//         type: Boolean,
//         defaultOption: true,
//         required: true,
//     },
// ];

// const options = cla(argDefs);
// const outputdir = options.output;

if (process.argv.length <= 2) {
    console.error("Must supply an output directory.");
    process.exit(1);
}
const outputdir = process.argv[2];

const SRC_DIR = "src";

//
// Many files from my devices come in the form of <prefix>_YYYYMMDD_<rest of filename>
// So this I'm calling version1 and making it the default.
//
function parseDate(date) {
    if (isIntValue(date, 8)) {
        return {
            year: date.slice(0, 4),
            month: date.slice(4, 6),
            day: date.slice(6),
        };
    }
    return null;
}

// function dateFromFilenameI(filename, si) {
//     return parseDate(filename.slice(si, filename.indexOf("_", si + 1)));
// }

// const dateExtractorFns = [];
// dateExtractorFns[1] = (filename) => {
//     return dateFromFilenameI(filename, 0);
// };

// dateExtractorFns[2] = (filename) => {
//     return dateFromFilenameI(filename, filename.indexOf("_") + 1);
// };

function dateFromFilename(filename) {
    let startIndex = 0;
    let endIndex = filename.indexOf("_");
    let date = null;
    while (date === null && endIndex > 0) {
        date = parseDate(filename.slice(startIndex, endIndex));
        startIndex = endIndex + 1;
        endIndex = filename.indexOf("_", startIndex);
    }
    return date;
}

// //
// // Treat it as a case in which we are just using filename to extract dates.
// //
// if (options.defv) {
//     console.error("Must supply one of -d or -m");
//     process.exit(1);
// }

if (!fs.statSync(SRC_DIR).isDirectory()) {
    console.error("Must have a 'src' directory with your files in it");
    process.exit(1);
}

// const rootOutputDir = "/media/ken/PHOTOSMAIN/pictures";

const cpCmd = `exiftool -o . -r '-Directory<DateTimeOriginal' -d %Y/%m/%d ${SRC_DIR}`;
cp.execSync(cpCmd);

//
// Now loop through the newly extracted files. Directories of type YYYY we rsync with our output.
// Files, we look to see if we can get the date from the filename, if so we move them to our output dir
// otherwise we leave them behind to deal with manually.
//
fs.readdirSync(".").forEach((filename) => {
    if (filename === SRC_DIR) {
        return;
    }

    if (fs.statSync(filename).isDirectory()) {
        if (isIntValue(filename, 4)) {
            const rsyncCmod = `rsync -av ${filename}/ ${outputdir}/${filename}`;
            cp.execSync(rsyncCmd);
        } else {
            console.log(
                `WARNING: Directory [${filename}] ignored because not in YYYY format.`
            );
        }
    } else {
        const date = dateFromFilename(filename);
        let od = path.join(outputdir, date.year, date.month, date.day);

        fs.mkdirSync(od, { recursive: true });
        fs.cpSync(filename, path.join(od, filename), { errorOnExist: true });
        fs.rmSync(filename);
    }
});

// const walkSync = function (dir, fnc) {
//     fs.readdirSync(dir).forEach((filename) => {
//         const fullpath = path.join(dir, filename);
//         if (fs.statSync(fullpath).isDirectory()) {
//             walkSync(fullpath, fnc);
//         } else {
//             fnc(dir, filename, fullpath);
//         }
//     });
// };

// const errorOutputDir = "/home/ken/tmp/cpphotos_errors";

// walkSync(".", (dir, filename, fullpath) => {
//     let outputDir;
//     let outputFile;
//     try {
//         const date = dateExtractorFns[options.defv](filename);
//         outputDir = path.join(outputdir, date.year, date.month, date.day);
//         // console.log(filename, date.year, date.month, date.day);
//     } catch (ex) {
//         console.error(fullpath, ex.message ? ex.message : ex);
//         outputDir = path.join(errorOutputDir, dir);
//         console.log(`Making directory ${outputDir}`);
//     }
//     outputFile = path.join(outputDir, filename);
//     console.log(`Copying file [${fullpath}] to [${outputFile}]`);

//     fs.mkdirSync(outputDir, { recursive: true });
//     fs.cpSync(fullpath, outputFile, { errorOnExist: true });
// });
