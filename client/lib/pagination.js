'use strict';

/* global $ */
$(changePage);

function changePage() {
    $('.pagination>li>a').click(function(e) {
        e.preventDefault();
        $('#skip').val($(this).attr('href'));
        $('form').submit();
    });
}
