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
blBar.style = "width:150px; border:none;";

var saveInfoButton = document.createElement("a");
saveInfoButton.class = "button";
saveInfoButton.href = "#saveInfoPopup";
saveInfoButton.style = "width:150px;";
saveInfoButton.innerText = "Savefile Instructions";
//toggleButton.onclick = function () {  };
blBar.appendChild(saveInfoButton);

var inputElem = document.createElement("input");
inputElem.style = "width:150px;color:transparent;";
inputElem.type = "file";
inputElem.onchange = function () { window.loadSaveFile(); };
blBar.appendChild(inputElem);

var toggleButton = document.createElement("a");
toggleButton.href = "#";
toggleButton.style = "width:150px;";
toggleButton.innerText = "Toggle found visible";
toggleButton.onclick = function () { window.toggleFoundVisible(); };
blBar.appendChild(toggleButton);

var shareURLButton = document.createElement("a");
shareURLButton.href = "#";
shareURLButton.style = "width:150px;";
shareURLButton.innerText = "Share Map View";
shareURLButton.onclick = function () { window.showSharableURL(); };
blBar.appendChild(shareURLButton);


$('div[class="leaflet-bottom leaflet-left"]')[0].appendChild(blBar);


window.toggleFoundVisible = function (){
	if(document.styleSheets[1].rules[2].style.visibility == "") { document.styleSheets[1].rules[2].style.visibility = "hidden" } else { document.styleSheets[1].rules[2].style.visibility = "" }
}



window.markItemFound = function (id) {
	//if(id.startsWith("Coin")) { console.log(id); };
	var elems = $('img[alt="' + id + '"]');
	var x;
	for(x=0; x<elems.length; x++) {
		elems[x].classList.add('found');
	}
	//if(id.startsWith("Coin")) { console.log(elems.length); };
	elems = $('img[alt="' + id.split("_").shift() + '"]');
	for(x=0; x<elems.length; x++) {
		elems[x].classList.add('found');
	}
	//if(id.startsWith("Coin")) { console.log(elems.length); };
}



window.loadSaveFile = function () {
    let file = $('input[type=file]')[0].files[0];
    $('input[type=file]')[0].value = null;
    let self = this;
    let ready = false;
    let result = '';

    const sleep = function (ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    self.readAsArrayBuffer = async function() {
        while (ready === false) {
          await sleep(100);
        }
        return result;
    }    

    const reader = new FileReader();
    reader.onloadend = function(evt) {
        result = evt.target.result;

//==================================================


	window.loadedSave = new UESaveObject(result);
	console.log(window.loadedSave);
	var theProps = Array("ThingsToRemove", "ThingsToActivate", "ThingsToOpenForever");
	var toProcess;
	var el;
	var i;
	var x;
	for( i = 0; i < theProps.length; i++ ){
		toProcess = loadedSave.Properties.find(function (x) { return x.name==theProps[i] }).value.value;
		for( x = 0; x < toProcess.length; x++ ){
			el = toProcess[x].split(".").pop();
			if ( el != "None" ){ markItemFound(el) };
		}
	}


//==================================================

        ready = true;
    };

    reader.readAsArrayBuffer(file);
    
}





class UESaveObject {
	constructor(binstr) {
		var x;
		var r = new UEReadHelper(binstr);
		r.pos = 4;
		window.tempr = r;
		this.SaveGameVersion = r.getInt32();
		this.PackageVersion = r.getInt32();
		this.EngineVersion_Major = r.getInt16();
		this.EngineVersion_Minor = r.getInt16();
		this.EngineVersion_Patch = r.getInt16();
		this.EngineVersion_Build = r.getInt32();
		this.EngineVersion_BuildId = r.getString();
		this.cfVersion = r.getInt32();
		this.cfData_Count = r.getInt32();
		this.cfData_Entries = [];
			for(x=0;x<this.cfData_Count;x++) {
				this.cfData_Entries[x] = { id: r.getGuid(), value: r.getInt32()};
			}
		this.SaveGameType = r.getString();
		this.Properties = [];
		for(x=0;true;x++) {
			this.Properties[x] = r.getNextProperty();
			if(this.Properties[x].name=="EOF"){ break; };
		}
	}
	
}

class UEReadHelper {
	constructor(binstr) {
		this.src = new TextDecoder("latin1").decode(binstr);
		this.rdr = new DataView(binstr);
		this.pos = 4;
	}

	peekInt8 () { return this.rdr.getInt8(this.pos, true); };
	peekUint8 () { return this.rdr.getUint8(this.pos, true); };
	peekInt16 () { return this.rdr.getInt16(this.pos, true); };
	peekUint16 () { return this.rdr.getUint16(this.pos, true); };
	peekInt32 () { return this.rdr.getInt32(this.pos, true); };
	peekUint32 () { return this.rdr.getUint32(this.pos, true); };
	peekFloat32 () { return this.rdr.getFloat32(this.pos, true); };
	peekFloat64 () { return this.rdr.getFloat64(this.pos, true); };
	peekInt64 () { return Number(this.rdr.getBigInt64(this.pos, true)); };
	peekUint64 () { return Number(this.rdr.getBigUint64(this.pos, true)); };
	peekString() { return this.src.substring(this.pos + 4, this.pos + this.peekInt32() + 3); };
	peekString64() { return this.src.substring(this.pos + 8, this.pos + this.peekInt64() + 7); };
	peekStringCustom(cnt) { return this.src.substring(this.pos + 4, this.pos + cnt + 3); };
	peekString64Custom(cnt) { return this.src.substring(this.pos + 8, this.pos + cnt + 7); };
	peekGuid() { 
		var tpos = this.pos;
		var byteorder = [3,2,1,0,5,4,7,6,8,9,10,11,12,13,14,15];
		var g = "";
		var gidx;
		for(gidx=0;gidx<16;gidx++) {
			this.pos = tpos + byteorder[gidx];
			g = g + ('0' + this.peekUint8().toString(16).toUpperCase()).slice(-2);
		}
		this.pos = tpos;
		return '{' + g.substr(0,8) + '-' + g.substr(8,4) + '-' + g.substr(12,4) + '-' + g.substr(16,4) + '-' + g.substr(20) + '}';
	}



	getInt8 () { var z = this.peekInt8(); this.pos +=1; return z };
	getUint8 () { var z = this.peekUint8(); this.pos +=1; return z };
	getInt16 () { var z = this.peekInt16(); this.pos +=2; return z };
	getUint16 () { var z = this.peekUint16(); this.pos +=2; return z };
	getInt32 () { var z = this.peekInt32(); this.pos +=4; return z };
	getUint32 () { var z = this.peekUint32(); this.pos +=4; return z };
	getFloat32 () { var z = this.peekFloat32(); this.pos +=4; return z };
	getFloat64 () { var z = this.peekFloat64(); this.pos +=8; return z };
	getInt64 () { var z = this.peekInt64(); this.pos +=8; return z };
	getUint64 () { var z = this.peekUint64(); this.pos +=8; return z };
	getString () { var z = this.peekString(); this.pos += this.peekInt32() + 4; return z };
	getString64() { var z = this.peekString64(); this.pos += this.peekInt64() + 8; return z; };
	getStringCustom(cnt) { var z = this.peekStringCustom(cnt); this.pos += cnt + 4; return z; };
	getString64Custom(cnt) { var z = this.peekString64Custom(cnt); this.pos += cnt + 8; return z; };
	getGuid () { var z = this.peekGuid(); this.pos += 16; return z; }

	getNextProperty() {
		//console.log( "pos " + this.pos + "    len " + this.src.length );
		if(this.peekInt32()==0) { return {name: "EOF" } };
		var retVal = { name: this.getString() };
		if(retVal.name == null) { return null; };
		if(retVal.name == "None") { 
			retVal.length = 0;
			retVal.value = null;
			return retVal;
		}
		var tpos = this.pos;
		retVal.type = this.getString();
		if(retVal.type == "None") { return {name: "EOF" } };
		if(retVal.type.includes("::")) { this.pos = tpos + 1; retVal.type = this.getString(); return retVal; };
		retVal.length = this.getInt64();
		retVal.value = this.getValueByType(retVal.type, retVal.length);
		return retVal;
	}

	getValueByType(type, overlen){
		var retVal = {};
		var tCheck = 0;
		switch(type){
			case "ArrayProperty":
				retVal.innerType = this.getString();
				tCheck = this.getInt8(); //if not=0 then something's wrong.  tbi
				retVal.count = this.getInt32();
				retVal.value = [];
				var x = 0;
				switch(retVal.innerType) {
					case "ObjectProperty":
						for(x=0;x<retVal.count;x++){
							retVal.value[x] = this.getString();
						}
						break;
					case "StructProperty":
						this.pos -= 8;
						retVal.value = this.getString64Custom(overlen - 4);
						break;
					default:
						retVal.value[x] = this.getNestedValueByType(retVal.innerType, overlen);
						break;
				}
				break;
			case "IntProperty":
				tCheck = this.getInt8(); //if not=0 then something's wrong.  tbi
				retVal = this.getInt32();
				break;
			case "BoolProperty":
				tCheck = retVal.length; //if not=0 then something's wrong.  tbi
				retVal.value = this.getInt16();
				if(retVal.value==0){retVal = false} else {retVal = true};
				break;
			case "NameProperty":
			case "StrProperty":
			case "ObjectProperty":
				tCheck = this.getInt8(); //if not=0 then something's wrong.  tbi
				retVal = this.getString();
				break;
			case "FloatProperty":
				tCheck = this.getInt8(); //if not=0 then something's wrong.  tbi
				retVal = this.getFloat32();
				break;
			case "StructProperty":
				var iType = this.getString();
				var iId = this.getGuid();
				tCheck = this.getInt8(); //if not=0 then something's wrong.  tbi
				retVal = this.getNestedValueByType(iType, overlen);
				retVal.type = iType;
				retVal.id = iId;
				break;
			case "MapProperty":
				var mpKeyType = this.getString();
				var mpValType = this.getString();
				this.pos -= 7;
				retVal.innerValue = this.getString64Custom(overlen);
				retVal.keyType = mpKeyType;
				retVal.valueType = mpValType;
				break;
			case "TextProperty":
				tCheck = this.getInt8(); //if not=0 then something's wrong.  tbi
				this.pos -= 8;
				retVal.value = this.getString64Custom(overlen);
				retVal.value = retVal.value.slice(retVal.value.lastIndexOf("\x00")+1);
				break;
			default:
				//console.log("property type not handled: " + type);
				break;
		}
	return retVal;
	}


	getNestedValueByType(type, overlen){
		var retVal = {};
		var tCheck = 0;
		switch(type){
	                case "DateTime":
	                	retVal.value = this.getInt64(); //this needs to be converted from a .net 64-bit datetime to a js date object
	                	break;
	                case "Guid":
	                	retVal.value = this.getGuid();
	                	break;
	                case "Vector":
	                case "Rotator":
	                	retVal.x = this.getFloat32();
	                	retVal.y = this.getFloat32();
	                	retVal.z = this.getFloat32();
	                	break;
	                case "LinearColor":
	                	retVal.r = this.getFloat32();
	                	retVal.g = this.getFloat32();
	                	retVal.b = this.getFloat32();
	                	retVal.a = this.getFloat32();
	                	break;
			default:
				retVal.name = type;
				if( type.endsWith("Property") ) { 
					retVal.value = this.getValueByType(this.getString());
				} else {
					//console.log("nested property type not explicitly handled: " + type);
					this.pos -= 8;
					retVal.value = this.getString64Custom(overlen);
				}
				break;
		}
	return retVal;
	}

}

window.zoomToURL = function() {
	var p = {};
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) { p[key] = value; });
	if(p.neLat){ window.mapref.fitBounds(L.latLngBounds(L.latLng(p.neLat, p.neLng), L.latLng(p.swLat, p.swLng))) };
}

window.showSharableURL = function() {
	var retVal = window.location.toString().split("?")[0];
	var bnds = window.mapref.getBounds();
	retVal = retVal + '?neLat=' + bnds._northEast.lat + '&neLng=' + bnds._northEast.lng + '&swLat=' + bnds._southWest.lat + '&swLng=' + bnds._southWest.lng
	var inputc = document.body.appendChild(document.createElement("input"));
	inputc.value = retVal;
	inputc.focus();
	inputc.select();
	document.execCommand('copy');
	inputc.parentNode.removeChild(inputc);
	alert("A sharable URL has been copied to your clipboard.");
}

window.putSavefileLocationOnClipboard = function() {
	var inputc = document.body.appendChild(document.createElement("input"));
	inputc.value = "%LocalAppData%\\Supraland\\Saved\\SaveGames\\";
	inputc.focus();
	inputc.select();
	document.execCommand('copy');
	inputc.parentNode.removeChild(inputc);
}

window.zoomToURL();