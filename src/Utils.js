String.prototype.ucFirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.toTitleCase = function () {
    return this
        .replace(/([a-z])([0-9])/ig, '$1 $2')
        .replace(/([0-9])([a-z])/ig, '$1 $2')
        .replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
//# sourceMappingURL=Utils.js.map