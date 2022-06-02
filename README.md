# photoarchive

## Prerequisites

-   exiftool
-   rsync
-   node

## Install

Copy `src/photoarchive.js` to some location on your `PATH` and drop the `.js` extension. I have a `~/bin` directory where I put all my own scripts. Make sure it is executable. e.g.

```sh
cp src/photoarchive.js ~/bin/photoarchive
chmod 777 ~/bin/photoarchive
```

## Execute

Make a temporary directory somewhere, I like to always call them either `tmp`, or `junk`, or `test` to indicate that this can be deleted any time you come across a directory with one of these names in case i accidentally leave them for future me to deal with. Then create a `src` dir inside of that.

```sh
mkdir junk
cd junk
mkdir src
```

Now copy your image/video files and sub-directories into `src` by whatever means you choose. e.g. When I want to backup my phone photos and video I would do ...

```sh
cd src
adb pull /sdcard/DCIM
adb pull /sdcard/Pictures # Note some apps seem to put them in this folder
```

The data in src folder can be in any structure. The script will recursively run through all sub-directories.

Now back in our original directory, i.e. the one containing our `src` directory of files we run ...

```sh
photoarchive <output_dir>
```

`output_dir` is your destination directory where your photos are all stored in `YYYY/MM/DD` directory structure format. For me that is a pictures sub-directory on an external hard-drive. So e.g.

```sh
photoarchive /media/ken/PHOTOSMAIN/pictures
```

The script will run through all of the files in `src` recursively. Anything in which it finds a date in the metadata it will create the appropriate `YYYY/MM/DD` directory structure and THEN will `rsync` the files over to `output_dir`. NOTE: `exiftool` has a `-o` option that I feel like _should_ make the `rsync` not required but, as of the time of this writing anyway, seems to be ignored and will only copy files to the directory in which you are running the tool from.

Now anything where the metadata date does not exist, like some video files, `exiftool` will just copy those files to our root directory. But then this script will try and extract the date from the filename following some standard patterns. If at the end there are files directly in our root directory, then these will have to be managed by hand. Copy them over to your `output_dir` as you see fit.

Then finally we can completely delete our root directory as we have backed up the files. e.g.

```
rm -rf junk
```
