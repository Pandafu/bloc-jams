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
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber){
            if (currentSoundFile.isPaused()) {
                //if it's paused, start playing the song again and revert the icon in the song row and the player bar to the pause button
                $(this).html(pauseButtonTemplate);
                $('main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
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
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $allowPausePlayBar.click(togglePlayFromPlayerBar);
});

