var app;
(function (app) {
    var assets;
    (function (assets) {
        var SpriteAsset = (function () {
            function SpriteAsset(spriteSetName, spriteName, path) {
                var _this = this;
                this.error = false;
                this.loaded = 2;
                this.queuedSprites = [];
                /*
                 * Events
                 */
                this.onImageLoad = function (event) {
                    _this.load(event.target);
                };
                this.onImageError = function () {
                    _this.error = true;
                    _this.load();
                };
                this.onDataLoad = function (data) {
                    _this.palettes = [];
                    _this.paletteCount = data.palettes.length;
                    for (var _i = 0, _a = data.palettes; _i < _a.length; _i++) {
                        var paletteData = _a[_i];
                        _this.frameCount = paletteData.length;
                        var frames = [];
                        _this.palettes.push(frames);
                        for (var _b = 0, paletteData_1 = paletteData; _b < paletteData_1.length; _b++) {
                            var frameData = paletteData_1[_b];
                            frames.push(new assets.SpriteFrame(frameData));
                        }
                    }
                    _this.load();
                };
                this.onDataError = function () {
                    _this.error = true;
                    _this.load();
                };
                this.spriteSetName = spriteSetName;
                this.spriteName = spriteName;
                this.path = path;
                if (spriteSetName) {
                    var sheet = new Image();
                    sheet.onload = this.onImageLoad;
                    sheet.onerror = this.onImageError;
                    sheet.src = path + '.png';
                    $.ajax({
                        dataType: 'json',
                        url: path + '.json',
                        success: this.onDataLoad,
                        error: this.onDataError
                    });
                }
            }
            SpriteAsset.init = function () {
                SpriteAsset.SPRITE_LOADING_IMG = document.createElement('canvas');
                SpriteAsset.SPRITE_ERROR_IMG = document.createElement('canvas');
                var loadingImage = new Image();
                loadingImage.onload = function () {
                    SpriteAsset.SPRITE_LOADING_IMG.width = loadingImage.width;
                    SpriteAsset.SPRITE_LOADING_IMG.height = loadingImage.height;
                    var context = SpriteAsset.SPRITE_LOADING_IMG.getContext('2d');
                    context.drawImage(loadingImage, 0, 0, loadingImage.width, loadingImage.height);
                };
                var errorImage = new Image();
                errorImage.onload = function () {
                    SpriteAsset.SPRITE_ERROR_IMG.width = errorImage.width;
                    SpriteAsset.SPRITE_ERROR_IMG.height = errorImage.height;
                    var context = SpriteAsset.SPRITE_ERROR_IMG.getContext('2d');
                    context.drawImage(errorImage, 0, 0, errorImage.width, errorImage.height);
                };
                loadingImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozZGM5YTEwOC03NDAxLWUyNGEtODNkNy01MjlmYzM4ZmY4NzkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODM1M0VFMkE3NjM0MTFFN0E0MTg5NzU1ODEyMjQ4QUMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODM1M0VFMjk3NjM0MTFFN0E0MTg5NzU1ODEyMjQ4QUMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NThmZjdmMTctMWMxMi1lYzQ5LWJmMDYtYmZlZmQ3N2IxODhjIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjNkYzlhMTA4LTc0MDEtZTI0YS04M2Q3LTUyOWZjMzhmZjg3OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuIbq3AAAARvSURBVHja7Fo9SCNREH4ROyXgFRaXQgj+YKOnwUO0OomtRSAiVsKFQLDTwz3vsJIcWmhpiChYqSRgI4IQ0UobjZw2FpqrVNTign/13nzLe8u6F5N4iXp3mQfD7rx582bme5PZySaOMyF0UcKjTJT4KHkAym28o0Ti1jkDGAAGgAFgABgABoABYAAYAAaAAWAAGAAGgAFgAEp1lBe6wVv9dV8qnzscnAHPBgCdbtUL+uInmiByS75G8hqR80UBoMBriGbu7+9/4pptAwelYKGE4Hd2dmLz8/Pa1dVVSoKggY/H4wAhlEX3WTIgRMZDlZWVghwLEQj+xzbQKUv0LJmSj5wunqOjIxEIBMTJyQmmPQR+CPzKyorKjkx6j2ZuvtlbVkDx8xElkCUgcihB5JPOOYk0or1McrnGp0t9YoP2/SsqKiLb29tidHQUbITWfsR+cp+E3BMZGiZySp8+EMWUTfhHtEekqTW/Dfw2aCHwcG5ibm4O5V0nJ4jV/Uom5eFUKqUPDg4aa0C4v7u706WjWiwW0/v6+jLJEbgP90q/vr7eXKvsIVjMTU1NgY8qHjpWPdihMUNUgz3HxsYe2ISOXKNZYjBjfjIASD0YgnGw2FythTF5SlE4jnnoKzkcUieogoBMya32YMO6p+JBCHJ9fd30AYdh9Rly+KXkmIe8WAAEYRy3ltMxAzo4OMCcF/OXl5eGPkidMAKBwzbATP1cACAopH4GH1NdXV2GXGZaGCDkAuBPGiH36empcdPe3o7LBopWS0uLFwwZN4rW9PR0cHh4OOMGFxcXxtXr9Sp9ofRzjdbWVlx+2OfpM+/e3NwUBBjqR5KmvrtcruIVwUyV9fb2FhfMVV1fX5vzh4eHRvBwhk7bAAX39iF1itJrUNBpOn1Bj1HTJ+lf4QAQumZlxcG1tbUZ86urq7hoNB9cW1sz5mpra1UWiLq6OuF2u5MAYXl52dyvo6PDcBY60CXSFhcXC8Ug2d3dLZAF1Du4CYjowsJC4d8FOjs7H/B0kp6lpaUkff49OGV6fhudGwzTZ01UV1dH6DRCCHB8fFwcHx979vf37dvOjoyMaHjO9/T0CKVf4JgdGhryJhIJ0dvba0zAh1zDYfuLjEOmOxBMyabkwUBz1NTUFKDb94R08ObmxphvbGzEyUbodhLPddL/IjNEOJ1O0dDQYGSGZQ26vBD0rfLm5mak8xuSh9GEWex5bPyW8tGi8wl2ld+quaJiKPx+/2f64jSp2pCsACgQYDQDaGnaaEM2FiHLZzhJrWnc0ui4LQ1OGnKsVWv0h/qmHEWR1qTlGnSAaeI3HuGVj+C9aKfpESj6+/uN+oIMRRYgAwHQudw3LwDyHS7xuuPMUqRRo6LRqNjd3TVr0MDAAOrQNwr+q7WTLhoAf9P7APLlncwqlbl4XEZozZb9q8R/CcATBv9HqGivxM4d//Yfy/iVGAPAADAADAADwAAwAAwAA8AAMAAMAAPAADAADAADUGLD/k5Q5wxgAEpr/BJgANhavEN20ss/AAAAAElFTkSuQmCC';
                errorImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozZGM5YTEwOC03NDAxLWUyNGEtODNkNy01MjlmYzM4ZmY4NzkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTVFQkQxOTk3NUVCMTFFNzhCMzBGMUM2NzkzREIxMzUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTVFQkQxOTg3NUVCMTFFNzhCMzBGMUM2NzkzREIxMzUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OGRkNmM0M2MtNmE1MS1mODQ2LWE0OTUtMjU4M2RlNzU1YTMzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjNkYzlhMTA4LTc0MDEtZTI0YS04M2Q3LTUyOWZjMzhmZjg3OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PugcXkUAAAHZSURBVHja7NuLToMwGIbh8oUrdXJVE+/O60BnIGvI6In/WNZkMdG4+T7DhrbZ8BPCEi48EC4+3gAH35/Xnw2dPLA2FQPc/h739Ze9j2FtuZUAfHeG8Cp+TgF8doRwFD+lAJZOEFLxS24O8I5QHJ+aBL0iVMXn7gO8IVTHP8aYedIN4TE+IoSQe2KF+K/obyyKL70TtH4lNMfX3ApbRTgVX7sWsIZwOr5lMWQFgSS+dTWojUAWf2Y5rIVAGn92P0AagTyeYkNECoElnmpHiBuBLZ5yS4wLgTWeEoADgT2eGoASQSSeA4ACQSyeC+AMgmg8J0ALgng8N0ANgkp8yYYIJcLRpkrQipcCyCEMWvH/L747HeZezb261INC/CI1B5TMCSrvvBaAuSENkPoXUNleg3L8HJS310bl+PigUuXcYVSO3wLVDl9gIF5iU0UFoPb2VgUBRuLVEGAoXgUBxuLFEWAwXhQBRuPFEGA4XgQBxuPZEeAgnhUBTuLZEOAongUBzuLJEeAwnhQBTuPJEOA4ngQBzuP3CHMtAjqIjxGmWgR0Et+MgI7imxDGzuL3CFt8/HVKAfQQX4LwfMcTH531HL+/qos/Ntdb/NGcUHQFXGK8T4evDvArwAChrzwgBRnVsAAAAABJRU5ErkJggg==';
                SpriteAsset.NULL_FRAME_DATA = [[new assets.SpriteFrame([0, 0, 64, 64, 0, 0])]];
                SpriteAsset._NULL = new SpriteAsset(null, null, null);
                SpriteAsset._NULL.error = true;
            };
            SpriteAsset.prototype.setSpriteSource = function (sprite) {
                if (this.error || this.loaded > 0) {
                    var src = this.error ? SpriteAsset.SPRITE_ERROR_IMG : SpriteAsset.SPRITE_LOADING_IMG;
                    sprite.setSrc(src, SpriteAsset.NULL_FRAME_DATA, 1, 1);
                    if (!this.error) {
                        this.queuedSprites.push(sprite);
                    }
                }
                else {
                    sprite.setSrc(this.sheet, this.palettes, this.paletteCount, this.frameCount);
                }
            };
            SpriteAsset.prototype.load = function (img) {
                if (img === void 0) { img = null; }
                if (--this.loaded == 0) {
                    if (img) {
                        this.sheet = document.createElement('canvas');
                        this.sheet.width = img.width;
                        this.sheet.height = img.height;
                        this.ctx = this.sheet.getContext('2d');
                        this.ctx.drawImage(img, 0, 0, img.width, img.height);
                    }
                    for (var _i = 0, _a = this.queuedSprites; _i < _a.length; _i++) {
                        var sprite = _a[_i];
                        this.setSpriteSource(sprite);
                    }
                    this.queuedSprites = null;
                }
            };
            Object.defineProperty(SpriteAsset, "NULL", {
                get: function () {
                    return this._NULL;
                },
                enumerable: true,
                configurable: true
            });
            return SpriteAsset;
        }());
        assets.SpriteAsset = SpriteAsset;
    })(assets = app.assets || (app.assets = {}));
})(app || (app = {}));
//# sourceMappingURL=SpriteAsset.js.map