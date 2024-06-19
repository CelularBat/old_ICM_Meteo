This is a lightweight Web/Android client for Polish meteo service: https://old.meteo.pl/ . It serves current meteorograms for defined locations in Poland and neighboarhood countries. 
It is optimised to download minimal amount of data required to work, so it is lightweight for API. GUI is simple. With extended search option you can add any, even the smallest village to your favorite list.

Instruction:

Double click on meteogram for full screen graph mode. Double click to undo.
Long press on favorited city to remove it from the list.


Building:

I've made this APP as my first try to make Android Application in NodeJS. It uses https://android-js.github.io/ for this purpose. 

Build instruction:

Install required packets:

npm install

For Web App:
npm run dev

For Android Add:

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



Tips I've learned about androidjs:




