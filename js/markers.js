import { Layers } from "./layers.js";
import { Icons } from "./icons.js";
import { SiuMarker } from "./siu-marker.js";

export class Markers {
    static async init() {
        return Markers._loadChests()
            .then(Markers._loadOpenworld)
            .then(Markers._loadGold)
            .then(Markers._loadCollectables)
            .then(Markers._addCoordinateExtractionTool);
    }


    static async _loadChests() {
        $.get('data/chests.csv', function (csv) {
            let chest = $.csv.toObjects(csv);
            chest.forEach(function (chest) {
                let icon = 'chest', layer = 'closedChest';

                let popup = chest.item;
                if (chest.comment) popup += '<br/><i>' + chest.comment + '</i>';

                Markers._createMarker(chest, icon, layer, chest.item, popup, 'upgrades');
                Markers._createMarker(chest, icon, layer, chest.item, popup, 'collectable');
                Markers._createMarker(chest, icon, layer, chest.item, popup, 'coinChest');
                if (chest.type === 'powerup') Markers._createMarker(chest, chest.icon, 'upgrades', chest.item, popup, 'upgrades')
                if (chest.type === 'collectable') Markers._createMarker(chest, chest.icon, 'collectable', chest.item, popup, 'collectable')
                if (chest.type === 'coin') Markers._createMarker(chest, chest.icon, 'coinChest', chest.item, popup, 'coinChest')
            });
        });
    }

    static async _loadOpenworld() {
        $.get('data/openworld.csv', function (csv) {
            let openworld = $.csv.toObjects(csv);
            openworld.forEach(function (openworld) {
                let icon = 'chest', layer = 'test';

                let popup = openworld.item;
                if (openworld.comment) popup += '<br/><i>' + openworld.comment + '</i>';

                Markers._createMarker(openworld, icon, layer, openworld.item, popup, 'grave');
                Markers._createMarker(openworld, icon, layer, openworld.item, popup, 'collectable');
                Markers._createMarker(openworld, icon, layer, openworld.item, popup, 'coin');
                if (openworld.type === 'grave') Markers._createMarker(openworld, openworld.icon, 'grave', openworld.item, popup, 'grave')
                if (openworld.type === 'collectable') Markers._createMarker(openworld, openworld.icon, 'collectable', openworld.item, popup, 'collectable')
                if (openworld.type === 'coin') Markers._createMarker(openworld, openworld.icon, 'coin', openworld.item, popup, 'coin')
            });
        });
    }

    //static async _loadGold() {
    //    $.get('data/gold.csv', function(csv) {
    //        let coins = $.csv.toObjects(csv);
    //        coins.forEach(function(coin, index) {
    //            let icon = 'coin', layer = 'coin';
    //            if (coin.count > 1) icon = 'coinStash';
    //            //if (coin.type === 'chest_coin') { icon = 'chest_coin'; layer = 'coinChest'; }
    //            if (coin.type === 'grave_volcano') { icon = 'grave_volcano'; layer = 'grave'; }
    //            if (coin.type === 'grave_stone') { icon = 'grave_stone'; layer = 'grave'; }
    //            if (coin.type === 'grave_wood') { icon = 'grave_wood'; layer = 'grave'; }
    //            let title = coin.count > 1 ? coin.count + ' Coins' : '1 Coin';
    //            let popup = title + '&emsp;<small>#' + (index + 2) + '</small>';
    //            if (coin.comment) popup += '<br/><i>' + coin.comment + '</i>';
    //
    //            Markers._createMarker(coin, icon, layer, title, popup, 'gold');
    //        });
    //    });
    //}

    //static async _loadCollectables() {
    //    $.get('data/collectables.csv', function(csv) {
    //        let collectables = $.csv.toObjects(csv);
    //        collectables.forEach(function(collectable) {
    //            Markers._createMarker(collectable, collectable.icon, 'collectable', collectable.comment, collectable.comment, 'collectables');
    //        });
    //    });
    //}

    static async _addCoordinateExtractionTool() {
        L.marker([0, 0], {zIndexOffset: 10000, draggable: true})
            .bindPopup('0, 0')
            .addTo(Layers.get('coordinate'))
            .on('moveend', function(e) {
                let marker = e.target;
                let latlng = marker.getLatLng();
                let x = Math.round(latlng.lng), y = Math.round(-latlng.lat);
                marker.setPopupContent(x + ', ' + y);
                marker.openPopup();
            });
    }

    static _createMarker(data, icon, layer, title, popup, imageFolder) {
        let lat = -parseInt(data.y, 10), lng = parseInt(data.x, 10);
        return new SiuMarker([lat, lng], {icon: Icons.get(icon), title: title})
            .addTo(Layers.get(layer))
            .setPopupText(popup)
            .setPopupImage(imageFolder, data.image)
            .setPopupYouTube(data.ytVideo, data.ytStart, data.ytEnd);
    }
}
