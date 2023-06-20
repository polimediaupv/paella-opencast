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
import { DataPlugin } from 'paella-core';
import { getUrlFromOpencastServer } from '../js/PaellaOpencast';

/** Comment Example
const commentExample = [
  {
    'commentId': 2245185219,
    'time': 1,
    'length': 10,
    'isPrivate': false,
    'created': '2023-05-30T16:37:13.295Z',
    'displayName': 'Karen H. Dolan',
    'comment': 'The &quot;3 new handouts&quot; are listed on the course webiste.',
    'responses': [
      {
        'responseId': 2245185219,
        'isPrivate': false,
        'created': '2023-05-30T16:52:19.976Z',
        'displayName': 'Karen H. Dolan',
        'comment': 'Thank you for this information!'
      }
    ]
  }
];
*/

export default class SocialDataPlugin extends DataPlugin {
  async load() {
  }

  async read(_context, { videoId, operation }) {
    if (operation === 'canComment') {
      return await this.getCanComment(videoId);
    }
    if (operation === 'canChangeDisplayName') {
      return await this.getCanChangeDisplayName(videoId);
    }
    else if (operation === 'getDisplayName') {
      return await this.getDisplayName(videoId);
    }
    else {
      return await this.getComments(videoId);
    }
  }

  async write(_context, videoId, data) {
    if (data.operation === 'newComment') {
      return await this.addComment(videoId, data);
    }
    else if (data.operation === 'updateComment') {
      return await this.updateComment(videoId, data);
    }
    else if (data.operation === 'removeComment') {
      return await this.removeComment(videoId, data);
    }
    else if (data.operation === 'setDisplayName') {
      return await this.setDisplayName(videoId, data);
    }
    else {
      this.player.log.warn('SocialDataPlugin: No operation defined in write action.');
    }
  }


  async getCanChangeDisplayName() {
    return true;
  }
  async getDisplayName(videoId) {
    let displayName = null;
    try {
      // eslint-disable-next-line max-len
      const requestUrl = `/annotation/property?mediaPackageId=${videoId}&type=paella/timedComments&propertyName=displayName`;
      const response = await fetch(getUrlFromOpencastServer(requestUrl));
      if (response.ok) {
        displayName = await response.text();
      }
    }
    catch (e) {
      this.player.log.warn('Error loading users\'s display name');
    }
    return displayName;
  }

  async setDisplayName(videoId, data) {
    const { name } = data;
    this.player.log.info(`SocialDataPlugin: Set display name as ${name}.`);

    const params = new URLSearchParams({
      mediaPackageId: videoId,
      propertyValue: name,
      type: 'paella/timedComments',
      propertyName: 'displayName'
    });

    const response = await fetch('/annotation/property', {
      method: 'POST',
      body: params.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    });

    if (response.ok) {
      return true;
    }
    return false;
  }

  async getCanComment(videoId) {
    let canComment = false;
    try {
      const requestUrl = `/annotation/canAnnotate?mediaPackageId=${videoId}&type=paella/timedComments`;
      const response = await fetch(getUrlFromOpencastServer(requestUrl));
      if (response.ok) {
        canComment = JSON.parse(await response.text());
      }
    }
    catch (e) {
      this.player.log.warn('Error loading /annotation/canAnnotate');
    }
    return canComment;
  }

  async getComments(videoId) {
    let annotations = [];
    try {
      // &ifModifiedSince=1999-12-31T23:59:59Z
      const requestUrl = `/annotation/annotations.json?limit=30000&episode=${videoId}&type=paella/timedComments`;
      const response = await fetch(getUrlFromOpencastServer(requestUrl));
      if (response.ok) {
        const jsonRes = await response.json();
        if (jsonRes.annotations?.annotation) {
          annotations = Array.isArray(jsonRes.annotations?.annotation)
            ? jsonRes.annotations?.annotation
            : [jsonRes.annotations?.annotation];
        }
      }
    }
    catch (e) {
      this.player.log.warn(`Error loading annotations for video ${videoId}`);
    }
    const response = await this.transformCommentsFromAnnotations(annotations);
    return response;
  }

  async transformCommentsFromAnnotations(annotations) {
    annotations = annotations.map(a=>{ return {...a, value: JSON.parse(a.value)};});
    const comments = annotations.filter(ann => ann.value.timedComment.mode == 'comment');
    const replys = annotations.filter(ann => ann.value.timedComment.mode == 'reply');

    const map = new Map(comments.map((ann) => [`${ann.annotationId}`, {
      'commentId': `${ann.annotationId}`,
      'time': ann.inpoint,
      'length': ann.length,
      'isPrivate': ann.isPrivate,
      'created': new Date(ann.created),
      'displayName': ann.value.timedComment.displayName,
      'comment': ann.value.timedComment.value,
      'responses': []
    }]));

    replys.forEach((reply => {
      const parentId = reply.value.timedComment.parent;
      if (!map.has(parentId)) {
        // eslint-disable-next-line max-len
        this.player.log.info(`AnnotationId=${reply.annotationId} with parentId=${parentId}. But parent does not exist!`);
      }
      else {
        const v = map.get(parentId);
        v.responses.push({
          'responseId': reply.annotationId,
          'isPrivate': reply.isPrivate,
          'created': new Date(reply.created),
          'displayName': reply.value.timedComment.displayName,
          'comment': reply.value.timedComment.value,
        });
      }
    }));

    const response = [...map.values()];
    return response;
  }

  async addComment(videoId, data) {
    if (data.parentCommentId) {
      this.player.log.info(`TODO: [${videoId}] Add reply to comment ${data.parentCommentId}: ${data.comment}`);
    }
    else {
      // eslint-disable-next-line max-len
      this.player.log.info(`TODO: [${videoId}] New comment time=${data.time}, private=${data.isPrivate}: ${data.comment}`);
    }
  }

  async updateComment(_videoId, _data) {
    this.player.log.debug('Not implemented: SocialDataPlugin:updateComment');
  }
  async removeComment(_videoId, _data) {
    this.player.log.debug('Not implemented: SocialDataPlugin:removeComment');
  }
}
