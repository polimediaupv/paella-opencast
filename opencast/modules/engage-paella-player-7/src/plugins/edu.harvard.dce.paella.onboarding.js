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
import { EventLogPlugin, Events } from 'paella-core';

import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import '../css/edu.harvard.dce.paella.onboarding.css';

export default class OnboardingPlugin extends EventLogPlugin {

  get events() {
    return [
      Events.PLAYER_LOADED
    ];
  }

  // eslint-disable-next-line no-unused-vars
  async onEvent(evt, params) {
    const hideUI = await this.player.preferences.get('onboarding_hideUI', { global: true });
    this.player.log.info(`onboardinghelp hideUI=${hideUI === true}`);

    const tour = await this.buildTour();
    if (hideUI !== true) {
      setTimeout(() => { this.player.pause(); }, 100);
      tour.start();
    }
  }

  async buildTour() {
    const tour = new Shepherd.Tour({
      tourName: 'paella-onboarding',
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'paella-onboarding',
        scrollTo: true,
        highlightClass: 'paella-onboarding-highlight',
        canClickTarget: false,
        cancelIcon: {
          enabled: true
        },
        buttons: [
          {
            text: 'Back',
            action: function (){ this.back(); }
          },
          {
            text: 'Next',
            action: function() { this.next(); }
          }
        ]
      }
    });

    await this.generateTourWelcomSteps(tour);
    await this.generateTourSteps(tour);
    await this.generateTourGoodbyeSteps(tour);

