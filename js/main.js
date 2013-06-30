$(function () {
  // jpanel menu
  var jPM = $.jPanelMenu({
    beforeOpen: function () {
      $('#wall').remove();
      $('.jPanelMenu-panel')
        .append('<div id="wall" data-module-type="Wall"></div>');
    },
    beforeClose: function () {
      $('#wall').remove();
    }
  });
  jPM.on();

  // flexslider
  $('.slideshow').flexslider({
    selector: '.slides > .slide',
    animation: 'slide',
    prevText: 'left',
    nextText: 'right',
    itemWidth: 960
  });
  $('.flex-direction-nav a').addClass('ss-icon');

});
