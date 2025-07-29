import type { SkinTheme } from '@asicupv/paella-core';

import "@fontsource/roboto/400.css";

import FullScreenIcon from './icons/fullscreen-icon.svg?raw';
import FullScreenExitIcon from './icons/fullscreen-exit.svg?raw';
import VolumeHighIcon from './icons/volume-high.svg?raw';
import VolumeMidIcon from './icons/volume-mid.svg?raw';
import VolumeLowIcon from './icons/volume-low.svg?raw';
import VolumeMuteIcon from './icons/volume-mute-cross.svg?raw';
import MaximizeIcon from './icons/maximize.svg?raw';
import MinimizeIcon from './icons/minimize.svg?raw';
import CloseIcon from './icons/close.svg?raw';
import PlayIcon from './icons/play.svg?raw';
import LayoutIcon from './icons/view-mode.svg?raw';
import BackwardIcon from './icons/backward.svg?raw';
import ForwardIcon from './icons/forward.svg?raw';
import CaptionsIcon from './icons/captions-icon.svg?raw';
import PhotoIcon from './icons/slides-icon.svg?raw';
import ArrowRightIcon from './icons/slide-next-icon.svg?raw';
import ArrowLeftIcon from './icons/slide-prev-icon.svg?raw';
import CirclePlayIcon from './icons/circle-play.svg?raw';
import LoaderCircleIcon from './icons/loader-circle.svg?raw';
import Settings from './icons/settings-icon.svg?raw';

import ThemeCSS from './theme.css?raw';

// "configOverrides2": {
//         "accessibility": {
//             "clickWithSpacebar": false
//         },
//         "progressIndicator": {
//             "inlineMode": false,
//             "showTotal": true,
//             "parentContainer": "buttonArea",
//             "side": "left",
//             "visible": false,
//             "showHandler": true,
//             "hideHandlerOnMouseOut": true,
//             "showRemainingProgress": true
//         },
//         "videoContainer": {
//             "overPlaybackBar": false,
//             "dynamicLayout": {
//                 "landscapeVerticalAlignment": "align-center",
//                 "portraitHorizontalAlignment": "align-center"
//             }
//         },
//         "plugins": {
//             "es.upv.paella.slideMapProgressBarPlugin": {
//                 "markColor": {
//                     "mouseOut": "#1F2937",
//                     "mouseHover": "#1F2937"
//                 },
//                 "markWidth": 2,
//                 "drawBackground": false
//             }
//         }
//     },
export const theme : SkinTheme = {
    "styleSheets": [ ThemeCSS ],
    "configOverrides" : {
        "buttonGroups": [
            {
                "groupName": "settingsGroup",
                "icon": Settings,
            }
        ],
    },
    "icons": [
        { "plugin": "es.upv.paella.fullscreenButton", "identifier": "fullscreenIcon", "icon": FullScreenIcon },
        { "plugin": "es.upv.paella.fullscreenButton", "identifier": "windowedIcon", "icon": FullScreenExitIcon },

        { "plugin": "es.upv.paella.volumeButtonPlugin", "identifier": "volumeHighIcon", "icon": VolumeHighIcon },
        { "plugin": "es.upv.paella.volumeButtonPlugin", "identifier": "volumeMidIcon", "icon": VolumeMidIcon },
        { "plugin": "es.upv.paella.volumeButtonPlugin", "identifier": "volumeLowIcon", "icon": VolumeLowIcon },
        { "plugin": "es.upv.paella.volumeButtonPlugin", "identifier": "volumeMuteIcon", "icon": VolumeMuteIcon },

        { "plugin": "es.upv.paella.dualVideoDynamic", "identifier": "iconMaximize", "icon": MaximizeIcon },
        { "plugin": "es.upv.paella.dualVideoDynamic", "identifier": "iconMimimize", "icon": MinimizeIcon },
        { "plugin": "es.upv.paella.dualVideoDynamic", "identifier": "iconClose", "icon": CloseIcon },

        { "plugin": "es.upv.paella.playPauseButton", "identifier": "play", "icon": PlayIcon },

        { "plugin": "es.upv.paella.layoutSelector", "identifier": "layoutIcon", "icon": LayoutIcon },

        { "plugin": "es.upv.paella.backwardButtonPlugin", "identifier": "backwardIcon", "icon": BackwardIcon },
        { "plugin": "es.upv.paella.forwardButtonPlugin", "identifier": "forwardIcon", "icon": ForwardIcon },

        { "plugin": "es.upv.paella.captionsSelectorPlugin", "identifier": "captionsIcon", "icon": CaptionsIcon },

        { "plugin": "es.upv.paella.frameControlButtonPlugin", "identifier": "photoIcon", "icon": PhotoIcon },

        { "plugin": "es.upv.paella.nextSlideNavigatorButton", "identifier": "arrowRightIcon", "icon": ArrowRightIcon },
        { "plugin": "es.upv.paella.prevSlideNavigatorButton", "identifier": "arrowLeftIcon", "icon": ArrowLeftIcon },

        { "plugin": "@asicupv/paella-core", "identifier": "playPreview", "icon": CirclePlayIcon },
        { "plugin": "@asicupv/paella-core", "identifier": "LoaderIcon", "icon": LoaderCircleIcon }
    ]
}