    return tour;
  }

  async generateTourWelcomSteps(tour) {
    // Tour: Introduction
    tour.addSteps([
      {
        title: 'Welcome to paella player tutorial',
        text: 'The player displays two videos - the presenter and the presentation - along with some control options on the lower menu bar. <p/>You can begin viewing the lecture by pressing the play button on top of the video window or in the control bar.',
        buttons: [
          {
            text: 'Don\'t show again',
            action: async () => {
              await this.player.preferences.set('onboarding_hideUI', true, { global: true });
              tour.cancel();
            }
          },
          {
            text: 'Next',
            action: tour.next
          }
        ]
      }
    ]);
  }

  async generateTourSteps(tour) {
    // Tour: Video navigation
    tour.addStep({
      title: 'Paella player: Video navigation',
      text: 'This is the timeline. You can navigate to any time in the video by clicking the timeline.',
      attachTo: {
        element: '.playback-bar .progress-indicator',
        on: 'top'
      }
    });
    if(this.player.config?.plugins['es.upv.paella.frameControlButtonPlugin']?.enabled === true) {
      tour.addStep({
        title: 'Paella player: Video navigation',
        text: 'We also offer skip controls to help you navigate forward or backwards by set amounts. <p/>For instance, to skip back 10 seconds to hear something again that you may have missed.',
        attachTo: {
          element: 'button[name="es.upv.paella.backwardButtonPlugin"]',
          on: 'top'
        }
      });
    }
    if(this.player.config?.plugins['es.upv.paella.backwardButtonPlugin']?.enabled === true) {
      tour.addStep({
        title: 'Paella player: Video navigation',
        text: 'We also offer skip controls to help you navigate forward or backwards by set amounts. <p/>For instance, to skip back 10 seconds to hear something again that you may have missed.',
        attachTo: {
          element: 'button[name="es.upv.paella.backwardButtonPlugin"]',
          on: 'top'
        }
      });
    }
    if(this.player.config?.plugins['es.upv.paella.frameControlButtonPlugin']?.enabled === true) {
      tour.addStep({
        title: 'Paella player: Video navigation',
        text: 'You can use the slide tool to skip to a specific part of the video based on what content was being presented. <p/>Click the tool and then click a slide to jump to that section of the video.',
        attachTo: {
          element: 'button[name="es.upv.paella.frameControlButtonPlugin"]',
          on: 'top'
        }
      });
    }
    // Tour: Speeding up / slowing down
    if(this.player.config?.plugins['es.upv.paella.playbackRateButton']?.enabled === true) {
      tour.addStep({
        title: 'Paella player: Speeding up / slowing down playback',
        text: 'You can increase/decrease the playback speed via the playback speed control. <p/>Click it and you\'ll get a set of choices. Select "1x" to set playback speed back to normal.',
        attachTo: {
          element: 'button[name="es.upv.paella.playbackRateButton"]',
          on: 'top'
        }
      });
    }

    // Tour: Layout
    if(this.player.config?.plugins['es.upv.paella.layoutSelector']?.enabled === true) {
      tour.addStep({
        title: 'Paella player: Changing the layout of the player',
        text: 'You can switch between several layouts designed to emphasize the camera or the presentation, depending on the current focus of what\'s happening in the video. <p/>For instance, if the instructor is working on a problem you might want to see the projected chalkboard in as much detail as possible. Switching layouts lets you do this.',
        attachTo: {
          element: 'button[name="es.upv.paella.layoutSelector"]',
          on: 'top'
        }
      });
    }
    tour.addStep({
      title: 'Paella player: Changing the layout of the player',
      text: 'The buttons on the video also affect the layout. Allowing you to make one video bigger than the other or even hide one of the vodeos.',
      attachTo: {
        element: '.video-canvas .button-area',
        on: 'bottom'
      }
    });

    // Tour: Full screen
    if(this.player.config?.plugins['es.upv.paella.fullscreenButton']?.enabled === true) {
      tour.addStep({
        title: 'Paella player: full screen mode',
        text: 'Use the "full screen" tool to maximize the size of the videos in your web browser. Press the escape key to exit, or simply click the control again.',
        attachTo: {
          element: 'button[name="es.upv.paella.fullscreenButton"]',
          on: 'top'
        }
      });
    }

    // Tour: Class handouts
    if(this.player.config?.plugins['edu.harvard.dce.paella.infoMenu']?.enabled === true) {
      tour.addSteps([
        {
          title: 'Paella player: Class handouts',
          text: 'A "Class Handout" link appears in the help menu if the publication contains an attached handout. <p/>Click the "Class Handout" link to access the handout. PDF files may open in another window instead of downloading.',
          attachTo: {
            element: 'button[name="edu.harvard.dce.paella.infoMenu"]',
            on: 'top'
          }
        }
      ]);
    }

    // Tour: Captions
    if(this.player.config?.plugins['es.upv.paella.captionsSelectorPlugin']?.enabled === true) {
      tour.addStep({
        title: 'Paella player: Captions',
        text: 'A closed caption icon (CC) appears on the control bar if the publication contains closed captions. <p/>Click closed caption icon to enable captions.',
        attachTo: {
          element: 'button[name="es.upv.paella.captionsSelectorPlugin"]',
          on: 'top'
        }
      });
    }

    // Tour: Keyboard shortcuts
    if(this.player.config?.plugins['es.upv.paella.keyboardShortcutsHelp']?.enabled === true) {
      tour.addStep({
        title: 'Paella player: Keyboard shortcuts',
        text: 'Some basic functions of the player can be used with the keyboard. <p/>Click keyboard icon to view the keys.',
        attachTo: {
          element: 'button[name="es.upv.paella.keyboardShortcutsHelp"]',
          on: 'top'
        }
      });
    }
  }

  async generateTourGoodbyeSteps(tour) {
    // Tour: Goodbye
    tour.addSteps([
      {
        title: 'Welcome to paella player tutorial',
        text: 'That\'s All Folks',
        buttons: [
          {
            text: 'Don\'t show again',
            action: async () => {
              await this.player.preferences.set('onboarding_hideUI', true, { global: true });
              tour.complete();
            }
          },
          {
            text: 'Done',
            action: tour.complete
          }
        ]
      }
    ]);
  }
}
