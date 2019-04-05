(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgNativeElectronService', ['ariaNgLocalizationService', function (ariaNgLocalizationService) {
        var electron = angular.isFunction(window.nodeRequire) ? nodeRequire('electron') : {};
        var remote = electron.remote || {
            require: function () {
                return {};
            }
        };
        var ipcRenderer = electron.ipcRenderer || {};
        var shell = electron.shell || {};
        var cmd = remote.require('./cmd') || {};
        var tray = remote.require('./tray') || {};
        var localfs = remote.require('./localfs') || {};

        var getSetting = function (item) {
            if (!remote || !remote.getGlobal) {
                return null;
            }

            var settings = remote.getGlobal('settings');

            if (!settings) {
                return null;
            }

            return settings[item];
        };

        var getCurrentWindow = function () {
            if (!remote || !remote.getCurrentWindow) {
                return {};
            }

            return remote.getCurrentWindow();
        };

        return {
            getRuntimeEnvironment: function () {
                if (!remote.process || !remote.process.versions) {
                    return null;
                }

                var versions = remote.process.versions;
                var items = [];

                items.push({name: 'Electron', value: versions.electron});
                items.push({name: 'Node.js', value: versions.node});
                items.push({name: 'Chrome', value: versions.chrome});
                items.push({name: 'V8', value: versions.v8});

                return items;
            },
            getVersion: function() {
                return getSetting('version');
            },
            getAriaNgVersion: function() {
                return getSetting('ariaNgVersion');
            },
            isDevMode: function () {
                return !!getSetting('isDevMode');
            },
            useCustomAppTitle: function () {
                return !!getSetting('useCustomAppTitle');
            },
            isLocalFSExists: function (fullpath) {
                return localfs.isExists(fullpath);
            },
            openExternalLink: function (url) {
                return shell.openExternal && shell.openExternal(url);
            },
            openFileInDirectory: function (dir, filename) {
                var fullpath = localfs.getFullPath(dir, filename);
                return shell.showItemInFolder && shell.showItemInFolder(fullpath);
            },
            onMainWindowEvent: function (event, callback) {
                getCurrentWindow().on && getCurrentWindow().on(event, callback);
            },
            onMainProcessMessage: function (messageType, callback) {
                ipcRenderer.on && ipcRenderer.on(messageType, callback);
            },
            initTray: function () {
                tray.init({
                    labels: {
                        ShowAriaNgNative: ariaNgLocalizationService.getLocalizedText('tray.ShowAriaNgNative'),
                        Exit: ariaNgLocalizationService.getLocalizedText('tray.Exit')
                    }
                });
            },
            setTrayLanguage: function () {
                tray.destroy();
                this.initTray();
            },
            getAndClearToBeCreatedTaskFilePath: function () {
                return cmd.getAndClearToBeCreatedTaskFilePath();
            },
            isMaximized: function () {
                return getCurrentWindow().isMaximized && getCurrentWindow().isMaximized();
            },
            minimizeWindow: function () {
                getCurrentWindow().minimize && getCurrentWindow().minimize();
            },
            maximizeOrRestoreWindow: function () {
                if (!this.isMaximized()) {
                    getCurrentWindow().maximize && getCurrentWindow().maximize();
                } else {
                    getCurrentWindow().unmaximize && getCurrentWindow().unmaximize();
                }
            },
            exitApp: function () {
                getCurrentWindow().close && getCurrentWindow().close();
            }
        };
    }]);
}());