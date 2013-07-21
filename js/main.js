$(function () {
  // jpanel menu
  var jPM = $.jPanelMenu({
    // afterOn: function () {
    //   $('#menu').hide();
    // },
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

  // $(window).resize(function(){
  //   if ($('#main-menu-toggle').is(':hidden') && jPM.isOpen()) {
  //     jPM.close();
  //   }
  //   $('.jPanelMenu-panel').css('min-height', $(window).height());
  // });

  // flexslider
  $('.slideshow').flexslider({
    selector: '.slides > .slide',
    animation: 'slide',
    prevText: 'previous',
    nextText: 'next'
  });
  $('.flex-direction-nav a').addClass('icon-canary');

});
