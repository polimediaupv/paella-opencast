/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 *
 * The Apereo Foundation licenses this file to you under the Educational
 * Community License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License
 * at:
 *
 *   http://opensource.org/licenses/ecl2.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 */
import {
  createElementWithHtmlText,
  PopUpButtonPlugin
} from 'paella-core';

import ListIcon from '../icons/info.svg';

import '../css/edu.harvard.dce.paella.infoPlugin.css';

export default class dceInfoPlugin extends PopUpButtonPlugin {
  constructor () {
    super(...arguments);
    this._classHandoutKey = 'Class Handout';
    this._classHandouts = [];
    this._privacyPolicyLink = 'https://www.extension.harvard.edu/privacy-policy';
  }

  async trackButtonClick(buttonAction) {
    const context = this.config.context || 'userTracking';
    const trackingData = {
      event: 'paella:info:select',
      params: buttonAction
    };
    await this.player.data.write(
      context,
      { id: this.player.videoId },
      trackingData
    );
  }

  async load() {
    this.icon = this.player.getCustomPluginIcon(this.name, 'buttonIcon') || ListIcon;
  }

  get popUpType() {
    return 'modal'; // "modal", "timeline" or "no-modal"
  }

  async getContent() {
    const content = createElementWithHtmlText('<div id="dce-info-popup"></div>');

    var buttonActions = [ 'About player', 'Report a problem', 'System status',
      'Privacy policy', this._classHandoutKey, 'All Course Videos'];
    // #DCE MATT-2438, remove the 'All Course Videos' when the player is directly embedded
    if (window != window.top) {
      buttonActions = [ 'About player', 'Report a problem', 'System status',
        'Privacy policy', this._classHandoutKey];
    }

    content.append(this.getItemTitle());
    buttonActions.forEach((item) => {
      if (this.checkItemEnabled(item)) {
        content.append(this.getItemButton(item));
      }
    });


    return content;
  }

  getItemTitle () {
    const metadata = this.player?.videoManifest?.metadata;
    const titleDiv = metadata.title ? '<span>' + metadata.title + '</span>' : '';
    const seriesTitleDiv = metadata.seriestitle ? '<span>' + metadata.seriestitle + '</span>' : '';
    const elem = createElementWithHtmlText(`<div class="infoPubTitle"> ${titleDiv} ${seriesTitleDiv}</div>`);

    return elem;
  }

  getItemButton (buttonAction) {
    const elem = createElementWithHtmlText(`<div class="infoItemButton">${buttonAction}</div>`);
    elem.addEventListener('click', () => {
      this.onItemClick(buttonAction);
    });
    return elem;
  }

  async onItemClick (buttonAction) {
    // OPC-228 add usertracking to info option selection
    await this.trackButtonClick(buttonAction);

    const metadata = this.player?.videoManifest?.metadata;
    switch (buttonAction) {
    case ('About player'): {
      let param = this.player.videoContainer.isLiveStream ? 'show=live' : 'show=vod';
      const timedCommentsHeatmapPlugin = this.player.getPlugin('edu.harvard.dce.paella.timedCommentsHeatmapPlugin');
      if (await timedCommentsHeatmapPlugin?.button?.isEnabled()) {
        param = param + '&timedcomments';
      }
      window.open('watchAbout.html?' + param);
      break;
    }
    case ('Privacy policy'):
      window.open(this._privacyPolicyLink);
      break;
    case ('Report a problem'): {
      let paramsP = 'ref=' + this.getVideoUrl() + '&server=MH';
      if (metadata) {
        paramsP += metadata?.opencast?.episode?.dcIsPartOf
          ? '&offeringId=' + metadata?.opencast?.episode?.dcIsPartOf
          : '';
        paramsP += metadata?.opencast?.episode?.dcType
          ? '&typeNum=' + metadata?.opencast?.episode?.dcType
          : '';
        paramsP += metadata?.opencast?.episode?.dcContributor
          ? '&ps=' + metadata?.opencast?.episode?.dcContributor
          : '';
        paramsP += metadata?.opencast?.episode?.dcCreated
          ? '&cDate=' + metadata?.opencast?.episode?.dcCreated
          : '';
        paramsP += metadata?.opencast?.episode?.dcSpatial
          ? '&cAgent=' + metadata?.opencast?.episode?.dcSpatial
          : '';
        paramsP += metadata?.opencast?.episode?.id
          ? '&id=' + metadata?.opencast?.episode?.id
          : '';
      }
      window.open('../ui/index2.html#/rap?' + paramsP);
      break;
    }
    case ('System status'):
      window.open('http://status.dce.harvard.edu');
      break;
    case ('All Course Videos'):
      if (metadata?.series) {
        const seriesId = metadata?.series;
        // MATT-1373 reference combined pub list page when series looks like the DCE <academicYear><term><crn>
        if (seriesId.toString().match('^[0-9]{11}$')) {
          const academicYear = seriesId.toString().slice(0, 4);
          const academicTerm = seriesId.toString().slice(4, 6);
          const courseCrn = seriesId.toString().slice(6, 11);
          location.href = '../ui/index2.html#/' + academicYear + '/' + academicTerm + '/' + courseCrn;
        } else {
          // For an unknown series signature, reference the old 1.4x MH only, pub list page
          location.href = '../ui/publicationListing.shtml?seriesId=' + seriesId;
        }
      } else {
        // TODO
        // const message = 'No other lectures found.';
        // paella.messageBox.showMessage(message);
      }
      break;
    case (this._classHandoutKey):
      // Only one handout enabled
      if (this._classHandouts.length > 0) {
        window.open(this._classHandouts[0].url);
      }
      break;
    }
  }

  getVideoUrl () {
    return document.location.href;
  }

  checkItemEnabled (item) {
    if (item === this._classHandoutKey) {
      var isenabled = this.checkClassHandouts();
      return isenabled;
    } else {
      return true;
    }
  }

  checkClassHandouts () {
    // retrieve any attached handouts (type "attachment/notes")
    var attachments = this.player?.videoManifest?.metadata?.opencast?.episode?.mediapackage.attachments.attachment;
    if (!(attachments instanceof Array)) {
      attachments = [attachments];
    }
    // Checking for multiple handouts, but only enabling one
    for (var i = 0; i < attachments.length;++ i) {
      var attachment = attachments[i];
      if (attachment !== undefined) {
        if (attachment.type == 'attachment/notes') {
          this._classHandouts.push(attachment);
        }
      }
    }
    var isenabled = (this._classHandouts.length > 0);
    return isenabled;
  }


}
