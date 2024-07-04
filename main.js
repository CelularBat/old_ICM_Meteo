// IN THIS PLACE YOU MANUALLY SWITCH BUILD PLATFORM OF FILE 

const _$ANDROID_BUILD = false;

////////////////////////////////////////////////////////
let back;
let __EXPRESS_PORT;

if (_$ANDROID_BUILD){
	 back = require('androidjs').back;
	 __EXPRESS_PORT = 4000;
} else {
	 __EXPRESS_PORT = 3000;
}


const fs = require('fs');
const path = require('path');

const fetch = require('node-fetch'); // This is required for lower version of Node, which is in AndroidJS


const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
        extended: true
    }));

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({
        extended: true
    })) // for parsing application/x-www-form-urlencoded


app.listen(__EXPRESS_PORT, function () {
    console.log('Listening on', JSON.stringify(this.address(), null, 2));
});

app.set('views', __dirname + '/views');
app.use("/lib", express.static(__dirname + "/lib"));
app.use("/assets", express.static(__dirname + "/assets"));


// root
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});


/// SECTION - METEO API
/////////////////////////////////

app.get("/getxy", (req, res) => {

    coordsToXY(req.query.lat, req.query.lon, "2024052218", function (result) {
        res.send(result);
        console.log(result);
    });
});

function coordsToXY(N, E, date = "2024052218", cb_res) {
    var url = `https://old.meteo.pl/um/php/mgram_search.php?NALL=${N}&EALL=${E}&lang=pl`;
    fetch(url, {
        method: 'HEAD',
        redirect: 'manual'
    })
    .then(response => {
        if (response.status >= 300 && response.status < 400) {
            let redirectURL = response.headers.get('location');
            let xyString = redirectURL.match(/&row=\d{2,3}&col=\d{2,3}/);
            console.log(redirectURL);
            cb_res(xyString[0]);

        } else {
            console.log('Response status:', response.status, url);
            console.log('Response did not redirect:', response);
            cb_res("err");
            throw new Error('Response did not redirect, possibly wrong coordinates');
        }
    })
    .catch(error => {
        console.error('Error during fetch:', error);
    });
}

/// SECTION - CONFIG FAVS FILE
/////////////////////////////////

app.get("/getcities", (req, res) => {
	
	// in android build front js file (index.js) sends path to userData directory on android
	// in web app it must be patched for security reason.
	var p; 
	if (_$ANDROID_BUILD ) {
		p = req.query.path;
	} else {
		p = './';
	}
	
    let file_path = path.join(p, 'cities.json');
    let data = readCities(file_path);
    res.json(data);
});

app.get("/addcity", (req, res) => {
    let err = "";
    try {
		
        var p; 
		if (_$ANDROID_BUILD ) {
			p = req.query.path;
		} else {
			p = './';
		}
		
        let file_path = path.join(p, 'cities.json');
        let n = req.query.name;
        let str = req.query.col_str;
        addCityToFile(file_path, n, str);
    } catch (error) {
        err = error;
        console.error(err);
    }

    res.json({
        "status": "ok",
        "err": err
    });
});

app.get("/removecity", (req, res) => {
    let err = "";
    try {
		
        var p; 
		if (_$ANDROID_BUILD ) {
			p = req.query.path;
		} else {
			p = './';
		}
		
        let file_path = path.join(p, 'cities.json');
        let n = req.query.name;
        let str = req.query.col_str;
        removeCityFromFile(file_path, n, str);
    } catch (error) {
        err = error;
        console.error(err);
    }

    res.json({
        "status": "ok",
        "err": err
    });
});

function readCities(file) {
    if (!fs.existsSync(file)) {
        return [];
    }
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
}

function addCityToFile(file, cname, col_str) {
    console.log("AddCityTofile: ", cname, col_str);
    let list = readCities(file);
    list.push({
        "name": cname,
        "str": col_str
    });
    fs.writeFileSync(file, JSON.stringify(list), 'utf8');
}

function removeCityFromFile(file, cname, col_str) {
    let list = readCities(file);
    list = list.filter(list => {
        return (list.name !== cname) && (list.name !== col_str);
    });
    fs.writeFileSync(file, JSON.stringify(list), 'utf8');
}





