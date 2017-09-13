var app;
(function (app) {
    var timeline;
    (function (timeline_1) {
        var EditMode = app.model.EditMode;
        var Key = KeyCodes.Key;
        var TimelineToolbar = (function () {
            function TimelineToolbar(model, timeline, $toolbar) {
                var _this = this;
                /*
                 * Events
                 */
                this.onAnimationChange = function (animation, event) {
                    var type = event.type;
                    if (type == 'position' || type == 'clear') {
                        _this.updateFrameLabel();
                    }
                    else if (type == 'length') {
                        _this.updateFrameLabel();
                    }
                };
                this.onAnimEditDlgButtonClick = function (event) {
                    _this.acceptAnimEdit(event.target.innerText == 'Save');
                };
                this.onAnimEditDlgInputKeyPress = function (event) {
                    if (event.keyCode == Key.Enter) {
                        _this.acceptAnimEdit(true);
                    }
                };
                this.onAnimEditDlgOpen = function (event) {
                    _this.$animEditName.val(_this.animation.name);
                    _this.$animEditFps.val(_this.animation.fps);
                    _this.$animEditLoop.prop('checked', _this.animation.loop);
                };
                this.onAnimationSelect = function (event) {
                    _this.model.setActiveAnimation(_this.$animationSelect.val());
                };
                this.onDeleteConfirmDlgOpen = function (event) {
                    _this.$deleteConfirmDlg.find('strong').html(_this.animation.name);
                };
                this.onDeleteConfirmClick = function (event) {
                    if (event.target.innerText == 'Yes') {
                        _this.model.deleteAnimation();
                    }
                    _this.deleteConfirmDlg.close();
                };
                this.onModelAnimationChange = function (animation, event) {
                    var type = event.type;
                    if (type == 'updateAnimationList' || type == 'newAnimation') {
                        _this.$animationSelect.empty();
                        var animList = _this.model.getAnimationList();
                        var i = 0;
                        for (var _i = 0, animList_1 = animList; _i < animList_1.length; _i++) {
                            var anim = animList_1[_i];
                            _this.$animationSelect.append($("<option>" + (i > 0 ? anim.name : 'None') + "</option>"));
                            i++;
                        }
                        if (type == 'newAnimation') {
                            animation.change.on(_this.onAnimationChange);
                        }
                    }
                    if (type == 'setAnimation' || type == 'updateAnimationList') {
                        _this.animation = animation;
                        _this.$animationSelect.val(animation.name);
                    }
                };
                this.onToolbarButtonClick = function (event) {
                    _this.timeline.focus();
                    var mode = _this.timeline.getMode();
                    var $btn = $(event.target);
                    if ($btn.hasClass('disabled'))
                        return;
                    var type = $btn.data('action');
                    if (mode != EditMode.EDIT) {
                        if (type == 'play' || type == 'pause') {
                            _this.timeline.togglePlayback();
                        }
                    }
                    if (mode == EditMode.ANIMATE) {
                        if (type == 'prev-frame') {
                            _this.timeline.prevFrame(event.shiftKey);
                        }
                        else if (type == 'next-frame') {
                            _this.timeline.nextFrame(event.shiftKey);
                        }
                        else if (type == 'prev-keyframe') {
                            _this.animation.gotoPrevKeyframe();
                        }
                        else if (type == 'next-keyframe') {
                            _this.animation.gotoNextKeyframe();
                        }
                        else if (type == 'insert-keyframe') {
                            _this.animation.forceKeyframe(event.shiftKey ? null : _this.model.getSelectedNode());
                        }
                        else if (type == 'delete-keyframe') {
                            _this.animation.deleteKeyframe(event.shiftKey ? null : _this.model.getSelectedNode());
                        }
                        else if (type == 'trim-length') {
                            _this.animation.trimLength();
                        }
                    }
                    if (type == 'add-anim') {
                        _this.model.addNewAnimation(null, true);
                    }
                    else if (type == 'delete-anim') {
                    }
                };
                this.model = model;
                this.timeline = timeline;
                this.model.animationChange.on(this.onModelAnimationChange);
                this.animation = model.getActiveAnimation();
                this.animation.change.on(this.onAnimationChange);
                this.$toolbar = $toolbar;
                this.$frameLabel = this.$toolbar.find('.frame-label .value');
                this.$toolbarButtons = this.$toolbar.find('i');
                this.$animControlButtons = this.$toolbarButtons.filter('.anim-controls');
                this.$playButton = this.$toolbar.find('.btn-play');
                this.$pauseButton = this.$toolbar.find('.btn-pause');
                this.$editAnimButton = this.$toolbar.find('.btn-edit-anim');
                this.$deleteAnimButton = this.$toolbar.find('.btn-delete-anim');
                this.$animationSelect = this.$toolbar.find('select')
                    .on('change', this.onAnimationSelect);
                this.$toolbar
                    .on('click', 'i', this.onToolbarButtonClick);
                tippy(this.$toolbar.find('i, select').toArray());
                this.$deleteConfirmDlg = $('#anim-delete-confirm-dlg');
                this.$deleteConfirmDlg.find('button').on('click', this.onDeleteConfirmClick);
                this.deleteConfirmDlg = new jBox('Modal', {
                    title: 'Delete this animation?',
                    attach: this.$deleteAnimButton,
                    overlay: false,
                    position: { x: 'right', y: 'bottom' },
                    offset: { y: 10 },
                    outside: 'y',
                    closeButton: false,
                    closeOnEsc: true,
                    closeOnClick: 'body',
                    content: this.$deleteConfirmDlg,
                    target: this.$deleteAnimButton,
                    trigger: 'click',
                    onOpen: this.onDeleteConfirmDlgOpen
                });
                this.$animEditDlg = $('#anim-properties-dlg');
                this.$animEditDlg.find('button').on('click', this.onAnimEditDlgButtonClick);
                this.$animEditDlg.on('keypress', 'input', this.onAnimEditDlgInputKeyPress);
                this.animEditDlg = new jBox('Modal', {
                    title: 'Animation Settings',
                    attach: this.$editAnimButton,
                    overlay: false,
                    position: { x: 'right', y: 'bottom' },
                    offset: { y: 10 },
                    outside: 'y',
                    closeButton: true,
                    closeOnEsc: true,
                    closeOnClick: 'body',
                    content: this.$animEditDlg,
                    target: this.$editAnimButton,
                    trigger: 'click',
                    onOpen: this.onAnimEditDlgOpen
                });
                this.$animEditName = this.$animEditDlg.find('#anim-prop-name');
                this.$animEditFps = this.$animEditDlg.find('#anim-prop-fps');
                this.$animEditLoop = this.$animEditDlg.find('#anim-prop-loop');
                this.updateFrameLabel();
                this.updateToolbarButtons();
            }
            TimelineToolbar.prototype.updateFrameLabel = function () {
                this.$frameLabel.text((this.animation.getPosition() + 1) + '/' + this.animation.getLength());
            };
            TimelineToolbar.prototype.updateToolbarButtons = function () {
                var mode = this.timeline.getMode();
                var inEditMode = (mode == EditMode.EDIT);
                if (mode == EditMode.PLAYBACK) {
                    this.$playButton.hide();
                    this.$pauseButton.show();
                }
                else {
                    this.$playButton.show();
                    this.$pauseButton.hide();
                }
                if (mode == EditMode.ANIMATE) {
                    this.$animControlButtons.removeClass('disabled');
                }
                else {
                    this.$animControlButtons.addClass('disabled');
                }
                this.$playButton.toggleClass('disabled', inEditMode);
                this.$pauseButton.toggleClass('disabled', inEditMode);
                this.$frameLabel.parent().toggleClass('disabled', inEditMode);
                this.$editAnimButton.toggleClass('disabled', inEditMode);
                this.$deleteAnimButton.toggleClass('disabled', inEditMode);
            };
            TimelineToolbar.prototype.acceptAnimEdit = function (accept) {
                if (accept === void 0) { accept = true; }
                if (accept) {
                    this.model.renameAnimation(this.animation, this.$animEditName.val());
                    this.animation.fps = parseFloat(this.$animEditFps.val());
                    if (isNaN(this.animation.fps) || this.animation.fps <= 0)
                        this.animation.fps = 30;
                    this.animation.loop = this.$animEditLoop.prop('checked');
                }
                this.animEditDlg.close();
            };
            return TimelineToolbar;
        }());
        timeline_1.TimelineToolbar = TimelineToolbar;
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TimelineToolbar.js.map