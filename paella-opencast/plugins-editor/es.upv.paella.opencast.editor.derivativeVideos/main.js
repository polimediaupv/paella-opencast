(function() {

    // TODO: Data delegate
    class ProcessDerivativeVideosDataDelegate extends paella.DataDelegate {
        read(context,params,onSuccess) {
            onSuccess({});
        }

        write(context,params,data,onSuccess) {
            // TODO: Send a flag to mark video
            onSuccess({});
        }
    }

    class DerivativeVideosDataDelegate extends paella.DataDelegate {
        read(context,params,onSuccess) {
            let exampleData = [
                {
                    id:1,
                    title:"Clip 1",
                    status:VideoStatus.NOT_SENT,
                    tracks: [
                        { id:1, s:50, e:100 },
                        { id:2, s:110, e:220 }
                    ]
                },
                {
                    id:2,
                    title:"Clip 2",
                    status:VideoStatus.PROCESSING,
                    tracks: [
                        { id:3, s:66, e:150 },
                        { id:4, s:160, e:300 }
                    ]
                },
                {
                    id:3,
                    title:"Clip 3",
                    status:VideoStatus.SENT,
                    videoUrl:"http://www.google.com",
                    tracks:[
                        { id:5, s:66, e:150 },
                        { id:6, s:160, e:300 }
                    ]
                }
            ];
            let data = paella.utils.cookies.get("derivativeVideo");
            try {
                data = JSON.parse(data);
            }
            catch(e) {
                e = [];
            }
            onSuccess(data);
        }

        write(context,params,data,onSuccess) {
            data = JSON.stringify(data);
            paella.utils.cookies.set("derivativeVideo",data);
            onSuccess({},true);
        }
    }



    paella.dataDelegates.DerivativeVideosDataDelegate = DerivativeVideosDataDelegate;
    paella.dataDelegates.ProcessDerivativeVideosDataDelegate = ProcessDerivativeVideosDataDelegate;

    let VideoStatus = {
        NOT_SENT: 0,
        SENT: 1,
        PROCESSING: 2,
        PROCESSED: 3
    };


    function notify() {
        for (let key in this._callbacks) {
            this._callbacks[key]();
        }    
    }

    class DerivativeVideosModel {
        constructor() {
            this._clips = null;
            this._currentClipIndex = -1;
            this._callbacks = {};
            this._duration = 0;
            this._currentTime = 0;
            paella.events.bind(paella.events.timeUpdate, (e,d) => {
                this._currentTime = d.currentTime;
            });
        }
        
        get currentClip() { return this.clips.length>this._currentClipIndex && this.clips[this._currentClipIndex]; }
        get currentClipIndex() { return this._currentClipIndex; }
        set currentClipIndex(index) {
            this._currentClipIndex = this.clips.length>index ? index:
                                                               this._currentClipIndex;
            notify.apply(this);
        }

        set currentClipId(id) {
            if (this.currentClip && id==this.currentClip.id) return;
            this.clips.some((c,i) => {
                if (c.id==id) {
                    this._currentClipIndex = i;
                    notify.apply(this);
                    return true;
                }
            });
        }
        get currentClipId() { return this.currentClip ? this.currentClip.id : -1; }
        get currentTracks() { return this.currentClip && this.currentClip.tracks; }
        get clips() { return this._clips; }

        allowModifyCurrent() {
            if (this.currentClip) {
                return this.currentClip.status == VideoStatus.NOT_SENT;
            }
            else {
                return true;
            }
        }

        addClip() {
            let newId = 1;            
            this.clips.forEach((clip) => {
                if (clip.id >= newId) {
                    newId = clip.id + 1;
                }
            });            
            this.clips.push({
                id: newId,
                title: "Clip " + newId,
                status: VideoStatus.NOT_SENT,
                tracks: []
            });
            this.currentClipId = newId;
            notify.apply(this);
        }

        removeCurrentClip() {
            if (this.currentClipIndex>=0) {
                this.clips.splice(this.currentClipIndex,1);
            }
            this._currentClipIndex = this.clips.length - 1;
            notify.apply(this);
        }

        addTrack() {
            if (!this.currentClip) {
                this.addClip();
            }
            let trackId = 1;
            let trackIds = [];
            this.clips.forEach((clip) => {
                clip.tracks.forEach((track) => {
                    trackIds.push(track.id);
                })
            })
            if (trackIds.length) {
                trackIds.sort();
                trackId = trackIds[trackIds.length-1] + 1;
            }
            let trackDuration = this._duration * 0.05;  // 2% of the video duration
            let end = this._currentTime + trackDuration<this._duration ? this._currentTime + trackDuration : this._duration;
            this.currentClip.tracks.push( { id:trackId, s:this._currentTime, e:end } );
        }

        removeTrack(trackId) {
            let trackIndex = -1;
            this.clips.some((clip) => {
                if (clip.tracks.some((track,index) => {
                    if (track.id==trackId) {
                        trackIndex = index;
                        return true;
                    }
                })) {
                    clip.tracks.splice(trackIndex,1);
                }
                return trackIndex!=-1;
            });
        }

        processCurrentClip() {
            return new Promise((resolve,reject) => {
                if (this.currentClip && this.currentClip.status==VideoStatus.NOT_SENT) {
                    this.currentClip.status = VideoStatus.SENT;
                    this.saveClips()
                        .then(() => {
                            paella.data.write("updateDerivativeVideos",{ id:paella.initDelegate.getId() },{},() => {
                                notify.apply(this);
                                resolve();
                            });
                        });
                }
                else {
                    reject();
                }
            });
        }

        cancelCurrentClip() {
            return new Promise((resolve,reject) => {
                if (this.currentClip && this.currentClip.status==VideoStatus.SENT) {
                    this.currentClip.status = VideoStatus.NOT_SENT;
                    this.saveClips()
                        .then(() => {
                            paella.data.write("updateDerivativeVideos",{ id:paella.initDelegate.getId() },{},() => {
                                notify.apply(this);
                                resolve();
                            });
                        });
                }
                else {
                    reject();
                }
            });
        }

        openCurrentVideo() {
	        window.open("watch.html?id=" + this.currentClip.mediapackageID, '_blank');            
        }

        loadClips() {
            if (this._clips) { 
                // The clips are loaded
                return Promise.resolve(this.clips);
            }
            else if (this._loading) {
                // The clips are being loaded
                return new Promise((resolve) => {
                    let checkLoaded = () => {
                        if (this._clips) {
                            resolve(this._clips);
                        }
                        else {
                            setTimeout(() => checkLoaded(),100);
                        }
                    }
                    checkLoaded();
                });
            }
            else {
                // The clips are not loaded
                this._loading = true;
                return new Promise((resolve) => {
                    paella.data.read('derivativeVideos', { id:paella.initDelegate.getId() },(data) => {
                        paella.player.videoContainer.duration()
                            .then((d) => {
                                this._duration = d;
                            
                                try {
                                    if (typeof(data)!="object") {
                                        data = JSON.parse(data);
                                    }
                                }
                                catch (e) {
                                    data = [];
                                }
                                this._clips = data;
                                this._clips.forEach((c) => {
                                    c.tracks.forEach((t) => {
                                        t.name = c.title;
                                        t.status = c.status;
                                    });
                                })
                                this._currentClipIndex = 0;
                                this._loading = false;
                                resolve(this.clips);
                            });
                    })
                });
            }
        }

        saveClips() {
            return new Promise((resolve) => {
                paella.data.write("derivativeVideos", { id:paella.initDelegate.getId() }, this.clips, () => {
                    resolve();
                });
            });
        }

        onModelChanged(source,callback) {
            this._callbacks[source] = callback;
        }
    };

    let derivativeVideosModel = new DerivativeVideosModel();
    paella.derivativeVideosModel = derivativeVideosModel;

    class DerivativeVideosTrackPlugin extends paella.editor.TrackPlugin {
        isEnabled() {
            return new Promise((resolve) => {
                let reloadClips = (cb) => {
                    derivativeVideosModel.loadClips()
                        .then(() => {
                            this._tracks = derivativeVideosModel.currentTracks;
                            if (cb) cb(true);
                        });    
                }
                derivativeVideosModel.onModelChanged(this,() => {
                    console.log("Reload clips");
                    this.notifyTrackChanged();
                    reloadClips();
                    
                });
                reloadClips(() => resolve(true));
                
            });
        }

        getIndex() { return 9000; }
        getName() { return "derivativeVideosPlugin"; }
        getTrackName() { return "Derivative Videos"; }
        getColor() { return "#3385FA"; }
        getTextColor() { return "#F0F0F0"; }
        getTrackItems() { return Promise.resolve(this._tracks || []); }
        allowResize() { return derivativeVideosModel.allowModifyCurrent(); }
        allowDrag() { return derivativeVideosModel.allowModifyCurrent(); }
        allowEditContent() { return derivativeVideosModel.allowModifyCurrent(); }
        setTimeOnSelect() { return false; }
        onTrackChanged(id,start,end) {}
        onTrackContentChanged(id,content) {}
        getSideBarPluginName() { return "Derivative Videos"; }

        onSelect(trackItemId) { this._currentId = trackItemId; }
        onUnselect() { this._currentId = null; }

        getTools() { return ["Create","Delete"]; }

        onToolSelected(toolName) {
            if (!derivativeVideosModel.allowModifyCurrent()) {
                return;
            }
            switch (toolName) {
            case 'Create':
                derivativeVideosModel.addTrack();
                break;
            case 'Delete':
                derivativeVideosModel.removeTrack(this._currentId);
                break;
            }
        }

        isToolEnabled(toolName) {
            return derivativeVideosModel.allowModifyCurrent();
        }

        isToggleTool(toolName) {
            return false;
        }

        onSave() {
            return new Promise((resolve) => {
                derivativeVideosModel.saveClips()
                    .then(() => resolve(true));
            });
        }
    }

    paella.editor.derivativeVideos = new DerivativeVideosTrackPlugin();

    let app = angular.module(paella.editor.APP_NAME);

    app.controller("DerivativeVideosController", ['$scope', 'PaellaEditor', function($scope,PaellaEditor) {
        $scope.clips = [];
        $scope.currentClip = {};
        $scope.currentClipId = -1;
        
        function clipModelUpdated(apply) {
            $scope.clips = derivativeVideosModel.clips;
            $scope.currentClip = derivativeVideosModel.currentClip;
            $scope.currentClipId = derivativeVideosModel.currentClipId;
            if (apply) $scope.$apply();
        }

        $scope.$watch('currentClip', function() {
            $scope.currentClipId = $scope.currentClip && $scope.currentClip.id;
            if (derivativeVideosModel.currentClipId!=Number($scope.currentClipId)) {
                derivativeVideosModel.currentClipId = Number($scope.currentClipId);
                clipModelUpdated(false);
            }
        });

        derivativeVideosModel.loadClips()
            .then(() => clipModelUpdated(true) );

        $scope.addClip = function() {
            derivativeVideosModel.addClip();
        };

        $scope.removeCurrentClip = function() {
            derivativeVideosModel.removeCurrentClip();
        };

        $scope.isSendDisabled = function() {
            return !derivativeVideosModel.currentTracks || derivativeVideosModel.currentTracks.length==0;
        };

        $scope.sendCurrentClip = function() {
            if ($scope.isSendDisabled()) {
                return;
            }
            derivativeVideosModel.processCurrentClip()
                .then(() => {});
        };

        $scope.cancelCurrentClip = function() {
            derivativeVideosModel.cancelCurrentClip()
                .then(() => {})
        };

        $scope.openVideo = function() {
            derivativeVideosModel.openCurrentVideo();
        };
    }]);

    app.directive("derivativeVideos", function() {
        return {
            restrict: "E",
            templateUrl: "templates/es.upv.paella.opencast.editor.derivativeVideos/content.html",
            controller:"DerivativeVideosController"
        };
    });
    
    class DerivativeVideosSideBar extends paella.editor.SideBarPlugin {
        isEnabled() {
            return Promise.resolve(true);
        }

        isVisible(PaellaEditor,PluginManager) {
			return Promise.resolve(PaellaEditor.currentTrack && PaellaEditor.currentTrack.pluginId=='derivativeVideosPlugin');
		}

        getName() { return "Derivative Videos"; }

        getTabName() { return "Derivative Videos"; }

        getDirectiveName() { return "derivative-videos"; }
    }

    new DerivativeVideosSideBar();

})();
