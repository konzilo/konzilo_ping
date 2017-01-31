(function ($) {
  $(function () {
    var updateSent = false;
    var konziloReady = false;
    var status = $('#post_status').val();
    var originalStatus = status;

    $('#post_status').change(function () {
      status = $(this).val();
      syncPost();
    });
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
        console.log('ready');
        $('#konzilo-iframe').css('height', 300);
        konziloReady = true;
      }
      if (message.data.type === 'updateSent') {
        updateSent = true;
        if (status === 'publish') {
          $('#publish').click();
        }
        else {
          $('#post').submit();
        }
      }
      if (message.data.type === 'windowHeight') {
        var height = message.data.height > 150 ? message.data.height + 10 : 150;
        $('#konzilo-iframe').css('height', height + 10);
      }
    });

    function syncPost(e, save) {
      var title = $('#title').val();

      var month = $('#mm').val();
      var day = $('#jj').val();
      var year = $('#aa').val();
      var hour = $('#hh').val();
      var minute = $('#mn').val();
      var tz = parseInt(window.konzilo.tz);
      if (tz < 10) {
        tz = '0' + tz;
      }
      var dateStr = year + '-' + month + '-' + day + 'T' + hour + ':' + minute
            + '+' + tz + ':00';
      var date = new Date(dateStr);
      sendMessage({
        type: save ? 'postSave' : 'updateChanged',
        remoteId: $('#ID').val(),
        publish_time: date,
        title: title,
        status: status
      });
    }

    $('#publish').click(function (e) {
      if (originalStatus !== 'publish') {
        status = 'publish';
      }
    });

    $('.save-timestamp, .cancel-timestamp').click(syncPost);

    $('#post').submit(function (e) {
      if (!konziloReady || updateSent) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      syncPost(e, true);
    });
    $('#title').change(syncPost);
  });
}(jQuery));
