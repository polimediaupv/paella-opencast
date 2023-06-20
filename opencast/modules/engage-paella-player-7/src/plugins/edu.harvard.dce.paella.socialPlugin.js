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
/* eslint-disable no-alert */
import {
  createElementWithHtmlText,
  PopUpButtonPlugin,
  Events,
  utils
} from 'paella-core';

import ListIcon from '../icons/forum.svg';
import { render } from 'preact';
import { signal } from '@preact/signals';

import '../css/edu.harvard.dce.paella.socialPlugin.css';



export default class SocialPlugin extends PopUpButtonPlugin {
  constructor() {
    super(...arguments);

    this._canChangeDisplayName = signal(false);
    this._displayName = signal(null);
    this._currentTime = signal(0);
    this._comments = signal([]);
  }

  get moveable() {
    return true;
  }

  get resizeable() {
    return true;
  }

  get closeActions() {
    return {
      clickOutside: false,
      closeButton: true
    };
  }

  get customPopUpClass() {
    return 'social-plugin-popup';
  }

  get menuTitle() {
    return 'Social comments';
  }

  async isEnabled() {
    if (!(await super.isEnabled())) {
      return false;
    }

    const canComment = await this.player.data.read('timedComments', {
      videoId: this.player.videoId,
      operation: 'canComment'
    });

    // prevent annots on live stream for now, until test live video inpoints
    const isLiveStream = this.player.videoContainer.isLiveStream;
    // Force annots off with special URL param, social=off
    let disabledByQueryParam = false;
    const queryParam = this.config.queryParamDisable;
    if (queryParam) {
      const url = new URL(window.location.href);
      const q = url.searchParams.get(queryParam);
      if (q) {
        disabledByQueryParam = q.toLowerCase() == 'off'
          || q.toLowerCase() == 'no'
          || q.toLowerCase() == 'false';
      }
    }

    const enabled = canComment && (!isLiveStream) && (!disabledByQueryParam);
    return enabled;
  }

  async load() {
    this.icon = this.player.getCustomPluginIcon(this.name, 'buttonIcon') || ListIcon;

    this.player.bindEvent(Events.PLAY, (params) => { this.onPlay(params); });
    this.player.bindEvent(Events.PAUSE, (params) => { this.onPause(params); });
    this.player.bindEvent(Events.ENDED, (params) => { this.onEndVideo(params); });
    this.player.bindEvent(Events.TIMEUPDATE, (params) => { this.onTimeUpdate(params); });

    this.reloadComments();
    this.getDisplayName();
    this.canChangeDisplayName();

    if (this.config.timerReloadComments && this.config.timerReloadComments > 0) {
      // Reload Comments
      setInterval(()=>{
        this.reloadComments();
      }, this.config.timerReloadComments);
    }
  }

  get popUpType() {
    return 'no-modal'; // "modal", "timeline" or "no-modal"
  }

