/*
 * HTML5 Sortable jQuery Plugin
 * http://farhadi.ir/projects/html5sortable
 *
 * Copyright 2012, Ali Farhadi
 * Released under the MIT license.
 */
(function($) {
var dragging, placeholders = $();
$.fn.html5sortable = function(options) {
	var method = String(options);
	options = $.extend({
		connectWith: false
	}, options);
	var self = this;
	return this.each(function() {
		if (/^(enable|disable|destroy)$/.test(method)) {
			var items = $(this).children($(this).data('items')).attr('draggable', method === 'enable');
			if (method === 'destroy') {
				items.add(this).removeData('connectWith items')
					.off('dragstart.h5s dragend.h5s selectstart.h5s dragover.h5s dragenter.h5s drop.h5s');
			}
			return;
		}
		var isHandle, index, items = $(this).children(options.items);
		var placeholder = $('<' + (/^(ul|ol)$/i.test(this.tagName) ? 'li' : 'div') + ' class="sortable-placeholder">');
		items.find(options.handle).mousedown(function() {
			isHandle = true;
		}).mouseup(function() {
			isHandle = false;
		});
		$(this).data('items', options.items);
		placeholders = placeholders.add(placeholder);
		if (options.connectWith) {
			$(options.connectWith).add(this).data('connectWith', options.connectWith);
		}
		items.attr('draggable', 'true').on('dragstart.h5s', function(e) {
			if (options.handle && !isHandle) {
				return false;
			}
			isHandle = false;
			var dt = e.originalEvent.dataTransfer;
			dt.effectAllowed = 'copy';
			dt.setData('Text', 'dummy');
			index = (dragging = $(this)).addClass('sortable-dragging').index();
		}).on('dragend.h5s', function() {
			if (!dragging) {
				return;
			}
			dragging.removeClass('sortable-dragging').show();
			placeholders.detach();
	   	    dragging.parent().trigger('sortupdate', {item: dragging});
			dragging = null;
		}).not('a[href], img').on('selectstart.h5s', function() {
			if(this.dragDrop) {
				this.dragDrop();
			}
			return false;
		}).end().add([this, placeholder]).on('dragover.h5s dragenter.h5s drop.h5s', function(e) {
			if (!items.is(dragging) && options.connectWith !== $(dragging).parent().data('connectWith')) {
				return true;
			}

			var targets = dragging.attr('data-targets');
			if(targets && targets.split(',').indexOf(self.attr('data-key')) === -1) {
				return true;
			}

			if (e.type === 'drop') {
				e.stopPropagation();

				var parent = placeholders.filter(':visible').parent();

				if(dragging.parent().is(parent)) {
					dragging.detach();
				} else {
					dragging.removeClass('sortable-dragging').show();
				} 

				dragging = dragging.clone(true);

				if(parent.attr('data-unique') === 'true') {
					parent.find('[data-value="'+dragging.attr('data-value')+'"]').remove();	
				}

				dragging.insertAfter(placeholders.filter(':visible'));
				dragging.trigger('dragend.h5s');
				return false;
			}
			e.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = 'copy';
			if (items.is(this)) {
				if (options.forcePlaceholderSize) {
					placeholder.height(dragging.outerHeight());
				}
				if(!targets || targets.split(',').indexOf(dragging.parent().attr('data-key')) !== -1) {
					dragging.hide();
				}
				$(this)[placeholder.index() < $(this).index() ? 'after' : 'before'](placeholder);
				placeholders.not(placeholder).detach();
			} else if (!placeholders.is(this) && !$(this).children(options.items).length) {
				placeholders.detach();
				$(this).append(placeholder);
			}
			return false;
		});
	});
};
})(jQuery);
