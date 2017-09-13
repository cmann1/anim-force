var app;
(function (app) {
    var projects;
    (function (projects) {
        var Key = KeyCodes.Key;
        var PromptDlg = app.ui.PromptDlg;
        var Model = app.model.Model;
        var Dialog = app.ui.Dialog;
        var ProjectManager = (function () {
            function ProjectManager() {
                var _this = this;
                this.activeProjectRev = null;
                this.overwriteProjectRev = null;
                /*
                 * Events
                 */
                this.onConfirm = function (name, value) {
                    if (name == 'NewProject') {
                        _this.newProject();
                        app.main.setProject(_this.activeProject);
                    }
                };
                this.onOverwriteConfirm = function (name, value) {
                    _this.activeProjectRev = _this.overwriteProjectRev;
                    _this.overwriteProjectRev = null;
                    _this.saveActiveProject();
                };
                this.onSaveAsConfirm = function (name, value) {
                    value = $.trim(value);
                    _this.projectsDb.get(value).then(function (doc) {
                        _this.overwriteProjectRev = doc._rev;
                        _this.showConfirmOverwriteDlg(value);
                    }).catch(function () {
                        _this.activeProject.name = value;
                        _this.saveActiveProject();
                    });
                };
                this.onWindowKeyDown = function (event) {
                    var keyCode = event.keyCode;
                    var shiftKey = event.shiftKey;
                    var ctrlKey = event.ctrlKey;
                    var consume = false;
                    if (ctrlKey) {
                        if (keyCode == Key.S) {
                            if (shiftKey)
                                _this.saveAs();
                            else
                                _this.save();
                            consume = true;
                        }
                        else if (keyCode == Key.O) {
                            // TODO: implement project manager dialog/open
                            consume = true;
                        }
                    }
                    else if (shiftKey) {
                        if (keyCode == Key.N) {
                            _this.showConfirmDlg('Confirm New Project', 'Any unsaved changes will be lost<br>Are you sure you want to continue?', 'NewProject');
                            consume = true;
                        }
                    }
                    if (consume) {
                        event.preventDefault();
                        return false;
                    }
                };
            }
            ProjectManager.prototype.init = function (callback) {
                app.$window.on('keydown', this.onWindowKeyDown);
                this.projectsDb = new PouchDB('app-projects', { adapter: 'idb', revs_limit: 3, auto_compaction: true });
                this.projectsDb.createIndex({
                    index: { fields: ['_id', 'data'] }
                });
                if (app.Config.loadLastProjectOnStartUp && app.Config.activeProject) {
                    // TODO: Implement loadLastProjectOnStartUp
                    // db.allDocs({include_docs: true}).then(function(results){
                    // 	for(var data of results.rows)
                    // 	{
                    // 		Config[data.id] = (<any> data.doc).value;
                    // 	}
                    // 	Config.isLoaded = true;
                    // }).then(callback);
                }
                else {
                    this.newProject();
                    callback();
                }
            };
            ProjectManager.prototype.getActiveProject = function () {
                return this.activeProject;
            };
            ProjectManager.prototype.save = function () {
                if (this.activeProjectRev == null) {
                    this.saveAs();
                    return;
                }
                this.saveActiveProject();
            };
            ProjectManager.prototype.saveAs = function () {
                if (!this.promptDlg) {
                    this.promptDlg = new PromptDlg('Save As', { confirm: this.onSaveAsConfirm });
                }
                this.promptDlg.show(this.activeProject.name);
            };
            ProjectManager.prototype.newProject = function () {
                this.activeProject = new projects.Project('New Project');
                this.activeProject.addModel(new Model());
            };
            ProjectManager.prototype.saveActiveProject = function () {
                var _this = this;
                var data = this.activeProject.save();
                data._id = data.name;
                if (this.activeProjectRev != null) {
                    data._rev = this.activeProjectRev;
                }
                this.projectsDb.put(data).then(function (response) {
                    app.App.notice('Project saved', 'blue');
                    _this.activeProjectRev = response.rev;
                }).catch(function () {
                    app.App.notice('Error saving project', 'red');
                });
            };
            ProjectManager.prototype.showConfirmDlg = function (title, content, name) {
                if (!this.confirmDlg) {
                    this.confirmDlg = new Dialog('Confirm', {
                        type: 'warning',
                        content: 'Are you sure?',
                        buttons: [
                            { label: 'Yes', confirm: true, focus: true },
                            { label: 'No', cancel: true }
                        ],
                        confirm: this.onConfirm
                    });
                }
                if (title != null)
                    this.confirmDlg.setTitle(title);
                if (content != null)
                    this.confirmDlg.setContent(content);
                if (name != null)
                    this.confirmDlg.setName(name);
                this.confirmDlg.show();
            };
            ProjectManager.prototype.showConfirmOverwriteDlg = function (name) {
                if (!this.confirmOverwriteDlg) {
                    this.confirmOverwriteDlg = new Dialog('Confirm Overwrite', {
                        type: 'warning',
                        content: '<strong>XXX</strong> already exists.<br>Do you want to overwrite it?',
                        buttons: [
                            { label: 'Yes', confirm: true, focus: true },
                            { label: 'No', cancel: true }
                        ],
                        confirm: this.onOverwriteConfirm
                    });
                    this.$confirmOverwriteName = this.confirmOverwriteDlg.getContent().find('strong');
                }
                if (name != null) {
                    this.$confirmOverwriteName.html(name);
                }
                this.confirmOverwriteDlg.show();
            };
            return ProjectManager;
        }());
        projects.ProjectManager = ProjectManager;
    })(projects = app.projects || (app.projects = {}));
})(app || (app = {}));
//# sourceMappingURL=ProjectManager.js.map