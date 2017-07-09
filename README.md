Paella Player For Opencast
============================

This is the Paella player bundled for Opencast.

![Paella Player Logo](doc/images/paella_mh.png)

Paella Player
=============

The Paella (pronounce “paeja”) Player is a HTML5 video player capable of
playing multiple audio & video streams synchronously and supporting a number of
user plugins. It is specially designed for lecture recordings, like Opencast
Lectures or Polimedia pills.

By using Paella, students can view both the lecture hall and the teacher's
screen, get information about the lecture (slides, OCR, series videos,
footprints) and interact with the lecture (views, comments). Teachers can also
soft edit the lecture to set the start and end point or make breaks in the
recording.

If you want to use the Paella player, but do not use Opencast, try the
[standalone](https://github.com/polimediaupv/paella) version.


Main Characteristics
====================

- Multi stream video player
- Based on HTML5 and Javascript
- Resize position/size of video windows while playing
- Play/Pause/30 seconds back controls
- Jump anywhere in the video keeping both tracks in sync
- Jump by clicking on the slide list
- High quality slides while seeking
- Can handle progressive download, pseudo streaming and RTMP streaming
- Supports .flv and .mp4 files
- Easily change the relative position of presenter and presentation windows
- Native fullscreen version
- Embeddable
- “Publish to” buttons for Facebook and Twitter
- Captions support
- Comments (experimental)
- Easy skinning
- Easy install
- Soft editing: Trimming and breaks
- Supports Chrome, Firefox, Safari and Internet Explorer 9 an 10
- Compatible with Opencast >= 1.4


Build and Install
=================

To build Paella Player for Opencast, please read the
[documentation](doc/build.md).

[![Build Status](https://travis-ci.org/polimediaupv/paella-matterhorn.svg?branch=master)](https://travis-ci.org/polimediaupv/paella-matterhorn)
