import { Map } from "./map.js";
import { Layers } from "./layers.js";
import { Markers } from "./markers.js";
import { Icons } from "./icons.js";

let map = new Map();

Layers.init(map)
    .then(Icons.init)
    .then(Markers.init);





window.saveloading = false;
window.mapref = map;
window.mapmarkers = Markers;

var blBar = document.createElement("div");
blBar.className = "leaflet-bar leaflet-control";
blBar.style = "width:250px;";


var inputElem = document.createElement("input");
inputElem.style = "width:100px;";
inputElem.type = "file";
inputElem.onchange = function () { window.loadSavefile(); };
blBar.appendChild(inputElem);

var toggleButton = document.createElement("a");
toggleButton.href = "#";
toggleButton.style = "width:100px;";
toggleButton.innerText = "Toggle found visible";
toggleButton.onclick = function () { window.toggleFoundVisible(); };
blBar.appendChild(toggleButton);

$('div[class="leaflet-bottom leaflet-left"]')[0].appendChild(blBar);

window.toggleFoundVisible = function (){
	if(document.styleSheets[1].rules[2].style.visibility == "") { document.styleSheets[1].rules[2].style.visibility = "hidden" } else { document.styleSheets[1].rules[2].style.visibility = "" }
}



window.markItemFound = function (id) {
	var elems = $('img[alt="' + id + '"]');
	var x;
	for(x=0; x<elems.length; x++) {
		elems[x].classList.add('found');
	}
}

window.loadSavefile = function () {
    let file = $('input[type=file]')[0].files[0];
    let self = this;
    let ready = false;
    let result = '';

    const sleep = function (ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    self.readAsText = async function() {
        while (ready === false) {
          await sleep(100);
        }
        return result;
    }    

    const reader = new FileReader();
    reader.onloadend = function(evt) {
        result = evt.target.result;
	var chests = result.split("/Game/FirstPersonBP/Maps/Map.Map:PersistentLevel.Chest");
	chests.shift();
	var x;
	for (x=0; x<chests.length; x++) {
	    chests[x] = "Chest" + chests[x].split("/")[0].split("\x00", 2)[0].split("_")[0];
	    window.markItemFound(chests[x]);
        };
        var coins = result.split("/Game/FirstPersonBP/Maps/Map.Map:PersistentLevel.Coin");
        coins.shift();
        var x;
        for (x = 0; x < coins.length; x++) {
            coins[x] = "Coin" + coins[x].split("/")[0].split("\x00", 2)[0].split("_")[0];
            window.markItemFound(coins[x]);
        };
        var physicalCoin = result.split("/Game/FirstPersonBP/Maps/Map.Map:PersistentLevel.PhysicalCoin");
        physicalCoin.shift();

        ready = true;
    };

    reader.readAsText(file, 'latin1');
  }