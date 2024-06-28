//const __LOCALHOST_PORT = 'http://localhost:3000'; //localhost url only needed for AndroidJS
const __LOCALHOST_PORT = '';


// SECTION - FAVORITE LIST //
////////////////////////////

const ulubioneList = document.querySelector('#ListaUlubionych');

function __InitUlubioneElement(e) {
    let name = e.textContent;
    let col_str = e.getAttribute('col_str');
    // init bottstrap
    let tabTrigger = new bootstrap.Tab(e);
    e.addEventListener('click', function (event) {
        event.preventDefault();
        tabTrigger.show();
    });
    // init delete on longpress
    e.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        let response = confirm("Czy na pewno chcesz usunąć " + e.textContent + " z ulubionych?");
        if (response && e) {
            e.remove();
            RemoveCityDB(name, col_str);
        }
    });
    // init load meteogram on click
    e.addEventListener("click", function (event) {
        updateImg(col_str);
    });
}

function InitUlubioneList() {
    let ulubione = Array.from(document.querySelectorAll('#ListaUlubionych a'));
    ulubione.forEach(function (triggerEl) {
        __InitUlubioneElement(triggerEl);
    });
}

function AddUlubione(nazwa, xy_string) {
    newFav = Object.assign(document.createElement('a'), {
        className: 'list-group-item list-group-item-action'
    });
    newFav.setAttribute('data-bs-toggle', 'list');
    newFav.setAttribute('col_str', xy_string);
    newFav.textContent = nazwa;

    ulubioneList.appendChild(newFav);
    __InitUlubioneElement(newFav);

}

InitUlubioneList();


// SECTION - SEARCH AND ADD NEW CITY//
////////////////////////////
const overlay = document.querySelector('#overlay_search');
const btn_dodaj = document.querySelector('#dodajMiejsce');
const search_input = document.querySelector('#search_input');
const centeredDiv = document.querySelector('#search-div');

