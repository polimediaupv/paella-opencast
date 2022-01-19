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
  PopUpButtonPlugin,
  translate
} from 'paella-core';

import '../css/DownloadsPlugin.css';

import DownloadIcon from '../icons/download.svg';

export default class DownloadsPlugin extends PopUpButtonPlugin {
  async load() {
    this.icon = DownloadIcon;

    const { streams } = this.player.videoManifest;
    this._downloads = [];

    streams.forEach(s => {
      const { mp4 } = s.sources;
      if (mp4) {
        mp4.forEach(v => {
          this._downloads.push({
            id: `${ s.content }_${v.res.w}_${v.res.h}`,
            src: v.src
          });
        });
      }
    });
  }

  async getContent() {
    const container = createElementWithHtmlText(`
        <div class="downloads-plugin">
            <h4>${ translate('Available downloads') }
        </div>`);
    const list = createElementWithHtmlText('<ul></ul>', container);

    this._downloads.forEach(d => {
      createElementWithHtmlText(`
                <li><a href="${d.src}" target="_blank">${d.id}</a></li>
            `, list);
    });

    return container;
  }
}
