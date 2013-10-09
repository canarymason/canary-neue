$(function () {
  // $(window).resize(function(){
  //   if ($('#main-menu-toggle').is(':hidden') && jPM.isOpen()) {
  //     jPM.close();
  //   }
  //   $('.jPanelMenu-panel').css('min-height', $(window).height());
  // });

  // // flexslider
  // $('.slideshow').flexslider({
  //   selector: '.slides > .slide',
  //   animation: 'slide',
  //   prevText: 'previous',
  //   nextText: 'next'
  // });
  // $('.flex-direction-nav a').addClass('icon-canary');

  /**
   * Returns a random number between min and max
   */
  function getRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Returns a random integer between min and max
   * Using Math.round() will give you a non-uniform distribution!
   */
  // function getRandomInt(min, max) {
  //   return Math.floor(Math.random() * (max - min + 1)) + min;
  // }

  $('.site-header').css('background-position', '50%' + getRandomArbitary(0, 100) + '%');

});
