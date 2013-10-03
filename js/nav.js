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
    },
    beforeOn: function () {
      $('html').removeClass('no-jPanelMenu');
    },
    beforeOff: function () {
      $('html').addClass('no-jPanelMenu');
    }
  });
  $('html').addClass('no-jPanelMenu');

  var jRes = jRespond([
    {
      label: 'small',
      enter: 0,
      exit: 779
    }, {
      label: 'large',
      enter: 780,
      exit: 10000
    }
  ]);

  jRes.addFunc({
    breakpoint: 'small',
    enter: function () {
      jPM.on();
      console.log('on');
    },
    exit: function () {
      jPM.off();
      console.log('off');
    }
  });
});
