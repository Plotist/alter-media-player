

function initAlterMedia(){
	$( "div[alter-media-player|='true']" ).each(function(index,el){
		if(!$(el).data("alter-media-data")){
			$(el).data("alter-media-data", new AlterMedia(el));
		}
	})
}

var AlterMedia = function(containerBar){
	var _self = this;
	var hideVlmStatus;
	var fsControlsStatus;
	this.containerBar = $(containerBar);
	this.video = $("video", this.containerBar);

	this.playerControls = $(".lmp-controls", this.containerBar);
	this.playerFullScrBtn = $(".lmp-full-screen", this.containerBar);
	this.playerCurrentTime = $(".lmp-current-time", this.containerBar);
	this.playerDuration = $(".lmp-duration", this.containerBar);
	this.playBtn =  $(".lmp-play-control", this.containerBar);

	this.vlmSlider = $(".lmp-volume-slider", this.containerBar);
	this.vlmBtn = $(".lmp-volume-sign", this.containerBar);
	this.vlmSlider = $(".lmp-volume-slider", this.containerBar);
	this.vlmOverlay = $(".volume-overlay", this.containerBar);
	this.vlmBackground = $(".volume-background", this.containerBar);
	this.vlmBg = $(".volume-bg-bar", this.containerBar);
	this.vlmProgressBar = $(".volume-progress-bar", this.containerBar);

	this.vidSlider = $(".lmp-time-slider", this.containerBar);
	this.vidProgressBar = $(".lmp-progress-bar", this.containerBar)
	this.vidBufferBar = $(".lmp-buffer-bar", this.containerBar);
	this.vidBackgroundBar = $(".lmp-background-bar", this.containerBar);
	
	// TODO: responcive player and progress bar width
	this.pgBarWidth = 320;
	this.volumeBarHeight = 75;
	this.oneSecPixels;

	this.playPauseToggle = function(){
		if(_self.video[0].paused){
			_self.video[0].play();
			_self.playBtn.removeClass("lmp-play").addClass("lmp-pause");
		}else{
			_self.video[0].pause();
			_self.playBtn.removeClass("lmp-pause").addClass("lmp-play");
		}
	}

	this.muteToggle = function(){
		if(_self.video[0].muted){
			_self.video[0].muted = false;
			_self.vlmBtn.removeClass("lmp-muted").addClass("lmp-unmuted");
			_self.updateVolumeView();
		}else{
			_self.video[0].muted = true;
			_self.vlmBtn.removeClass("lmp-unmuted").addClass("lmp-muted");
			_self.vlmProgressBar[0].style.height = "0px";
			_self.vlmSlider[0].style.bottom = "-4px";
		}
	}

	this.updateBuffer = function(){
		_self.vidBufferBar[0].style.width = _self.video[0].buffered.end(0)*_self.oneSecPixels + "px";
	}

	this.updateTimeView = function(time){
		// pixels/seconds = skolko piksley peredyut odnu sekundu
		_self.vidProgressBar[0].style.width = time*_self.oneSecPixels + "px";
		_self.vidSlider[0].style.left = time*_self.oneSecPixels + "px";
	}

	this.slideVolume = function(e){
		positionToBg = _self.volumeBarHeight - (e.pageY - _self.vlmBg.offset().top);
		if(positionToBg >= 0 && positionToBg <= _self.volumeBarHeight){
			_self.volumeCalc(positionToBg);
		}
	}

	this.slideVideo = function(e){
		////////////////kekeke
		positionToBg = e.pageX - _self.vidBufferBar.offset().left;
		if(positionToBg >= 0 && positionToBg <= _self.pgBarWidth){
			_self.videoCalc(positionToBg);
		}
	}

	this.volumeCalc = function(yPosition){
		_self.changeCurrentVolume(yPosition);
		if(_self.video[0].volume > 0){
			_self.video[0].muted = false;
			_self.vlmBtn.removeClass("lmp-muted").addClass("lmp-unmuted");
		}
		_self.updateVolumeView();
	}

	this.videoCalc = function(xPosition){
		_self.changeCurrentTime(xPosition)
		_self.updateTimeView(xPosition/_self.oneSecPixels);
	}

	this.changeCurrentVolume = function(yPosition){
		_self.video[0].volume = yPosition/_self.volumeBarHeight;
	}

	this.changeCurrentTime = function(xPosition){
		_self.video[0].currentTime = xPosition/_self.oneSecPixels;
	}

	this.showControlls = function(){
		_self.playerControls.show();
	}

	this.hideControlls = function(){
		_self.playerControls.hide();
	}

	this.fsControlsHandler = function(){
		clearTimeout(_self.fsControlsStatus);
		_self.showControlls();
		_self.fsControlsStatus = setTimeout(function(){
			_self.hideControlls();
		}, 3000);
	}

	_self.video.on("loadedmetadata", function(){
		var videoDuration = _self.video[0].duration;
		_self.oneSecPixels = _self.pgBarWidth/videoDuration;
		_self.calcDuration();
		setInterval(function() {
		  _self.calcCurrentTime();
		}, 1000);
		_self.video.on("progress", function(){
			_self.updateBuffer();
		});
		_self.updateVolumeView();
	});

	_self.vlmBg.on("click", function(e){
		_self.volumeCalc(_self.volumeBarHeight - (e.pageY - _self.vlmBg.offset().top));
	});

	_self.vidBackgroundBar.on("click", function(e){
		_self.videoCalc(e.pageX - _self.vidBackgroundBar.offset().left);
	});

	_self.video.on("timeupdate", function(){
		_self.updateTimeView(_self.video[0].currentTime);
	});

	_self.vlmSlider.on("mousedown", function(){
		document.addEventListener("mousemove", _self.slideVolume);
	});

	_self.vidSlider.on("mousedown", function(){
		document.addEventListener("mousemove", _self.slideVideo);
	});

	$(document).on("mouseup", function(){
		document.removeEventListener("mousemove", _self.slideVolume);
		document.removeEventListener("mousemove", _self.slideVideo);
	});

	_self.playerFullScrBtn.on("click", function(){
		!document.mozFullScreen && !document.webkitIsFullScreen ? _self.launchIntoFullscreen() : _self.exitFullscreen() ;
	});

	_self.video.on("ended", function(){
		_self.playBtn.removeClass("lmp-pause").addClass("lmp-play");
	});

	_self.vlmOverlay.on("mouseenter", function(){
		clearTimeout(_self.hideVlmStatus);
		_self.vlmBackground.show();
	});

	_self.vlmOverlay.on("mouseleave", function(){
		_self.hideVlmStatus = setTimeout(function(){
			_self.vlmBackground.hide();
		},1250)
	});

	_self.containerBar.on("mousemove", _self.fsControlsHandler);

	_self.video.on("click", _self.playPauseToggle);

	_self.playBtn.on("click", this.playPauseToggle);
	_self.vlmBtn.on("click", this.muteToggle);

}

