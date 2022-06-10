import { Layers } from "./layers.js";
import { Icons } from "./icons.js";
import { SiuMarker } from "./siu-marker.js";

export class Markers {
    static async init() {
        return Markers._loadUpgrades()
            .then(Markers._loadChests)
            .then(Markers._loadGold)
            .then(Markers._loadCollectables)
            .then(Markers._addCoordinateExtractionTool);
    }

    static async _loadUpgrades() {
        $.get('data/upgrades.csv', function(csv) {
            let upgrades = $.csv.toObjects(csv);
            upgrades.forEach(function(upgrade) {
                let icon = 'chest', layer = 'itemChest';
                if (upgrade.type === 'chestGold') {icon = 'chestGold';}
                if (upgrade.type === 'shop') {icon = 'shop'; layer = 'shop';}
                let popup = upgrade.item;
                if (upgrade.comment) popup += '<br/><i>' + upgrade.comment + '</i>';

                Markers._createMarker(upgrade, icon, layer, upgrade.item, popup, 'upgrades');
                if (upgrade.icon) Markers._createMarker(upgrade, upgrade.icon, 'upgrades', upgrade.item, popup, 'upgrades');
            });
        });
    }

    static async _loadChests() {
        $.get('data/chests.csv', function (csv) {
            let chests = $.csv.toObjects(csv);
            chests.forEach(function (chest) {
                let icon = 'chest', layer = 'closedChest';
                if (chest.type === 'chest_coin') { icon = 'chest_coin'; }

                let popup = chest.item;
                if (chest.comment) popup += '<br/><i>' + chest.comment + '</i>';

                Markers._createMarker(chest, icon, layer, chest.item, popup, 'chests');
                if (chest.icon) Markers._createMarker(chest, chest.icon, 'chests', chest.item, popup, 'chests');
            });
        });
    }

    static async _loadGold() {
        $.get('data/gold.csv', function(csv) {
            let coins = $.csv.toObjects(csv);
            coins.forEach(function(coin, index) {
                let icon = 'coin', layer = 'coin';
                if (coin.count > 1) icon = 'coinStash';
                if (coin.type === 'chest_coin') { icon = 'chest_coin'; layer = 'coinChest'; }
                if (coin.type === 'grave_volcano') { icon = 'grave_volcano'; layer = 'grave'; }
                if (coin.type === 'grave_stone') { icon = 'grave_stone'; layer = 'grave'; }
                if (coin.type === 'grave_wood') { icon = 'grave_wood'; layer = 'grave'; }
                let title = coin.count > 1 ? coin.count + ' Coins' : '1 Coin';
                let popup = title + '&emsp;<small>#' + (index + 2) + '</small>';
                if (coin.comment) popup += '<br/><i>' + coin.comment + '</i>';

                Markers._createMarker(coin, icon, layer, title, popup, 'gold');
            });
        });
    }

    static async _loadCollectables() {
        $.get('data/collectables.csv', function(csv) {
            let collectables = $.csv.toObjects(csv);
            collectables.forEach(function(collectable) {
                Markers._createMarker(collectable, collectable.icon, 'collectable', collectable.comment, collectable.comment, 'collectables');
            });
        });
    }

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
