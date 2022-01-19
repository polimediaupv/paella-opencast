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
  PopUpButtonPlugin,
  createElementWithHtmlText,
  translate
} from 'paella-core';

import '../css/DescriptionPlugin.css';

import InfoIcon from '../icons/info.svg';

export default class DescriptionPlugin extends PopUpButtonPlugin {
  async getContent() {
    const {
      title,
      creators,
      language,
      series,
      date,
      views
    } = this.player.videoManifest.metadata;
    const presenter = creators[0] || '';
    const collaborator = creators[1] || '';

    const content = createElementWithHtmlText(`
        <div class="description-plugin">
            <div class="table-column">
                <div class="table-item">
                    ${translate('Title')}:
                    <span class="item-value">${title}</span>
                </div>
                <div class="table-item">
                    ${translate('Presenter')}:
                    <span class="item-value">
                        <a href="/engage/ui/index.html?q=${presenter}">${presenter}</a>
                    </span>
                </div>
                <div class="table-item">
                    ${translate('Series')}:
                    <span class="item-value">
                        <a href="/engage/ui/index.html?epFrom=${series}">${series}</a>
                    </span>
                </div>
                <div class="table-item">
                    ${translate('Date')}:
                    <span class="item-value">${(new Date(date)).toLocaleDateString()}</span>
                </div>
                <div class="table-item">
                    ${translate('Views')}:
                    <span class="item-value">${views}</span>
                </div>
            </div>
            <div class="table-column">
                <div class="table-item">
                    ${translate('Collaborator')}:
                    <span class="item-value">${collaborator}</span>
                </div>
                <div class="table-item">
                    ${translate('Subject')}:
                    <span class="item-value"></span>
                </div>
                <div class="table-item">
                    ${translate('Language')}:
                    <span class="item-value">${language}</span>
                </div>
                <div class="table-item">
                    ${translate('Description')}:
                    <span class="item-value"></span>
                </div>
            </div>
        </div>
        `);

    return content;
  }

  get popUpType() {
    return 'no-modal';
  }

  async load() {
    this.icon = InfoIcon;
  }
}