AlterMedia.prototype.updateVolumeView = function(){
	this.vlmProgressBar[0].style.height = this.volumeBarHeight*this.video[0].volume + "px";
	this.vlmSlider[0].style.bottom = this.volumeBarHeight*this.video[0].volume-4 + "px";
}
AlterMedia.prototype.calcDuration = function(){
	this.playerDuration.html(this.formatTime(this.video[0].duration));
}
AlterMedia.prototype.calcCurrentTime = function(){
	this.playerCurrentTime.html(this.formatTime(this.video[0].currentTime));
}
AlterMedia.prototype.formatTime = function(seconds){
	seconds = Math.round(seconds);
	hours = parseInt(seconds/3600);
	hoursView = this.generateTwoSignedFormat(hours)
	minutesLeft = parseInt((seconds - hours*3600)/60);
	minutesLeftView = this.generateTwoSignedFormat(minutesLeft);
	secondsLeft = parseInt((seconds - (hours*3600+minutesLeft*60)));
	secondsLeftView = this.generateTwoSignedFormat(secondsLeft);
	result = hoursView + ":" + minutesLeftView + ":" + secondsLeftView;
	return result;
}
AlterMedia.prototype.generateTwoSignedFormat = function(number){
	return parseInt(number/10) > 0 ? number : "0"+number;
}

AlterMedia.prototype.launchIntoFullscreen = function() {
	this.playerControls[0].style.zIndex = 2147483647;
	this.playerControls[0].style.marginBottom = "20px";

  if(this.video[0].requestFullscreen) {
    this.video[0].requestFullscreen();
  } else if(this.video[0].mozRequestFullScreen) {
    this.video[0].mozRequestFullScreen();
  } else if(this.video[0].webkitRequestFullscreen) {
    this.video[0].webkitRequestFullscreen();
  } else if(this.video[0].msRequestFullscreen) {
    this.video[0].msRequestFullscreen();
  } else{
  	this.playerControls[0].style.zIndex = 0;
  	this.playerControls[0].style.marginBottom = "auto";
  } 
}

AlterMedia.prototype.exitFullscreen = function() {
	this.playerControls[0].style.zIndex = 0;
	this.playerControls[0].style.marginBottom = "auto";
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else {
  	this.playerControls[0].style.zIndex = 2147483647;
  	this.playerControls[0].style.marginBottom = "20px";
  }
}