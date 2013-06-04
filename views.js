var MarkerView = function (marker) {

  this.$el = $('<div class="marker marker-'+ marker.id +'"></div>')
      .hide()
      .css( {top: marker.y, left : marker.x} );

  $(document.body).append(this.$el);

  this.$el.fadeIn();

};
MarkerView.prototype.update = function (marker) {

  this.$el.css( { top  : marker.y , 
                  left : marker.x } );

};
MarkerView.prototype.remove = function () {

  this.$el.remove();

};

// --------------------- EXP VIEWE ----------------------------------
var ExplodeView = function(id, x, y, css) {

  var rand = Math.round(Math.random() * 1000);

  $(document.body).append($('<div class="curs curs-'+id + rand +'"></div>').hide());

  var $el = $('.curs-'+id + rand);

  css.left = x;
  css.top = y;

  $el.css(css);
  $el.fadeIn(400, function () {
    $(this).delay(500).fadeOut();
  });
  
  setTimeout(function () {
    $el.remove();
  }, 1500);
};
// ---------------------- Ring ----------------------------------------

var createRingView = function(x, y, css) {

  var $el = $('<div class="curs stay"></div>');

  css.left = x;
  css.top = y;

  $el.css(css);

  $(document.body).append($el);
  
};

var removeRings = function() {
  var rings = $(".stay");
  for (var item in rings) {
    rings[item].remove();
  }
};

// ------------------- Cursor View ------------------------------------

var CursorView = function (id, x, y, css) {

  this.$el = $('<div class="cursor cursor-'+ id +'"></div>')
      .hide()
      .css( {top: y, left : x } )
      .css(css);

  $(document.body).append(this.$el);

  this.$el.fadeIn();

};
CursorView.prototype.update = function (x, y) {

  this.$el.css( { top  : y , 
                  left : x } );

};
CursorView.prototype.remove = function () {

  this.$el.remove();

};
// ============================== MessageView ========================
var messageView = function(message) {

  var $el = $('<div class="tuiomessage"></div>').text(message).hide();

  $(document.body).append($el);

  $el.fadeIn(500, function () {
    $(this).delay(500).fadeOut();
  });
  
  setTimeout(function () {
    $el.remove();
  }, 1500);
};