//search location ,return list of cities as JSON
async function SearchPlace(placeString) {
    try {
        const fetchOptions = {
            headers: {
                'Accept-Language': 'pl-PL, pl',
                'Content-Type': 'application/json'
            }
        };
        let response = await fetch(`https://geoapi.meteo.digital/geo/search.php?q=${placeString}&format=json&various_place=city&limit=7`, fetchOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } else {
            let data = await response.json();
            let resList = [];
            for (let idx in data) {
                let j = {
                    name: data[idx].display_name,
                    lat: data[idx].lat,
                    lon: data[idx].lon,
                    type: data[idx].class
                };
                resList.push(j);
            }
            console.log(resList);
            return resList;

        }
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// click location and add it to favs
function li_onClick(name, lat, lon) {
    console.log("click");
    let response = confirm("Dodać: " + name + "?");
    if (response) {
        let a = name.split(",");
        let short_name = a[0] + ', ' + a[1];
        /*
        front.send("getxy",[ lat, lon ]);
        await_getxy_res( function(res){
        AddUlubione(short_name,res);
        console.log("added: ",short_name,res);
        });
         */
        express_getxy_res(lat, lon, function (res) {
            if (res !== "err") {
                AddUlubione(short_name, res);
                console.log("added: ", short_name, res);
                AddCityDB(short_name, res); //safe to file
            } else {
                alert("Przepraszamy, to miejsce jest poza zasięgiem modelu!");
            }

        });
    }
}

// search location - GUI
async function startSearch() {
    cleanList(); //clean old list

    let results = await SearchPlace(search_input.value);
    if (results.length > 0) {
        const dropdownDiv = document.createElement('div');
        dropdownDiv.className = 'dropdown';
        const ul = document.createElement('ul');

        for (let idx in results) {

            let li = document.createElement('li');
            li.textContent = results[idx].name;
            ul.appendChild(li);
            // funkcja dodająca
            li.addEventListener("click", () => {
                li_onClick(results[idx].name, results[idx].lat, results[idx].lon)
            });
        }
        dropdownDiv.appendChild(ul);
        centeredDiv.appendChild(dropdownDiv);
    }
};

// spawn overlay with search box
btn_dodaj.addEventListener("click", function () {
    overlay.style.display = "flex";
});

// clean location list (previous search result)
function cleanList() {
    let dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        let listItems = dropdown.querySelectorAll('li');
        listItems.forEach(function (item) {
            item.remove();
        });
        dropdown.remove();
    }
}

// red dot X button - function assigned in html
function closeOverlay() {
    overlay.style.display = 'none';
    cleanList();
}




/////// old front pipe API
// not used anymore
/*
var _getxy_res = "";
var _getxy_waitingFlag = false; //true on new data

front.on("getxy_res", function (res) {
    _getxy_res = res;
    _getxy_waitingFlag = true;
})

function await_getxy_res(callback) {
    const interval = setInterval(function () {
        if (_getxy_waitingFlag) {
            clearInterval(interval);
            _getxy_waitingFlag = false;
            callback(_getxy_res);
        }
    }, 50);
}
*/

// Replaced with express
function express_getxy_res(lt, ln, callback) {
    let url = `${__LOCALHOST_PORT}/getxy?lat=${lt}&lon=${ln}`;
    fetch(url)
    .then(res => {
        if (!res.ok) {
            alert("Internal communication error!");
        }
        return res.text();

    })
    .then(res => {
        callback(res);
    })
    .catch((err) => {
        alert(err);
        alert(url)
    });
}

// SECTION - INFO AND SETTINGS //
////////////////////////////

const btn_info = document.querySelector('#Ustawienia');
const overlay_info = document.querySelector('#overlay_settings');

btn_info.addEventListener("click",function(){
	overlay_info.style.display = 'flex';
});

// red dot X button - function assigned in html
function closeOverlay2() {
    overlay_info.style.display = 'none';
}


// SECTION - UPDATE METEOGRAM //
////////////////////////////
const meteo = document.querySelector('#Meteogram');

function updateImg(xy_string) {
    getCurrentDate((err, date) => {
        if (err) {
            alert(err);
            return
        };
        let url = "https://www.meteo.pl/um/metco/mgram_pict.php?ntype=0u" + "&fdate=" + date + xy_string + "&lang=pl";
        meteo.src = url;
    });

};

function getCurrentDate(callback) {
    fetch('https://worldtimeapi.org/api/timezone/Poland')
    .then(response => response.json())
    .then(function (response) {
        let d = response.datetime;
        let d2 = d.slice(0, 10);
        d2 = d2.replace(/\-/g, "");
        let t = d.slice(11, 13);
        var tint = parseInt(t);
        var dint = parseInt(d2);

        if (tint < 6) {
            dint = dint - 1;
            t = '12';
        } else if (tint < 12) {
            dint = dint - 1;
            t = '18';
        } else if (tint < 18) {
            t = '00';
        } else {
            t = '06';
        }

        let data_str = dint + t;
        console.log(data_str);
        callback(null, data_str);
    })
    .catch(error => callback(error))
}


// SECTION - BUTTONS GUI /////////////
////////////////////////////

var _meteo_zoom = false;
meteo.addEventListener("dblclick", function () {
    if (_meteo_zoom) {
        meteo.classList.remove('col-sm-12');
        meteo.classList.add('col-sm-7');
        meteo.style.position = 'inherit';
        setTimeout(() => {
            _meteo_zoom = false
        }, 500);

    } else {
        meteo.classList.remove('col-sm-7');
        meteo.classList.add('col-sm-12');
        meteo.style.position = 'fixed';
		meteo.style.left = '0';
        setTimeout(() => {
            _meteo_zoom = true
        }, 500);
    }

});

// LEGENDA 

const btn_schowajLegende = document.querySelector('#Schowaj');
const Legenda = document.querySelector('#Legenda');

var _legenda_visibility_state = true;

function przelacz_legende(){
			_legenda_visibility_state = !_legenda_visibility_state;
		if (_legenda_visibility_state) {
			Legenda.style.display = 'block';
			btn_schowajLegende.innerText = "Schowaj Legendę";
		} else {
			Legenda.style.display = 'none';
			btn_schowajLegende.innerText = "Pokaż Legendę";
		}	
}

btn_schowajLegende.addEventListener("click", function (event) {
		przelacz_legende();
    });

// SECTION - SAVING SETTINGS //
////////////////////////////


function __getpath() {
    let p = "";
    try {
        p = app.getPath('userData');
    } catch {
        p = "./"
    }
    return p;
}

function LoadCitiesDB() {
    let p = __getpath();
    console.log(p);
    let url = `${__LOCALHOST_PORT}/getcities?path=${p}`;
    fetch(url)
    .then(res => {
        if (!res.ok) {
            alert("Internal communication error!");
        }
        return res.json();
    })
    .then(data => {
        if (!data) {
            alert("Empty data");
        }
        data.forEach(function (e) {
            AddUlubione(e.name, e.str);

        });
        __g_cities_loaded = true;
    })
    .catch(err => {
        //alert("LoadCitiesDB: "+err);
        return false;

    });
};

function AddCityDB(name, col_str) {
    let p = __getpath();
    let url = `${__LOCALHOST_PORT}/addcity?path=${p}&name=${name}&col_str=${ encodeURIComponent(col_str) }`;
    console.log("AddCityDB : ", url);

    fetch(url)
    .then(res => {
        if (!res.ok) {
            alert("Internal communication error!");
        }
        return res.json();

    })
    .then(data => {
        if (data.err) {
            alert("Err" + data.err);
        }

    })
    .catch(err => alert("AddCityDB: " + err));
}

function RemoveCityDB(name, col_str) {
    let p = __getpath();
    let url = `${__LOCALHOST_PORT}/removecity?path=${p}&name=${name}&col_str=${ encodeURIComponent(col_str) }`;
    console.log("RemoveCityDB : ", url);

    fetch(url)
    .then(res => {
        if (!res.ok) {
            alert("Internal communication error!");
        }
        return res.json();

    })
    .then(data => {
        if (data.err) {
            alert("Err" + data.err);
        }

    })
    .catch(err => alert("RemoveCityDB: " + err));
}

// SECTION - RUN ON STARTUP
////////////////////////////////////////////////////////
przelacz_legende();

// Miejscowość testowa
AddUlubione("Testowy", "&row=402&col=178"); //test

// ładowanie zapisanych miejsc; kompensuje opóźnienie wystartowania serwera NodeJS na Androidzie
var __g_cities_loaded = false;
setTimeout(() => {
    LoadCitiesDB();
}, 1000);

setTimeout(() => {
    if (!__g_cities_loaded) {
        LoadCitiesDB();
    };
}, 6000);

setTimeout(() => {
    if (!__g_cities_loaded) {
        LoadCitiesDB();
    };
}, 10000);


