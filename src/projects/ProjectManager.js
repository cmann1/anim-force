var app;
(function (app) {
    var projects;
    (function (projects) {
        var Key = KeyCodes.Key;
        var PromptDlg = app.ui.PromptDlg;
        var Model = app.model.Model;
        var Dialog = app.ui.Dialog;
        function LoadData_get(key) {
            if (!this.hasOwnProperty(key))
                throw new Error('Invalid data. Cannot find property: ' + key);
            return this[key];
        }
        function LoadData_asLoadData(obj) {
            obj.get = this.get;
            obj.asLoadData = this.asLoadData;
            return obj;
        }
        var ProjectManager = (function () {
            function ProjectManager() {
                var _this = this;
                this.activeProjectRev = null;
                this.overwriteProjectRev = null;
                this.dlgStack = [];
                this.$selectedProjectItem = null;
                this.$projectItems = {};
                this.projectCount = 0;
                this.updateProjectsList = function (results) {
                    _this.setLoadingMessage();
                    _this.projectListTooltips.detach();
                    _this.$projectItems = {};
                    _this.projectCount = results.docs.length;
                    if (!results.docs.length) {
                        _this.setLoadingMessage('No projects found');
                    }
                    for (var _i = 0, _a = results.docs; _i < _a.length; _i++) {
                        var doc = _a[_i];
                        var $item = $("\n\t\t\t\t<div class=\"project-item\" data-project-id=\"" + doc.name + "\">\n\t\t\t\t\t<label for=\"\">" + doc.name + "</label>\n\t\t\t\t\t<div class=\"flex-filler\"></div>\n\t\t\t\t\t<i class=\"fa fa-i-cursor btn\" title=\"Rename\" data-action=\"rename\"></i>\n\t\t\t\t\t<i class=\"fa fa-download btn\" title=\"Export to file\" data-action=\"export\"></i>\n\t\t\t\t\t<i class=\"fa fa-close btn\" title=\"Delete\" data-action=\"delete\"></i>\n\t\t\t\t</div>\n\t\t\t\t");
                        _this.$itemList.append($item);
                        _this.$projectItems[doc.name] = $item;
                    }
                    _this.projectListTooltips.attach(_this.$itemList.find('i'));
                    _this.$contentPane.focus();
                    _this.disableButton(_this.$importBtn, false);
                    _this.projectManagerDlg.reposition();
                    setTimeout(function () {
                        _this.projectManagerDlg.reposition();
                    }, 100);
                };
                /*
                 * Events
                 */
                this.onConfirm = function (name, value) {
                    if (name == 'NewProject') {
                        _this.newProject();
                        app.main.setProject(_this.activeProject);
                    }
                    else if (name == 'ProjectManager') {
                        if (_this.$selectedProjectItem) {
                            _this.openProject(_this.$selectedProjectItem.data('project-id'));
                        }
                    }
                    else if (name == 'DeleteProject') {
                        _this.deleteProject(value);
                    }
                };
                this.onDlgClose = function (dlg) {
                    _this.dlgStack.splice(_this.dlgStack.indexOf(dlg), 1);
                };
                this.onOverwriteConfirm = function (name, value) {
                    _this.activeProjectRev = _this.overwriteProjectRev;
                    _this.overwriteProjectRev = null;
                    _this.saveActiveProject();
                };
                this.onProjectListAction = function (event) {
                    var $button = $(event.target);
                    var action = $button.data('action');
                    var projectId = $button.closest('.project-item').data('project-id');
                    console.log('onProjectListAction', action, projectId);
                    if (action == 'export') {
                        // TODO: Implement exporting
                    }
                    else if (action == 'delete') {
                        _this.askDeleteProject(projectId);
                    }
                };
                this.onProjectListItemDoubleClick = function (event) {
                    if (_this.$selectedProjectItem) {
                        _this.openProject(_this.$selectedProjectItem.data('project-id'));
                    }
                };
                this.onProjectListItemSelect = function (event) {
                    _this.selectProjectItem($(event.currentTarget));
                };
                this.onProjectManagerKeyDown = function (event) {
                    var key = event.keyCode;
                    if (key == Key.Enter) {
                        if (_this.$selectedProjectItem) {
                            _this.openProject(_this.$selectedProjectItem.data('project-id'));
                        }
                    }
                    else if (key == Key.Delete) {
                        if (_this.$selectedProjectItem) {
                            _this.askDeleteProject(_this.$selectedProjectItem.data('project-id'));
                        }
                    }
                    else if (key == Key.UpArrow) {
                        _this.selectPreviousProjectItem();
                    }
                    else if (key == Key.DownArrow) {
                        _this.selectNextProjectItem();
                    }
                };
                this.onProjectManagerButtonClick = function (buttonId) {
                    if (buttonId == 'Import') {
                        // TODO: Implement import
                        console.log('Importing');
                    }
                };
                this.onSaveAsConfirm = function (name, value) {
                    value = $.trim(value);
                    if (value == '') {
                        app.App.notice('Invalid project name', 'red');
                        setTimeout(function () {
                            _this.saveAs();
                        }, 50);
                        return;
                    }
                    _this.activeProject.name = value;
                    _this.projectsDb.get(value).then(function (doc) {
                        _this.overwriteProjectRev = doc._rev;
                        _this.showConfirmOverwriteDlg(value);
                    }).catch(function () {
                        _this.activeProjectRev = null;
                        _this.saveActiveProject();
                    });
                };
                this.onWindowKeyDown = function (event) {
                    if (_this.dlgStack.length)
                        return;
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
                            _this.showProjectManager();
                            consume = true;
                        }
                    }
                    else if (shiftKey) {
                        if (keyCode == Key.N) {
                            _this.showConfirmDlg('Confirm New Project', 'Any unsaved changes will be lost.<br>Are you sure you want to continue?', 'NewProject');
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
                var _this = this;
                app.$window.on('keydown', this.onWindowKeyDown);
                this.projectsDb = new PouchDB('app-projects', { adapter: 'idb', revs_limit: 3, auto_compaction: true });
                this.projectsDb.createIndex({
                    index: { fields: ['name'] }
                }).then(function () {
                    _this.projectsDb.createIndex({
                        index: { fields: ['date'] }
                    });
                });
                // < Delete indices >
                // this.projectsDb.getIndexes().then((result) => {
                // 	for(var index of result.indexes)
                // 	{
                // 		if(index.ddoc)
                // 			this.projectsDb.deleteIndex(index);
                // 	}
                // });
                if (app.Config.loadLastProjectOnStartUp && app.Config.activeProject) {
                    // TODO: Implement loadLastProjectOnStartUp
                }
                else {
                    this.newProject();
                    callback();
                }
            };
            ProjectManager.prototype.getActiveProject = function () {
                return this.activeProject;
            };
            //
            ProjectManager.prototype.deleteProject = function (projectId) {
                var _this = this;
                var $projectItem = this.$projectItems[projectId];
                if ($projectItem) {
                    if ($projectItem.is(this.$selectedProjectItem)) {
                        this.selectProjectItem(null);
                    }
                    $projectItem.remove();
                    this.projectManagerDlg.reposition();
                }
                this.projectsDb.get(String(projectId)).then(function (doc) {
                    return _this.projectsDb.remove(doc);
                }).then(function () {
                    app.App.notice('Project deleted');
                }).catch(function () {
                    app.App.notice('ERROR: Unable to delete project', 'red');
                });
                delete this.$projectItems[projectId];
                this.projectCount--;
                if (this.activeProject.name == projectId) {
                    this.activeProjectRev = null;
                }
                if (this.projectCount < 1) {
                    this.setLoadingMessage('No projects found');
                }
            };
            ProjectManager.prototype.newProject = function () {
                this.activeProject = new projects.Project('New Project');
                this.activeProject.addModel(new Model());
            };
            ProjectManager.prototype.openProject = function (projectId) {
                var _this = this;
                // TODO: Implement opening
                this.projectManagerDlg.close();
                this.projectsDb.get(String(projectId)).then(function (doc) {
                    try {
                        doc.get = LoadData_get;
                        doc.asLoadData = LoadData_asLoadData;
                        _this.activeProject = projects.Project.load(doc);
                        _this.activeProjectRev = doc.rev;
                        app.main.setProject(_this.activeProject);
                    }
                    catch (error) {
                        app.App.notice('  > ' + error.toString(), 'red');
                        app.App.notice("Error loading project data: <strong>" + projectId + "</strong>", 'red');
                    }
                }).catch(function () {
                    app.App.notice("ERROR: Unable to open project: <strong>" + projectId + "</strong>", 'red');
                });
            };
            ProjectManager.prototype.save = function () {
                if (this.activeProjectRev == null) {
                    this.saveAs();
                    return;
                }
                this.saveActiveProject();
            };
            ProjectManager.prototype.saveAs = function () {
                this.showPromptDlg();
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
                }).catch(function (err) {
                    app.App.notice('Error saving project', 'red');
                    console.error(err);
                });
            };
            //
            ProjectManager.prototype.askDeleteProject = function (projectId) {
                this.showConfirmDlg('Confirm Delete', "<strong>" + projectId + "</strong><br><br>\n\t\t\t\tAre you sure you want to delete this project?<br>\n\t\t\t\tThis action cannot be undone.", 'DeleteProject', projectId);
            };
            //noinspection JSMethodCanBeStatic
            ProjectManager.prototype.disableButton = function ($button, disabled) {
                if (disabled === void 0) { disabled = true; }
                $button.prop('disabled', disabled).toggleClass('disable', disabled);
            };
            ProjectManager.prototype.selectProjectItem = function ($item) {
                if (this.$selectedProjectItem) {
                    this.$selectedProjectItem.removeClass('selected');
                }
                this.$selectedProjectItem = $item;
                if (this.$selectedProjectItem) {
                    this.$selectedProjectItem.addClass('selected');
                }
                this.disableButton(this.$openBtn, !this.$selectedProjectItem);
            };
            ProjectManager.prototype.selectPreviousProjectItem = function () {
                var $prev = null;
                if (this.$selectedProjectItem) {
                    $prev = this.$selectedProjectItem.prev();
                    if (!$prev.length)
                        $prev = null;
                }
                if (!$prev) {
                    $prev = this.$itemList.find('.project-item:last');
                }
                this.selectProjectItem($prev);
            };
            ProjectManager.prototype.selectNextProjectItem = function () {
                var $next = null;
                if (this.$selectedProjectItem) {
                    $next = this.$selectedProjectItem.next();
                    if (!$next.length)
                        $next = null;
                }
                if (!$next) {
                    $next = this.$itemList.find('.project-item:first');
                }
                this.selectProjectItem($next);
            };
            ProjectManager.prototype.setLoadingMessage = function (message) {
                this.$selectedProjectItem = null;
                this.$itemList
                    .empty()
                    .toggleClass('loading', message != null);
                if (message != null) {
                    this.$itemList.append('<div class="loading-message">' + message + '</div>');
                }
            };
            ProjectManager.prototype.showConfirmDlg = function (title, content, name, confirmValue, cancelValue) {
                if (!this.confirmDlg) {
                    this.confirmDlg = new Dialog('Confirm', {
                        type: 'warning',
                        content: 'Are you sure?',
                        buttons: [
                            { label: 'Yes', confirm: true, focus: true },
                            { label: 'No', cancel: true }
                        ],
                        closeOnClick: 'body',
                        confirm: this.onConfirm,
                        close: this.onDlgClose,
                        zIndex: 20000
                    });
                }
                if (this.dlgStack.indexOf(this.confirmDlg) != -1)
                    return;
                if (title != null)
                    this.confirmDlg.setTitle(title);
                if (content != null)
                    this.confirmDlg.setContent(content);
                if (name != null)
                    this.confirmDlg.setName(name);
                this.dlgStack.push(this.confirmDlg);
                this.confirmDlg.confirmValue = confirmValue;
                this.confirmDlg.cancelValue = cancelValue;
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
                        confirm: this.onOverwriteConfirm,
                        close: this.onDlgClose,
                        zIndex: 20000
                    });
                    this.$confirmOverwriteName = this.confirmOverwriteDlg.getContent().find('strong');
                }
                if (this.dlgStack.indexOf(this.confirmOverwriteDlg) != -1)
                    return;
                if (name != null) {
                    this.$confirmOverwriteName.html(name);
                }
                this.dlgStack.push(this.confirmOverwriteDlg);
                this.confirmOverwriteDlg.show();
            };
            ProjectManager.prototype.showProjectManager = function () {
                if (!this.projectManagerDlg) {
                    this.$contentPane = $('<div id="project-manager" tabindex="0"><div class="item-list"></div></div>')
                        .on('keydown', this.onProjectManagerKeyDown);
                    this.$itemList = this.$contentPane.find('.item-list')
                        .on('click', 'i', this.onProjectListAction)
                        .on('click', 'div.project-item', this.onProjectListItemSelect)
                        .on('dblclick', 'div.project-item', this.onProjectListItemDoubleClick);
                    this.projectManagerDlg = new Dialog('ProjectManager', {
                        name: 'ProjectManager',
                        icon: 'tasks',
                        content: this.$contentPane,
                        buttons: [
                            { label: 'Open', confirm: true },
                            { label: 'Cancel', cancel: true },
                            { label: 'Import', rightAlign: true }
                        ],
                        position: { x: 'center', y: 'top' },
                        offset: { y: 25 },
                        confirm: this.onConfirm,
                        close: this.onDlgClose,
                        button: this.onProjectManagerButtonClick
                    });
                    this.$buttons = this.projectManagerDlg.getButtons();
                    this.$openBtn = this.projectManagerDlg.getButton('Open');
                    this.$importBtn = this.projectManagerDlg.getButton('Import');
                    this.projectListTooltips = new jBox('Tooltip', { theme: 'TooltipDark' });
                }
                if (this.dlgStack.indexOf(this.projectManagerDlg) != -1)
                    return;
                this.setLoadingMessage('<i class="fa fa-spinner fa-spin"></i> Loading...');
                this.disableButton(this.$openBtn);
                this.disableButton(this.$importBtn);
                this.projectsDb.find({
                    selector: {
                        name: { $gte: null },
                        date: { $gte: null }
                    },
                    fields: ['_id', 'name'],
                    sort: [{ 'date': 'desc' }]
                }).then(this.updateProjectsList);
                this.dlgStack.push(this.projectManagerDlg);
                this.projectManagerDlg.show();
            };
            ProjectManager.prototype.showPromptDlg = function () {
                if (!this.promptDlg) {
                    this.promptDlg = new PromptDlg('Save As', {
                        confirm: this.onSaveAsConfirm,
                        close: this.onDlgClose
                    });
                }
                if (this.dlgStack.indexOf(this.promptDlg) != -1)
                    return;
                this.dlgStack.push(this.promptDlg);
                this.promptDlg.show(this.activeProject.name);
            };
            return ProjectManager;
        }());
        projects.ProjectManager = ProjectManager;
    })(projects = app.projects || (app.projects = {}));
})(app || (app = {}));
//# sourceMappingURL=ProjectManager.js.map