  async getContent() {
    const content = createElementWithHtmlText('<div id="social-plugin-popup"></div>');
    content.addEventListener('click', evt => evt.stopPropagation());
    content.addEventListener('keyup', evt => evt.stopPropagation());

    function decodeHTMLEntities(text) {
      var textArea = document.createElement('textarea');
      textArea.innerHTML = text;
      return textArea.value;
    }
    // function encodeHTMLEntities(text) {
    //   var textArea = document.createElement('textarea');
    //   textArea.innerText = text;
    //   return textArea.innerHTML;
    // }

    // eslint-disable-next-line no-unused-vars
    const SocialResponseBlock = ({ response, ...props }) => {
      const responseText = decodeHTMLEntities(response.comment);
      const responseDisplayName = response.displayName;
      const responseDate = new Intl.DateTimeFormat(navigator.languages, {
        dateStyle: 'medium',
        timeStyle: 'long'
      }).format(response.created);

      return (
        <div class="sp_comment sp_reply">
          <div class="sp_comment_text sp_reply_text">{responseText}</div>
          <div class="sp_comment_data">
            <span class="user_icon"></span>
            <span class="user_name">{responseDisplayName}</span>, <span class="user_comment_date">{responseDate}</span>
          </div>
        </div>
      );
    };

    // eslint-disable-next-line no-unused-vars
    const SocialCommentBlock = ({ commentBlock, ...props }) => {
      const handleNewReply = async (event) => {
        event.preventDefault();
        if (!this._displayName.value) {
          await askAndChangeDisplayName();
        }
        if (this._displayName.value) {
          const form = event.target;
          const formData = new FormData(form);

          this.player.data.write('timedComments', this.player.videoId, {
            operation: 'newComment',
            parentCommentId: formData.get('parentCommentId'),
            comment: formData.get('comment')
          });
          form.reset();
          this.reloadComments();
        }
      };

      const currentTime = this._currentTime.value;
      const commentTime = commentBlock.time;
      const commentLength = commentBlock.length;
      const commentText = commentBlock.comment;
      const commentdisplayName = commentBlock.displayName;
      const commentDate = new Intl.DateTimeFormat(navigator.languages, {
        dateStyle: 'medium',
        timeStyle: 'long'
      }).format(commentBlock.created);
      const commentActive = (commentTime <= currentTime) && (currentTime < commentTime + commentLength);

      return (
        <div class={`sp_timestamp_block ${commentActive && 'active'}`}>
          <div class="sp_timestamp">{utils.secondsToTime(commentTime)}</div>
          <div class="sp_comment_block">
            <div class="sp_comment">
              <div class="sp_comment_text">{decodeHTMLEntities(commentText)}</div>
              <div class="sp_comment_data">
                <div class="user_icon"></div>
                <span class="user_name">{commentdisplayName}</span>
                , <span class="user_comment_date">{commentDate}</span>
              </div>
            </div>
            {
              commentBlock?.responses?.map(r => <SocialResponseBlock key={r.responseId} response={r} />)
            }
            <div class="sp_comment sp_reply_box">
              <form class="sp_new_reply_form" role="form" onSubmit={handleNewReply}>
                <input name="comment" type="text" class="sp_reply_textarea" aria-label="reply text area"
                  placeholder="Type a reply [enter to submit] 256 char" maxlength="256"
                />
                <input name="private" type="hidden" class="sp_comment_private_checkbox" value="false" />
                <input name="parentCommentId" type="hidden"
                  class="sp_comment_private_checkbox" value={commentBlock.commentId} />
              </form>
            </div>
          </div>
        </div>
      );
    };

    // eslint-disable-next-line no-unused-vars
    const BottomBar = ({ props }) => {
      const handleNewComment = async (event) => {
        event.preventDefault();
        if (!this._displayName.value) {
          await askAndChangeDisplayName();
        }
        if (this._displayName.value) {
          const form = event.target;
          const formData = new FormData(event.target);

          this.player.data.write('timedComments', this.player.videoId, {
            operation: 'newComment',
            time: this._currentTime.value,
            comment: formData.get('comment'),
            isPrivate: formData.get('private')
          });
          form.reset();
          this.reloadComments();
        }
      };
      return (
        <div class="sp_new_comment">
          <div class="sp_timestamp tc_current_timestamp">
            {utils.secondsToTime(this._currentTime.value)}
          </div>
          <form class="sp_new_comment_form" role="form" onSubmit={handleNewComment}>
            <div class="sp_comment sp_comment_box">
              <input name="comment" type="text" class="sp_comment_textarea" aria-label="Create a new comment"
                placeholder="Type new comment at the current time [enter to submit] 256 char"
                maxlength="256" />
              <input name="private" type="hidden" class="sp_comment_private_checkbox" value="false" />
            </div>
          </form>
        </div>
      );
    };

    const askAndChangeDisplayName = async () => {
      const newName = prompt('Do you want to change your display name?', this._displayName.value || '');

      if (newName) {
        await this.player.data.write('timedComments', this.player.videoId, {
          operation: 'setDisplayName',
          name: newName
        });
        this._displayName.value = newName;
        return true;
      }
      return false;
    };

    // eslint-disable-next-line no-unused-vars
    const SocialPlugin = ({ props }) => {
      const displayName = this._displayName.value;
      const comments = this._comments.value;

      const handleChangeDisplayName = async () => {
        const changed = await askAndChangeDisplayName();
        if (changed) {
          await this.reloadComments();
        }
      };

      return <>
        <div class="sp_displayName">
          <button onClick={handleChangeDisplayName} disabled={this._canChangeDisplayName.value === false}>
            { displayName
              ? `Welcome back ${displayName}`
              : 'Click here to set your display name'
            }
          </button>
        </div>

        <div class="sp_innerAnnotation">
          {comments?.map(c => <SocialCommentBlock key={c.commentId} commentBlock={c}/>)}
        </div>
        <BottomBar />
      </>;
    };

    render(<SocialPlugin />, content);
    return content;
  }

  async onPlay(_params) {
    this.player.log.info('play');
  }

  async onPause(_params) {
    this.player.log.info('pause');
  }

  async onEndVideo(_params) {
    this.player.log.info('end');
  }

  async onTimeUpdate(params) {
    this._currentTime.value = Math.floor(params.currentTime);
  }

  async reloadComments() {
    this._comments.value = await this.player.data.read('timedComments', { videoId: this.player.videoId });
  }

  async getDisplayName() {
    this._displayName.value = await this.player.data.read('timedComments', {
      videoId: this.player.videoId,
      operation: 'getDisplayName'
    });
  }

  async canChangeDisplayName() {
    this._canChangeDisplayName.value = await this.player.data.read('timedComments', {
      videoId: this.player.videoId,
      operation: 'canChangeDisplayName'
    });
  }
}
