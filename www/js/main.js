var global_test = {};
var anime_list = [];
var error_list = [];
$(document).ready(function() {
  //clear caching
  $('#submit-button').removeAttr("disabled");
  //enable carousel
  $('.carousel').carousel({
    interval: false
  });
  //make pressing enter in input box have desired behaviour
  $('#username-input').keyup(function(event) {
    if(event.keyCode == 13) {
      $('#submit-button').click();
    }
  });
  //disable native form behavious
  $('#input-form').submit(function() {
    return false;
  });
  $('#submit-button').click(function() {
    $('#submit-button').html("<img src=\"files/loading.gif\" >");
    $('#submit-button').attr("disabled", "disabled");
    $.post('/username', $('#input-form').serialize())
      .done(function(data, textStatus) {
        console.log(textStatus);
        var curr_airing = [];
        global_test = data;
        var watch_list = data.lists.watching;
        var to_watch_list = data.lists.plan_to_watch;
        var on_hold_list = data.lists.on_hold;
        watch_list.forEach(function(cV) {
          if(cV.anime.airing_status === "currently airing" || cV.anime.airing_status === "not yet aired") {
            curr_airing.push(cV.anime);
          }
        });
        to_watch_list.forEach(function(cV) {
          if(cV.anime.airing_status === "not yet aired" || cV.anime.airing_status === "currently airing") {
            curr_airing.push(cV.anime);
          }
        });
        on_hold_list.forEach(function(cV) {
          if(cV.anime.airing_status === "not yet aired" || cV.anime.airing_status === "currently airing") {
            curr_airing.push(cV.anime);
          }
        });
        curr_airing.forEach(function(cV) {
          $('#second-screen').append('<div class=\"col-sm-3 preview-divs\"><div class=\"p-div col-sm-12\" data-id=\"'
            + cV.id.toString() + '\">'
            + '<img class=\"img-thumbs\" src=' + cV.image_url_lge + ' />'
            + '<span class=\"caption\">' + cV.title_english + '</span>'
            + '</div></div>');
        });
        $('#second-screen').append('<div class=\"col-sm-12 bottom-container\">'
          + '<div class=\"col-sm-11\" id=\"loading-div\"><p id=\"progress-text\"></p></div>'
          + '<div class=\"col-sm-1\" id=\"button-div\">'
          + '<button type=\"button\" class=\"btn btn-default\" id=\"stagetwo-button\">'
          + 'Next</btn></div></div>'
        );
        $('.p-div').click(function() {
          var elem = $(this);
          if(elem.hasClass('selected')) {
            elem.removeClass('selected');
          } else {
            elem.addClass('selected');
          }
        });
        $('.carousel').carousel(1);
        $('#second-screen').scrollTop();
        $('#stagetwo-button').click(function() {
          var numAnime = 0;
          var countAnime = 0;
          $('.p-div').each(function() {
            if($(this).hasClass('selected')) {
              var payload = 'anime_id=' + $(this).data('id').toString();
              numAnime++;
              $.post('/anime', payload)
                .done(function(data, textStatus) {
                  countAnime++;
                  $('#progress-text').text(countAnime.toString() + '/' + numAnime.toString());
                  anime_list.push(data);
                  if(countAnime == numAnime) {
                    console.log("To page 3!");
										var ical = new Blob([develop_vcal()], {type:"octet/stream"});
										$('#download-btn').attr('href', window.URL.createObjectURL(ical));
										$('#download-btn').attr('download', "anime.ics");
										$('#download-btn').addClass('btn btn-lg btn-primary');
										if(error_list.length !== 0) {
											$('#error-declare').addClass('some-error');
											$('#error-declare').removeClass('no-error');
											error_list.forEach(function(animeObj) {
												$('#error-list').append('<li>' + animeObj.title_english + '</li>');
											});
										}
                    $('.carousel').carousel(2);
                  }
                })
                .fail(function(jqxhr, textStatus) {
                  console.log("Uhh ohh. This shouldn\'t happen.");
                });
            }
          });
          if(numAnime == 0) {
            alert("Please select some anime.");
          } else {
            $('#progress-text').text(countAnime.toString() + '/' + numAnime.toString());
            $('#stagetwo-button').html("<img src=\"files/loading.gif\" >");
            $('#stagetwo-button').attr("disabled", "disabled");
          }
        });
      })
      .fail(function(jqxhr, textStatus) {
        console.log(textStatus);
        $('#submit-button').text("Submit");
        $('#submit-button').removeAttr("disabled");
        console.log(jqxhr.status);
      }); 
  });
});


function develop_vcal() {
	var vcal = '';
	vcal += 'BEGIN:VCALENDAR\r\n';
	vcal += 'VERSION:2.0\r\n';
	vcal += 'CALSCALE:GREGORIAN\r\n';
	vcal += 'PRODID:Anical\r\n';
	for(var i = 0; i < anime_list.length; i++) {
		vcal += develop_anime_events(anime_list[i]);
	}
	vcal += 'END:VCALENDAR\r\n\n';
	return vcal;
}

function develop_anime_events(animeObj) {
	var animeEvents = '';
	//if animeObj.airing === null, return empty string
	if(animeObj.airing !== null) {
		//animeObj.airing.time (YYYY-MM-DDTHH:MM:SS+HH:MM) (if null, return empty string)
		if(animeObj.airing.time === null || animeObj.airing.time === '') {
			error_list.push(animeObj);
			return animeEvents;
		}
		var nextAiringMoment = moment(animeObj.airing.time);
		//animeObj.airing.next_episode (if null, asusme 1)
		var nextEpisode = animeObj.airing.next_episode;
		if(nextEpisode === null) {
			nextEpisode = 1;
		}
		//animeObj.duration (if null or 0, assume 15 if animeObj.type === 'TV Short', else assume 30)
		var duration = animeObj.duration;
		if(duration === 0 || duration === null) {
			if(animeObj.type === "TV Short") {
				duration = 15;
			} else {
				duration = 30;
			}
		}
		//animeObj.total_episodes (if null or 0, assume (epNum/12+1)*12)
		var totalEps = animeObj.total_episodes;
		if(totalEps === null || totalEps === 0) {
			totalEps = (parseInt(nextEpisode/12)+1)*12;
		}
		for(var i = nextEpisode; i <= totalEps; i++) {
			animeEvents += develop_vevent(nextAiringMoment.add((nextEpisode - i ? 7 : 0), 'd'), duration, animeObj.title_english + ' - ' + i.toString());
		}
	} else {
		error_list.push(animeObj);
	}
	return animeEvents;
}

function develop_vevent(startTime, duration, summary) {
	var event = '';
	event += 'BEGIN:VEVENT\r\n';
	event += 'UID:' + startTime.format() + '-' + summary.replace(/ /gi, '-') + '@' + window.location.hostname + '\r\n';
	event += 'DTSTAMP:' + moment().format('YYYYMMDDTHHmmss') + '\r\n';
	event += 'DTSTART;TZID=Asia/Tokyo:' + startTime.tz('Asia/Tokyo').format('YYYYMMDDTHHmmss') + '\r\n';
	event += 'DTEND;TZID=Asia/Tokyo:' + startTime.add(duration, 'm').tz('Asia/Tokyo').format('YYYYMMDDTHHmmss') + '\r\n';
	startTime.subtract(duration, 'm');
	event += 'SUMMARY:' + summary + '\r\n';
	event += 'END:VEVENT\r\n'
	return event;
}