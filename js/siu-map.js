let mapSize = {width: 8192, height: 8192}
let pxTrans = {dx: -74515, dy: -85540, m: 21.3678}
let siuBounds = [
    [pxTrans.dy, pxTrans.dx],
    [
        pxTrans.dy + pxTrans.m * mapSize.height,
        pxTrans.dx + pxTrans.m * mapSize.width
    ]
];

export var SiuMap = L.Map.extend({
    bounds: siuBounds,
    initialize: function() {
        L.Map.prototype.initialize.call(this, 'map', {
            crs: L.CRS.Simple,
            minZoom: -8,
            maxZoom: -2,
        });
        this.on('contextmenu', function() {/* Do nothing */});
        L.imageOverlay('img/map.jpg', this.bounds).addTo(this);
        this.fitBounds(this.bounds);
    }
});
