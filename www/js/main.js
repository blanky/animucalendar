var global_test = {};
var anime_list = [];
$(document).ready(function() {
  $('.carousel').carousel({
    interval: false
  });
  $('#submit-button').click(function() {
    //$('#submit-button').text("Loading...");
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
          $('#second-screen').append('<div class=\"col-sm-4 preview-divs\"><p class=\"p-div\" data-id=\"'
            + cV.id.toString() + '\">'
            + '<img class=\"img-thumbs\" src=' + cV.image_url_med + '><br>'
            + cV.title_english
            + '</p></div>');
        });
        $('#second-screen').append('<div class=\"col-sm-12 bottom-container\">'
          + '<button type=\"button\" class=\"btn btn-default\" id=\"stagetwo-button\">'
          + 'Next</btn></div>'
        );
        $('.p-div').click(function() {
          var elem = $(this);
          if(elem.css('background-color') === 'rgb(221, 221, 221)') {
            elem.css('background-color', 'rgb(0, 221, 0)');
          } else {
            elem.css('background-color', 'rgb(221, 221, 221)');
          }
        });
        $('#second-screen').scrollTop();
        //$('#second-screen').text(curr_airing.toString());
        $('.carousel').carousel(1);
        $('#stagetwo-button').click(function() {
          var numAnime = 0;
          var countAnime = 0;
          $('.p-div').each(function() {
            if($(this).css('background-color') === 'rgb(0, 221, 0)') {
              var payload = 'anime_id=' + $(this).data('id').toString();
              numAnime++;
              $.post('/anime', payload)
                .done(function(data, textStatus) {
                  countAnime++;
                  console.log(countAnime.toString() + '/' + numAnime.toString());
                  anime_list.push(data);
                  if(countAnime == numAnime) {
                    console.log("To page 3!");
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
          }
        });
      })
      .fail(function(jqxhr, textStatus) {
        console.log(textStatus);
        //$('#submit-button').text("Submit");
        console.log(jqxhr.status);
      }); 
  });
});


