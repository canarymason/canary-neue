$(function () {
  // jpanel menu
  var jPM = $.jPanelMenu({
    afterOn: function () {
      $('#menu').hide();
    },
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
    prevText: 'previous',
    nextText: 'next',
    itemWidth: 960
  });
  $('.flex-direction-nav a').addClass('ss-icon ss-standard');

});
