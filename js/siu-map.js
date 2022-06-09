export var SiuMap = L.Map.extend({
    initialize: function() {
        L.Map.prototype.initialize.call(this, 'map', {
            crs: L.CRS.Simple,
            minZoom: -8
        });
        this.on('contextmenu', function() {/* Do nothing */});

        let mapSize = {width: 8192, height: 8192}
        let pxTrans = {dx: -74515, dy: -85540, m: 21.3678}
        let bounds = [
            [pxTrans.dy, pxTrans.dx],
            [
                pxTrans.dy + pxTrans.m * mapSize.height,
                pxTrans.dx + pxTrans.m * mapSize.width
            ]
        ];
        L.imageOverlay('img/map.jpg', bounds).addTo(this);
        this.fitBounds(bounds);
    }
});
