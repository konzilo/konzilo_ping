(function ($) {
  $(function () {
    var updateSent = false;
    var konziloReady = false;
    function sendMessage(message) {
      var frame = $('#konzilo-iframe')[0];
      if (!frame) {
        return;
      }
      var frameWindow = frame.contentWindow;
      frameWindow.postMessage(message, '*');
    }

    window.addEventListener('message', function (message) {
      if (message.data.type === 'konziloReady') {
        konziloReady = true;
      }
      if (message.data.type === 'updateSent') {
        updateSent = true;
        console.log('message received');
        $('#post').submit();
      }
      if (message.data.type === 'windowHeight') {
        $('#konzilo-iframe').height(message.data.height + 10);
      }
    });

    function syncPost() {
      var title = $('#title').val();

      var month = $('#mm').val();
      var day = $('#jj').val();
      var year = $('#aa').val();
      var hour = $('#hh').val();
      var minute = $('#mn').val();
      var tz = parseInt(window.konzilo_ping.tz);
      if (tz < 10) {
        tz = '0' + tz;
      }
      var dateStr = year + '-' + month + '-' + day + 'T' + hour + ':' + minute
            + '+' + tz + ':00';
      var date = new Date(dateStr);
      sendMessage({
        type: 'updateChanged',
        remoteId: $('#ID').val(),
        publish_time: date,
        title: title
      });
    }

    $('.save-timestamp, .cancel-timestamp').click(syncPost);

    $('#post').submit(function (e) {
      if (!konziloReady || updateSent) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      sendMessage({ type: 'postSave' });

    });
    $('#title').change(syncPost);
  });
}(jQuery));
