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
import { KeyShortcutPlugin, KeyCodes } from 'paella-core';

export default class OpencastKeyShortcuts extends KeyShortcutPlugin {
  async getKeys() {
    return [
      {
        keyCode: KeyCodes.KeyM,
        keyModifiers: {
          altKey: true,
          ctrlKey: true
        },
        description: 'Mute audio',
        action: async () => {
          await this.player.videoContainer?.setVolume(0);
        }
      },
      {
        keyCode: KeyCodes.KeyP,
        keyModifiers: {
          altKey: true,
          ctrlKey: true
        },
        description: 'Toggle play pause',
        action: async () => {
          const paused = await this.player.paused();
          if (paused) {
            await this.player.play();
          }
          else {
            await this.player.pause();
          }
        }
      },
      {
        keyCode: KeyCodes.KeyS,
        keyModifiers: {
          altKey: true,
          ctrlKey: true
        },
        description: 'Pause video',
        action: async () => {
          await this.player.pause();
        }
      },
      {
        keyCode: KeyCodes.KeyU,
        keyModifiers: {
          altKey: true,
          ctrlKey: true
        },
        description: 'Increment audio volume',
        action: async () => {
          const vol = await this.player.videoContainer?.volume();
          if (vol) {
            await this.player.videoContainer?.setVolume(
              Math.max(Math.min(vol + 0.1,1),0.1)
            );
          }
        }
      },
      {
        keyCode: KeyCodes.KeyD,
        keyModifiers: {
          altKey: true,
          ctrlKey: true
        },
        description: 'Decrement audio volume',
        action: async () => {
          const vol = await this.player.videoContainer?.volume();
          if (vol) {
            await this.player.videoContainer?.setVolume(
              Math.max(vol - 0.1,0)
            );
          }
        }
      }
    ];
  }
}
