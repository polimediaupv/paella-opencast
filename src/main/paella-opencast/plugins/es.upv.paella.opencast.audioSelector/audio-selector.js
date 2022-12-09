paella.addPlugin(function() {
	return class AudioSelector extends paella.ButtonPlugin {
		getAlignment() { return 'right'; }
		getSubclass() { return "audioSelector"; }
		getIconClass() { return 'icon-headphone'; }
		getIndex() { return 2040; }
		getName() { return "es.upv.paella.opencast.audioSelector"; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Set audio stream"); }

		closeOnMouseOut() { return true; }
			
		async checkEnabled(onSuccess) {
            let userInfo = await paella.opencast.getUserInfo();
            let isAdmin = userInfo.roles.includes(userInfo.org.adminRole)
            //let canWrite = await paella.player.accessControl.canWrite();
            if (isAdmin) {
                let tags = await paella.player.videoContainer.getAudioTags();
                if (tags) {
                    this._tags = tags;
                    onSuccess(this._tags.length>1);
                };
            }
		}

		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		
		buildContent(domElement) {
			this._tags.forEach((tag) => {
				domElement.appendChild(this.getItemButton(tag));
			});
		}

		getItemButton(lang) {
			var elem = document.createElement('div');
			let currentTag = paella.player.videoContainer.audioTag;
			let label = lang.replace(/[-\_]/g," ");
			elem.className = this.getButtonItemClass(label,lang==currentTag);
			elem.id = "audioTagSelectorItem_" + lang;
			elem.innerText = label;
			elem.data = lang;
			$(elem).click(function(event) {
				$('.videoAudioTrackItem').removeClass('selected');
				$('.videoAudioTrackItem.' + this.data).addClass('selected');
				paella.player.videoContainer.setAudioTag(this.data);
			});

			return elem;
		}
		
		setQualityLabel() {
			var This = this;
			paella.player.videoContainer.getCurrentQuality()
				.then(function(q) {
					This.setText(q.shortLabel());
				});
		}

		getButtonItemClass(tag,selected) {
			return 'videoAudioTrackItem ' + tag  + ((selected) ? ' selected':'');
		}
	}
});