$(document).ready(function() {
	var xhr_callback = function(response) {
		var form = arguments[3],
			type = 'success';
	
		if (response.success && response.data) {
			form.trigger('success', response.data);
			
			if (form.is('.reset')) {
				form.resetForm();
			}
		}
		
		if (!response.success && response.data) {
			form.trigger('error', response.data);
		}
		
		if (response.data) {			
			if (response.data.message_type) {
				type = response.data.message_type;
			}
			
			if (response.data.message) {
				$('body').notify('add', response.data.message, type);
			}
			
			if (!response.success && response.data.focus) {				
				form.find('[name="' + response.data.focus + '"]').focus();
			}
		}
	};
	
	$('body').on('click', '.ajax-link', function(event) {
		event.preventDefault();
		
		var link = $(this);
		
		$.getJSON(link.attr('href'), function(response) {
			var type = 'success';
			
			if (response.data) {
				if (response.data.message_type) {
					type = response.data && response.data.message_type;
				}
				
				if (response.success) {
					link.trigger('get:success', response.data);

					if (link.is('[data-success]')) {
						$('body').notify('add', link.attr('data-success'), type);
					}
				} else if (response.data.message) {
					link.trigger('get:error', response.data);
					
					$('body').notify('add', response.data.message, type);
				}
			}
		});
	});
	
	$('body').on('change', 'form.ajax-change', function() {
		$(this).ajaxSubmit({
			dataType : 'json',
			success : xhr_callback,
			error : function () {
				$('body').notify('add', 'Invalid response from the Server. Please try again.', 'error');
			}
		});
	});
	
	$('.ajax-form').ajaxForm({
		dataType : 'json',
		success : xhr_callback,
		error : function () {
			$('body').notify('add', 'Invalid response from the Server. Please try again.', 'error');
		}
	});
	
	$('body').on('click', '[data-submit]', function(event) {
		event.preventDefault();
		
		$($(this).attr('data-submit')).trigger('submit');
	});
	
	$('label [type="checkbox"]').each(function() {
		var checkbox = $(this),
			label = checkbox.closest('label'),
			icon = $('<span>&nbsp;</span>').addClass('fa');
			
		if (checkbox.prop('checked')) {
			icon.addClass('fa-check-square-o');
		} else {
			icon.addClass('fa-square-o');
		}
		
		label.prepend(icon);
		checkbox.addClass('hidden');
	}).change(function() {
		var checkbox = $(this),
			label = checkbox.closest('label'),
			icon = label.find('.fa');
	
		if (checkbox.prop('checked')) {
			icon.removeClass('fa-square-o').addClass('fa-check-square-o');
		} else {
			icon.removeClass('fa-check-square-o').addClass('fa-square-o');
		}
	});
	
	$('label [type="radio"]').each(function() {
		var radio = $(this),
			label = radio.closest('label'),
			icon = $('<span>&nbsp;</span>').addClass('fa');
			
		label.css('cursor', 'pointer');
			
		if (radio.prop('checked')) {
			icon.addClass('fa-dot-circle-o');
		} else {
			icon.addClass('fa fa-circle-o');
		}
		
		label.prepend(icon);
		radio.addClass('hidden');
	}).change(function() {
		var radios = $('[name="' + $(this).attr('name') + '"]');
		
		radios.each(function() {
			var radio = $(this),
				label = radio.closest('label'),
				icon = label.find('.fa');
				
			if (radio.prop('checked')) {
				icon.removeClass('fa-circle-o').addClass('fa-dot-circle-o');
			} else {
				icon.removeClass('fa-dot-circle-o').addClass('fa fa-circle-o');
			}	
		});
	});
	
	$('[data-key]').each(function() {
		var activate = $(this),
			key = activate.attr('data-key');
		
		$(document).on('keydown', function (e) {
			if ((e.ctrlKey || e.metaKey) && e.altKey && (String.fromCharCode(e.which).toLowerCase() === key)) {
				activate.trigger('click');
			}
		});
	});
	
	$(document).on('focus', '.datepicker', function() {
		$(this).datepicker({
			dateFormat : 'yy-mm-dd'
		});
	});
	
	$('table.sortable').stupidtable().find('th[data-sort]').eq(0).stupidsort('desc');
});