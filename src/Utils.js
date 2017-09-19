String.prototype.ucFirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.toTitleCase = function () {
    return this
        .replace(/([a-z])([0-9])/ig, '$1 $2')
        .replace(/([0-9])([a-z])/ig, '$1 $2')
        .replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1);
    });
};
String.prototype.toVarName = function () {
    var out = this.replace(/^([0-9])/, '_$1');
    return out.toTitleCase()
        .replace(/[^a-zA-Z0-9_$]/g, '')
        .replace(/\s+([a-z])/g, function (txt) { return txt.toUpperCase(); })
        .replace(/\s+/g, '');
};
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}
// public static double normalizeAngle(double a, double center) {
// 	return a - TWO_PI * FastMath.floor((a + FastMath.PI - center) / TWO_PI);
// }
Math.TWO_PI = Math.PI * 2;
Math.RAD_TO_DEG = 1 / Math.PI * 180;
Math.DEG_TO_RAD = 1 / 180 * Math.PI;
Math.normalizeAngle = function (theta) {
    return theta - Math.TWO_PI * Math.floor((theta + Math.PI) / Math.TWO_PI);
};
Math.lerpAngle = function (start, end, t) {
    return start + t * Math.normalizeAngle(end - start);
};
var Utils;
(function (Utils) {
    function naturalCompare(a, b) {
        var ax = [], bx = [];
        a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]); });
        b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]); });
        while (ax.length && bx.length) {
            var an = ax.shift();
            var bn = bx.shift();
            var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
            if (nn)
                return nn;
        }
        return ax.length - bx.length;
    }
    Utils.naturalCompare = naturalCompare;
    function copyToClipboard(text) {
        var $input = $('<textarea>').val(text).appendTo(app.$body).select();
        document.execCommand('copy');
        $input.remove();
    }
    Utils.copyToClipboard = copyToClipboard;
})(Utils || (Utils = {}));
function mod(n, m) {
    return ((n % m) + m) % m;
}
//# sourceMappingURL=Utils.js.map