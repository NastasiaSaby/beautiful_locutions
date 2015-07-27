'use strict';

/* global $ */
$(initTagger);

function initTagger() {
	$('input[name="tags"]').each(function(i, field) {
		field = $(field);
		field.select2({
			tags: field.data('tags'),
			tokenSeparators: [',', ' ']
		});
	});
}