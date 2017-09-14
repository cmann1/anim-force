var app;
(function (app) {
    var projects;
    (function (projects) {
        var Model = app.model.Model;
        var Project = (function () {
            function Project(name) {
                this.isNew = true;
                this.activeModel = null;
                this.models = [];
                this.id = null;
                this.rev = null;
                this.name = name;
            }
            Project.prototype.addModel = function (model) {
                this.models.push(model);
                if (!this.activeModel) {
                    this.activeModel = model;
                }
            };
            Project.prototype.save = function () {
                var data = {
                    name: this.name,
                    models: [],
                    activeModel: -1,
                    date: new Date().toJSON(),
                    viewport: app.App.getViewport().save()
                };
                if (this.id)
                    data._id = this.id;
                if (this.rev)
                    data._rev = this.rev;
                if (this.activeModel) {
                    data.activeModel = this.models.indexOf(this.activeModel);
                }
                for (var _i = 0, _a = this.models; _i < _a.length; _i++) {
                    var model = _a[_i];
                    data.models.push(model.save());
                }
                return data;
            };
            Project.load = function (data) {
                var project = new Project(data.get('name'));
                if (data._id) {
                    project.id = data._id;
                    project.rev = data._rev;
                }
                for (var _i = 0, _a = data.models; _i < _a.length; _i++) {
                    var modelData = _a[_i];
                    project.addModel(new Model().load(data.asLoadData(modelData)));
                }
                if (!project.models.length) {
                    project.addModel(new Model());
                }
                var viewportData = data.asLoadData('viewport');
                app.App.getViewport().load(viewportData);
                project.isNew = false;
                return project;
            };
            return Project;
        }());
        projects.Project = Project;
    })(projects = app.projects || (app.projects = {}));
})(app || (app = {}));
//# sourceMappingURL=Project.js.map