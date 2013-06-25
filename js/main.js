$(function () {
  console.log('Canary Promotion');
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
});
