import { Map } from "./map.js";
import { Layers } from "./layers.js";
import { Markers } from "./markers.js";
import { Icons } from "./icons.js";

let map = new Map();

Layers.init(map)
    .then(Icons.init)
    .then(Markers.init);







window.mapref = map;
window.mapmarkers = Markers;

var blBar = document.createElement("div");
blBar.className = "leaflet-bar leaflet-control";
blBar.style = "width:250px;";

var loadButton = document.createElement("a");
loadButton.href = "#";
loadButton.style = "width:100px;";
loadButton.innerText = "Load savefile";
loadButton.onclick = function () { window.promptToLoadSave(); };
blBar.appendChild(loadButton);

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

window.loadChestData = async function () {
	var [savefile] = await window.showOpenFilePicker();
	var thefile = await savefile.getFile();
	var thecontents = await thefile.arrayBuffer();
	var thetext = new TextDecoder("latin1").decode(thecontents);
	var chests = thetext.split("/Game/FirstPersonBP/Maps/Map.Map:PersistentLevel.Chest");
	chests.shift();
	var x;
	for (x=0; x<chests.length; x++) {
	    chests[x] = "Chest" + chests[x].split("/")[0].split("\x00", 2)[0].split("_")[0];
	};
	return chests;
}

window.promptToLoadSave = async function () {
	var openedChests = await window.loadChestData();
	var x;
	for (x=0; x<openedChests.length; x++) {
		window.markItemFound(openedChests[x]);
	};
}

window.markItemFound = function (id) {
	var elems = $('img[alt="' + id + '"]');
	var x;
	for(x=0; x<elems.length; x++) {
		elems[x].classList.add('found');
	}
}