# Client for Old ICM Meteo

This is a lightweight client for Polish meteo service: https://old.meteo.pl/. 
NodeJS Web App or Android (.apk)

 - It serves actual meteorograms for defined locations in Poland and neighboarhood countries. 
 - It is optimised to download minimal amount of data required to work. So it is very lightweight for API.
 -  With extended search option you can add any, even the smallest village to your favorite list.
 - Using experimental technology to be both Web App and Android App. Created in NodeJS, using [androidJS](https://android-js.github.io/) for compiling to .apk

# Web Preview

https://old-icm-meteo.onrender.com/

## Instruction for Web App
use web-only branch

    npm install
    npm run dev

## Instruction for Android App
Use Android branch

    npm install

Install androidjs builder:

    npm install -g androidjs-builder

Update SDK:

    androidjs update

Build .apk with

    androidjs build

or

    androidjs build --release

as described here:
https://android-js.github.io/docs/packaging_app.html




