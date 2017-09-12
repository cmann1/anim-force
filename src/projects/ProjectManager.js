var app;
(function (app) {
    var projects;
    (function (projects) {
        var Key = KeyCodes.Key;
        var ProjectManager = (function () {
            function ProjectManager() {
                var _this = this;
                this.currentModelData = null;
                /*
                 * Events
                 */
                this.onWindowKeyDown = function (event) {
                    var keyCode = event.keyCode;
                    var shiftKey = event.shiftKey;
                    var ctrlKey = event.ctrlKey;
                    var consume = false;
                    if (ctrlKey) {
                        if (keyCode == Key.S) {
                            _this.save();
                            consume = true;
                        }
                        else if (keyCode == Key.O) {
                            consume = true;
                        }
                        else if (keyCode == Key.N) {
                            consume = true;
                        }
                    }
                    if (consume) {
                        event.preventDefault();
                        return false;
                    }
                };
                app.$window.on('keydown', this.onWindowKeyDown);
            }
            ProjectManager.prototype.save = function () {
            };
            return ProjectManager;
        }());
        projects.ProjectManager = ProjectManager;
    })(projects = app.projects || (app.projects = {}));
})(app || (app = {}));
//# sourceMappingURL=ProjectManager.js.map