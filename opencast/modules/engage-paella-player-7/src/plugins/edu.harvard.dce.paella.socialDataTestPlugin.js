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
/* eslint-disable max-len */
import { DataPlugin } from 'paella-core';
import { v4 as uuidv4 } from 'uuid';

/** Comment Example
const commentExample = [
  {
    'commentId': 2245185219,
    'time': 1,
    'length': 10,
    'isPrivate': false,
    'created': '2023-05-30T16:37:13.295Z',
    'displayName': 'John Doe',
    'comment': 'The &quot;3 new handouts&quot; are listed on the course webiste.',
    'responses': [
      {
        'responseId': 2245185219,
        'isPrivate': false,
        'created': '2023-05-30T16:52:19.976Z',
        'displayName': 'John Doe',
        'comment': 'Thank you for this information!'
      }
    ]
  }
];
*/

let displayNameData = 'John Doe';
let commentsData = [
  {
    'commentId': '2245185219',
    'time': 1,
    'length': 10,
    'isPrivate': false,
    'created': new Date('2023-05-30T20:37:13.000'),
    'displayName': 'John Doe',
    'comment': 'The &quot;3 new handouts&quot; are listed on the course webiste.',
    'responses': [
      {
        'responseId': 2245459283,
        'isPrivate': false,
        'created': new Date('2023-05-30T20:52:20.000'),
        'displayName': 'John Doe',
        'comment': 'Thank you for this information!'
      },
      {
        'responseId': 2245459284,
        'isPrivate': false,
        'created': new Date('2023-06-01T18:32:52.000'),
        'displayName': 'Jane',
        'comment': 'Can I reply?'
      }
    ]
  },
  {
    'commentId': '2245459285',
    'time': 1,
    'length': 10,
    'isPrivate': false,
    'created': new Date('2023-06-01T18:39:55.000'),
    'displayName': 'Jane',
    'comment': 'Another comment in time 1s?',
    'responses': []
  },
  {
    'commentId': '2245185224',
    'time': 11,
    'length': 10,
    'isPrivate': false,
    'created': new Date('2023-05-30T20:45:20.000'),
    'displayName': 'John Doe',
    'comment': 'This is moving really fast, we need a section to catch up',
    'responses': []
  },
  {
    'commentId': '2245185225',
    'time': 15,
    'length': 10,
    'isPrivate': false,
    'created': new Date('2023-05-30T20:45:41.000'),
    'displayName': 'John Doe',
    'comment': 'The links are done in side the linked object',
    'responses': []
  },
  {
    'commentId': '2245185226',
    'time': 30,
    'length': 10,
    'isPrivate': false,
    'created': new Date('2023-05-30T20:46:07.000'),
    'displayName': 'John Doe',
    'comment': 'Wow how many linked lists are there?',
    'responses': [
      {
        'responseId': 2245459277,
        'isPrivate': false,
        'created': new Date('2023-05-30T20:46:40.000'),
        'displayName': 'John Doe',
        'comment': 'The instructor is saying there are two, in this case, forward pointing and both forward and backward pointing'
      }
    ]
  },
  {
    'commentId': '2245459278',
    'time': 43,
    'length': 10,
    'isPrivate': false,
    'created': new Date('2023-05-30T20:47:19.000'),
    'displayName': 'John Doe',
    'comment': 'The singly linked list is much more simple, but you have to iterate the whole list to find the insertion point',
    'responses': []
  },
  {
    'commentId': '2245459279',
    'time': 63,
    'length': 10,
    'isPrivate': false,
    'created': new Date('2023-05-30T20:48:09.000'),
    'displayName': 'John Doe',
    'comment': 'The lagging pointers make sense, but it&#39;s more variables to have to track',
    'responses': [
      {
        'responseId': 2245459280,
        'isPrivate': false,
        'created': new Date('2023-05-30T20:48:48.000'),
        'displayName': 'John Doe',
        'comment': 'You only have to track the pointers while you are iterating the list'
      }
    ]
  },
  {
    'commentId': '2245459281',
    'time': 111,
    'length': 10,
    'isPrivate': false,
    'created': new Date('2023-05-30T20:49:23.000'),
    'displayName': 'John Doe',
    'comment': 'Which code is being referenced?',
    'responses': [
      {
        'responseId': 2245459282,
        'isPrivate': false,
        'created': new Date('2023-05-30T20:49:52.000'),
        'displayName': 'John Doe',
        'comment': 'It can be in any code. This is a general description of iterating over linked lists'
      }
    ]
  },
  {
    'commentId': '2245185220',
    'time': 116,
    'length': 10,
    'isPrivate': false,
    'created': new Date('2023-05-30T20:40:17.000'),
    'displayName': 'John Doe',
    'comment': 'This is where the logic for inserting into a single directional Linked List is located',
    'responses': []
  },
  {
    'commentId': '2245185221',
    'time': 259,
    'length': 10,
    'isPrivate': false,
    'created': new Date('2023-05-30T20:42:33.000'),
    'displayName': 'John Doe',
    'comment': 'Where does the item go that is removed?',
    'responses': [
      {
        'responseId': 2245185222,
        'isPrivate': false,
        'created': new Date('2023-05-30T20:42:56.000'),
        'displayName': 'John Doe',
        'comment': 'The item has to be referenced before you remove it in order to use the item!'
      },
      {
        'responseId': 2245185223,
        'isPrivate': false,
        'created': new Date('2023-05-30T20:44:06.000'),
        'displayName': 'John Doe',
        'comment': 'If there is no reference to that item, it might get garbage collected, depending on the code that  implements the list.'
      }
    ]
  }
];

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
      this.player.log.warn('SocialDataTestPlugin: No operation defined in write action.');
    }
  }


  async getCanChangeDisplayName() {
    return true;
  }
  async getDisplayName(_videoId) {
    return displayNameData;
  }

  async setDisplayName(_videoId, data) {
    const { name } = data;
    this.player.log.info(`SocialDataTestPlugin: Set display name as ${name}.`);
    displayNameData = name;
  }

  async getCanComment(_videoId) {
    return true;
  }

  async getComments(_videoId) {
    /* apply soft Trimming */
    let filtered = commentsData;
    if (this.player.videoContainer.isTrimEnabled === true) {
      filtered = commentsData.filter(c => {
        return (this.player.videoContainer.trimStart <= c.time)
          && (c.time <= this.player.videoContainer.trimEnd);
      });
      filtered = filtered.map(c => {
        return {
          ...c,
          time: c.time - this.player.videoContainer.trimStart
        };
      });
    }
    return filtered;
  }

  async addComment(videoId, data) {
    if (data.parentCommentId) {
      const newResponse = {
        'responseId': uuidv4(),
        'isPrivate': data.isPrivate,
        'created': new Date(),
        'displayName': displayNameData,
        'comment': data.comment
      };

      const mm = commentsData?.map((obj) => [obj.commentId, {
        'commentId': obj.commentId,
        'time': obj.time,
        'length': obj.length,
        'isPrivate': obj.isPrivate,
        'created': obj.created,
        'displayName': obj.displayName,
        'comment': obj.comment,
        'responses': obj.responses.map((r)=>{return {
          'responseId': r.responseId,
          'isPrivate': r.isPrivate,
          'created': r.created,
          'displayName': r.displayName,
          'comment': r.comment
        };})
      }]);
      const M = new Map(mm);

      if (M.has(data.parentCommentId)) {
        const comment = M.get(data.parentCommentId);
        comment.responses.push(newResponse);
      }
      commentsData = [...M.values()];
    }
    else {
      /* apply soft trimming */
      let time = data.time;
      if (this.player.videoContainer.isTrimEnabled === true) {
        time = time + this.player.videoContainer.trimStart;
      }
      const newComment = {
        'commentId': uuidv4(),
        'time': time,
        'length': 10,
        'isPrivate': data.isPrivate,
        'created': new Date(),
        'displayName': displayNameData,
        'comment': data.comment,
        'responses': []
      };
      commentsData = [...commentsData, newComment].sort((a,b) => a.time - b.time);
    }
  }

  async updateComment(_videoId, _data) {
    this.player.log.debug('Not implemented: SocialDataTestPlugin:updateComment');
  }
  async removeComment(_videoId, _data) {
    this.player.log.debug('Not implemented: SocialDataTestPlugin:removeComment');
  }
}
