var setSong = function(songNumber){
    //stop the current song before we set a new one. 
    if (currentSoundFile) {
        //runs this if true
        currentSoundFile.stop();
    }
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber -1];
    
    // #1 we assign a new Buzz sound object. We've passed the audio file via the audioUrl property on the currentSongFromAlbum object.
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        //#2 we've passed in a settings object that has two properties defined, formats(array of strings with acceptable audio formats) and preload. 
        //We've only included the 'mp3' string because all of our songs are mp3s. Setting the preload property to true tells Buzz that we want 
        //the mp3s loaded as soon as the page loads.
        formats: ['mp3'],
        preload: true
    });
    
        setVolume(currentVolume);
};  
 //seek()uses the Buzz setTime() method to change the position in a songto a specified time.
var seek = function(time) {
     if (currentSoundFile){
            currentSoundFile.setTime(time);
     }               
}; 
  //function with one argument, volume value, and wraps the Buzz setVolume() method with a conditional 
//statement that checks to see if a currentSoundFile Exists.
var setVolume = function(volume){
    if(currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }  

};

var getSongNumberCell = function(number){
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function (songNumber, songName, songLength){
  var template = 
      '<tr class= "album-view-song-item">'
    + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '  <td class="song-item-title">' + songName + '</td>'
    + '  <td class="song-item-duration">' + songLength + '</td>'
    + '</tr>'
    ;
    
    var $row = $(template);
    
    var clickHandler = function() {
        //clickHandler logic
        var songNumber = parseInt($(this).attr('data-song-number'));
        
        if (currentlyPlayingSongNumber !== null) {
            //Revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber){
            //Switch from Play _> Pause button to indicate new song is playing.
            $(this).html(pauseButtonTemplate);
            setSong(songNumber);
            currentSoundFile.play();
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            updateSeekBarWhileSongPlays();
            updatePlayerBarSong();
            
            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'}); 
        } else if (currentlyPlayingSongNumber === songNumber){
            if (currentSoundFile.isPaused()) {
                //if it's paused, start playing the song again and revert the icon in the song row and the player bar to the pause button
                $(this).html(pauseButtonTemplate);
                $('main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
        }  else {
            //if it isn't paused, pause it and set the content of the song number cell and the player bar's pause button back to the play button.
            $(this).html(playButtonTemplate);
            $('main-controls .play-pause').html(playerBarPlayButton);
            currentSoundFile.pause();
            }
        } 
    };
    
    var onHover = function(event) {
        //placeholder for function logic
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber){
            songNumberCell.html(playButtonTemplate);
        }
    };
    
    var offHover = function(event){
        //Placeholder for function logic
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
    };
    
    //#1 similar to querySelector(). We call it here to find the element with the .song-item-number class that's contained in whichever row is clicked.
    $row.find('.song-item-number').click(clickHandler);
    //#2
    $row.hover(onHover, offHover);
    //#3
    return $row;
    
};

var setCurrentAlbum = function(album){
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    //#3
    $albumSongList.empty();
    
    //#4
    for(var i = 0; i < album.songs.length; i++){
        //before-->albumSongList.innerHTML += createSongRow(i + 1,album.songs[i].title, album.songs[i].duration);
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

 var updateSeekBarWhileSongPlays = function(){
    if(currentSoundFile){
        
        /// #10
        currentSoundFile.bind('timeupdate', function(event){
            //#11
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
    }
}; 

var updateSeekPercentage = function($seekBar, seekBarFillRatio){
    //multiply ratio by 100 to determine a percentage
    var offsetXPercent = seekBarFillRatio * 100;
    
    //Math.max to make sure our % isn't less than 0. Math.min to make sure it doesn't exceed 100.
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    //convert % to a string and add the '%' character. When we set the width and fill class and the left value of the .thumb class, 
    //the CSS interprets the value as a percent instead of a unit-less number between 0 and 100.
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

//Create a function that use click event to determine the fill width and thumb location of the seekbar.
var setupSeekBars = function() {
    //Using jQuery to find all elements in the DOM with a class of "seek-bar" that are contained within the element with a class of "player-bar". This will return a jQuery wrapped array containing both the song seek control and the volume control.
    var $seekBars = $('.player-bar .seek-bar');
        
    $seekBars.click(function(event) {
        
        //New property on the event object called pageX- a jQuery specific event value, which holds the X (horizontal) 
        //coordinate at which the event occured(think of the X-Y coordinate plane).
        //"$(this).offset().left" subtracted from the "event.pageX" value leaves us with a resulting value that is proportion of the seek bar.
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
                   //if it's the playback seek bar, seek to the position of the song determined by seekBarFillRatio
        if($(this).parent().attr('class') == 'seek-control'){
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        }else {
            //otherwise, set the volume vased on the seekBarFillRatio
            setVolume(seekBarFillRatio * 100);
        }
       
        //we pass $(this) as the $seekBar argument and seekBarFillRatio for its eponymous argument to updateSeekBarPercentage().
        updateSeekPercentage($(this), seekBarFillRatio);
    });
    
    //we find elements with a class of .thumb inside our $seekBars and add an event listener for the mousedown event. 
    $seekBars.find('.thumb').mousedown(function(event){
       
        //#8
        var $seekBar = $(this).parent();
        
        //#9
        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
         
    
            
            if ($seekBar.parent().attr('class') == 'seek-control'){
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        }); 
        
        //this unbind event method removes the previous event listeners, otherwise the thumb and 
        //fill would continue to move even after the user released the mouse.
        $(document).bind('mouseup.thumb', function(){
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};



var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var updatePlayerBarSong = function(){
    
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
};

var nextSong = function() {
    
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex++;
    
    if(currentSongIndex >= currentAlbum.songs.length){
        currentSongIndex = 0;
    }
    
    //Set a new current song
    setSong(currentSongIndex + 1);
    //play songs when skipping
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
    
    //Update the player Bar information
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var previousSong = function() {
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;
    
    if(currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    
    //Set a new current song
    setSong(currentSongIndex + 1);
    //play songs when skipping
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
    
    //Update the player bar 
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var togglePlayFromPlayerBar = function(){
    //variable currentlyPlayingCell hold getSongNumberCell that returns the song number element and corresponds to that song#
    //it's for the if/else if
        var $currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    //if a song is paused and the play button is clicked in the player bar, it will
        if(currentSoundFile.isPaused()){
            //change the song#cell from play button to pause button
            $currentlyPlayingCell.html(pauseButtonTemplate);
            //change the HTML of the player bar's play button to a pause button
            $(this).html(playerBarPauseButton);
            //play the song
            currentSoundFile.play();
            //if the song is playing and the pause button is clicked
        }else if (currentSoundFile) {
        //change the song#cell from a pause button to a play button
        $currentlyPlayingCell.html(playButtonTemplate);
        //change the HTML of the player bar's pause to play button
        $(this).html(playerBarPlayButton);
        //pause the song
        currentSoundFile.pause();
        }
};



var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';


//Store state of playing songs
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $allowPausePlayBar = $('.main-controls .play-pause');

  $(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $allowPausePlayBar.click(togglePlayFromPlayerBar);
});

