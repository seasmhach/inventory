(function($) {
	var plugin = 'dropdown',
		public,
		private,
		defaults,
		settings;
		
	defaults = {};
	
	public = {		
		init : function(options) {
			settings = $.extend({}, defaults, options);

			this.on('click', '.dropdown', function(event) {
				if ($(event.target).closest('[data-toggle=dropdown]').length) {
					event.preventDefault();
				
					$(this).dropdown('toggle');
				}
			});
			
			$(document).on('keyup', function(event) {
				var active = $('.dropdown.expanded');
				
				if (active.length) {
					if (event.which === 40) {
						active.dropdown('focus_next');
					} else if (event.which === 38) {
						active.dropdown('focus_previous');
					}
				}
			});
			
			$(document).mouseup(function(e) {
				var container = $(".dropdown.expanded");

				if (!container.is(e.target)	&& container.has(e.target).length === 0) {
					container.dropdown('toggle');
				}
			});

			return this;
		},
		
		focus_next : function() {
			var dropdown = this,
				content = dropdown.find('ul.dropdown-content'),
				focus = null;
				
			content.find('li').each(function() {
				var item = $(this),
					widgets = item.find('a:not(.hidden), input:not(.hidden)'),
					focused = item.find(':focus');
				
				if (focus === null && widgets.length) {
					focus = widgets.first();
				}
				
				if (focused.length) {
					focus = null;
				}
			});
			
			if (focus !== null) {
				focus.focus();
			} else {
				content.find('a:not(.hidden), input:not(.hidden)').first().focus();
			}
		},
		
		focus_previous : function() {
			var dropdown = this,
				content = dropdown.find('ul.dropdown-content'),
				focus = content.find('a:not(.hidden), input:not(.hidden)');
		
			if (focus.first().is(':focus')) {
				focus = focus.last();
			} else {
				focus = focus.first();
				
				content.find('li').each(function() {
					var item = $(this),
						widgets = item.find('a:not(.hidden), input:not(.hidden)'),
						focused = item.find(':focus');

					if (focused.length) {
						return false;
					}
					
					if (widgets.length) {
						focus = widgets.first();
					}
				});
			}

			focus.focus();
		},
		
		toggle : function() {
			var dropdown = this,
				content = dropdown.find('.dropdown-content');
		
			if (dropdown.is('.expanded')) {
				content.fadeOut(function() {
					dropdown.removeClass('expanded').addClass('collapsed');
					dropdown.trigger('collapsed');
				});
			} else {
				content.fadeIn(function() {
					dropdown.addClass('expanded').removeClass('collapsed');
				});
				dropdown.trigger('expanded');
			}
			
			content.css('min-width', dropdown.width() + 'px');
		},
		
		defaults : function(options) {
			$.extend(defaults, options);
		}
	};
	
	private = {};
	
	$.fn[plugin] = function(method) {
		if (public[method]) {
			return public[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return public.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + plugin);
			return false;
		}
	};
})(jQuery);

(function($) {
	var plugin = 'alert',
		public,
		private,
		defaults,
		settings;
		
	defaults = {};
	
	public = {		
		init : function(options) {
			settings = $.extend({}, defaults, options);

			this.on('click', '.alert.dismiss', function(event) {
				event.preventDefault();
				
				$(this).alert('dismiss');
			});

			return this;
		},
		
		dismiss : function () {
			var alert = this;
			
			alert.fadeOut(function(){
				alert.remove();
			});
		},
		
		defaults : function(options) {
			$.extend(defaults, options);
		}
	};
	
	private = {};
	
	$.fn[plugin] = function(method) {
		if (public[method]) {
			return public[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return public.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + plugin);
			return false;
		}
	};
})(jQuery);

(function($) {
	var plugin = 'tabs',
		public,
		private,
		defaults,
		settings;
		
	defaults = {};
	
	public = {		
		init : function(options) {
			settings = $.extend({}, defaults, options);

			this.on('click', '[data-toggle="tab"]', function(event) {
				event.preventDefault();
				
				$(this).tabs('activate');
			});
		},

		activate : function() {
			var tab = this,
				id = tab.attr('href'),
				container = tab.closest('.tabs'),
				tabs = container.find('[data-toggle="tab"]'), // Get all tab links
				active_pane = container.find('.tab.active'),
				pane = $(id); 
			
			tabs.removeClass('active');
			tab.addClass('active');
			active_pane.removeClass('active').css('display', 'none');
			
			if (pane.is('.fade')) {
				pane.addClass('active').css('display', 'none').fadeIn();
			} else {
				pane.addClass('active').css('display', 'initial');
			}
			
			container.trigger('tab:shown');
		},
		
		previous : function() {
			var tab = this.tabs('active_tab'),
				previous = tab.prev(':not(.hidden)');
		
			previous.trigger('click');
		
			return 0 < previous.length ? true : false;
		},
		
		next : function() {
			var tab = this.tabs('active_tab'),
				next = tab.next(':not(.hidden)');
		
			next.trigger('click');
		
			return 0 < next.length ? true : false;
		},
		
		last : function() {
			var tabs = this.find('[data-toggle="tab"]:not(.hidden)');
			
			tabs.last().trigger('click');
		},
		
		first : function() {
			var tabs = this.find('[data-toggle="tab"]:not(.hidden)');
			
			tabs.first().trigger('click');
		},
		
		count : function() {
			return this.find('[data-toggle="tab"]:not(.hidden)').length;
		},
		
		remove : function() {
			var tab = this.tabs('active_tab'),
				pane = this.tabs('active_pane'),
				previous = this.tabs('previous');
		
			tab.remove();
			pane.remove();
			
			if (true !== previous) {
				this.tabs('first');
			}
		},
		
		active_pane : function() {
			return this.find('.tab.active');
		},
		
		active_tab : function() {
			return this.find('[data-toggle="tab"].active');
		},
		
		defaults : function(options) {
			$.extend(defaults, options);
		}
	};
	
	private = {};
	
	$.fn[plugin] = function(method) {
		if (public[method]) {
			return public[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return public.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + plugin);
			return false;
		}
	};
})(jQuery);

(function($) {
	var plugin = 'Modal',
		public,
		private,
		defaults,
		settings;
		
	defaults = {};
	
	public = {		
		init : function(options) {
			settings = $.extend({}, defaults, options);
		
			var modals = $(this);
		
			$(document).on('click', '[data-toggle]', function(event) {				
				var selector = $(this).attr('data-toggle'),
					modal = modals.find(selector).addBack(selector);

				if (0 < modal.length) {
					event.preventDefault(); // TODO: should I stop propogate too?
					modal.Modal('show');
				}
			});			
			
			$(document).keyup(function(event) {
				if (event.keyCode === 27) {
					modals.Modal('hide');
				}
			});
			
			this.on('click', '[data-dismiss="modal"]', function() {
				$(this).closest('.modal').Modal('hide');
			});
			
			$(document).on('click', 'a[data-target]', function(event) {
				var link = $(this),
					url = link.attr('href'),
					selector = link.attr('data-target'),
					modal = modals.find(selector).addBack(selector),
					xhr;
					
				if (0 < modal.length) {
					event.preventDefault();
					modal.trigger('ajax-link', link, url);
					
					if (link.is('[data-append]')) {
						url = url + link.attr('data-append');
					}
					
					xhr = $.getJSON(url, function(response) {
						if (response.success && response.data) {
							if (response.data.title) {
								modal.Modal('title', response.data.title);
							}
							
							if (response.data.content) {
								modal.Modal('content', response.data.content);
							}
							
							modal.trigger('ajax-loaded');
							modal.Modal('show');
						} else { // Ajax failed redirect to original link location
							window.location = link.attr('href');
							return;
						}
						
						modal.trigger('ajax-link-done', link, url, response);
					});
				}
			});
			
			/*$(document).mouseup(function(e) {
				var container = $(".dialog.active");

				if (!container.is(e.target)	&& container.has(e.target).length === 0) {
					container.closest('.modal').Modal('hide');
				}
			});*/
			
			return modals; // Chainability
		},
		
		show : function() {
			var shutter = $(this),
				dialog = shutter.find('.dialog');
		
			shutter.show();
			dialog.addClass('active');
			$('body').css('overflow', 'hidden');
		
			if (shutter.is('.fade')) {
				dialog.fadeIn();
			} else if (shutter.is('.slide')) {
				dialog.slideDown();
			} else {
				dialog.show();
			}
			
			shutter.trigger('shown');
		},
		
		hide : function() {
			var shutter = $(this),
				dialog = shutter.find('.dialog');
		
			if (settings.effect === 'fade') {
				dialog.fadeOut(settings.duration, function() { shutter.hide(); });
			} else if (settings.effect === 'slide') {
				dialog.slideUp(settings.duration, function() { shutter.hide(); });
			} else {
				dialog.show();
				shutter.hide();
				$('body').css('overflow', 'auto');
			}
		},
		
		content : function(content) {
			var body = $(this).find('.body');
			
			body.empty().html(content);
			
			$(this).trigger('content-set', body);
		},
		
		title : function(title) {
			var heading = $(this).find('.modal-title');
			
			heading.empty().html(title);
		},

		defaults : function(options) {
			$.extend(defaults, options);
		}
	};
	
	private = {
		show : function() {
			console.log('here');
		}
	};
	
	$.fn[plugin] = function(method) {
		if (public[method]) {
			return public[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return public.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + plugin);
			return false;
		}
	};
})(jQuery);

(function($) {
	var plugin = 'selectpicker',
		public,
		private,
		defaults,
		settings;
		
	defaults = {};
	
	public = {		
		init : function(options) {
			settings = $.extend({}, defaults, options);
			
			$(document).on('keyup', '.selectpicker-list input', function(event) {
				var	search = $(this),
					dropdown = search.closest('.selectpicker-dropdown'),
					select = dropdown.find('select');
				
				select.selectpicker('populate', search.val());
			});
			
			$('body').on('expanded', '.selectpicker-dropdown', function() {
				$(this).find('input').focus();
			});
			
			$('body').on('click', '.selectpicker-list a', function(event) {
				event.preventDefault();
				
				var	option = $(this),
					dropdown = option.closest('.selectpicker-dropdown'),
					select = dropdown.find('select');
					
				select.selectpicker('toggle', option.attr('href').replace('#', ''));
			});

			return this.each(function() {				
				var select = $(this),
					dropdown = $('<div>').addClass('dropdown selectpicker-dropdown fade'),
					button = $('<button>').addClass('dropdown-toggle block toggle-selectpicker').attr('type', 'button').attr('data-toggle', 'dropdown'),
					label = $('<span>').addClass('button-label'),
					arrow = $('<span>').addClass('fa fa-arrow-circle-o-down'),
					content = $('<ul>').addClass('dropdown-content fade selectpicker-list');
					
				if (select.is('.search')) {
					content.append('<li class="space"><div class="group"><input class="control"><span class="addon"><span class="fa fa-search"></span></span></div></li><li class="header">Search Results:</li>');
				}
				
				button.append(label);
				button.append(arrow);
				
				dropdown.append(button);
				dropdown.append(content);
				
				select.replaceWith(dropdown).addClass('hidden');
				dropdown.append(select);
				select.selectpicker('populate');
			});
		},
		
		populate : function(search) {
			var select = this,
				dropdown = select.closest('.dropdown'),
				button = dropdown.find('.toggle-selectpicker'),
				label = button.find('.button-label'),
				content = dropdown.find('.dropdown-content'),
				max = 0,
				count = 0,
				selected = [],
				optgroup = null;
		
			if (select.is('[data-search-max]')) {
				max = (select.attr('data-search-max') * 1);
			}
		
			content.find('.result').remove();
			
			select.find('option').each(function() {
				var option = $(this),
					parent = option.parent(),
					item = $('<li>').addClass('result'),
					text = option.text(),
					link = $('<a>').attr('href', '#' + option.attr('value')).text(text);
					
				if (search && (-1 === text.toLowerCase().indexOf(search.toLowerCase()))) {
					return;
				}
				
				if (parent.is('optgroup')) {
					item.addClass('child');
					
					if (null === optgroup || !optgroup.is('[title="' + parent.attr('label') + '"]')) {
						optgroup = $('<li>').addClass('header').attr('title', parent.attr('label')).text(parent.attr('label'));
						
						content.append(optgroup);
					}
				} else {
					optgroup = null;
				}

				if (option.is('[selected]') || select.val() === option.attr('value')) {
					selected.push(text);
					link.append('&nbsp;<span class="fa fa-check pull-right"><span>');
				}

				item.append(link);
				content.append(item);
				count++;
				
				if (max !== 0 && count === max) {
					return false;
				}
			});			

			selected = selected.join('; ');
			label.text(selected).attr('title', selected);
		},
		
		toggle : function(value) {
			var select = this,
				dropdown = select.closest('.selectpicker-dropdown'),
				button = dropdown.find('.toggle-selectpicker'),
				label = button.find('.button-label'),
				options = select.find('option'),
				option = options.filter('[value="' + value + '"]'),
				link = dropdown.find('a[href="#' + value + '"]'),
				selected = [];
		
			if (!select.is('[multiple]')) {
				if (select.val() !== value) {
					options.removeAttr('selected');
					option.attr('selected', 'selected');
					select.val(value);
					dropdown.find('.result .fa').remove();
					link.append('&nbsp;<span class="fa fa-check pull-right"><span>');
					select.trigger('change');
				}
				
				dropdown.dropdown('toggle');
			} else if (option.is('[selected]')) {
				option.removeAttr('selected');
				link.find('.fa').remove();
				select.trigger('change');
			} else {
				option.attr('selected', 'selected');
				link.append('&nbsp;<span class="fa fa-check pull-right"><span>');
				select.trigger('change');
			}
			
			options.each(function() {
				var option = $(this);
				
				if (option.is('[selected]') || select.val() === option.attr('value')) {
					selected.push(option.text());
				}
			});
			
			selected = selected.join('; ');
			label.text(selected).attr('title', selected);
		},

		defaults : function(options) {
			$.extend(defaults, options);
		}
	};

	private = {};

	$.fn[plugin] = function(method) {
		if (public[method]) {
			return public[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return public.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + plugin);
			return false;
		}
	};
})(jQuery);

(function($) {
	var plugin = 'notify',
		public,
		private,
		defaults,
		settings;
		
	defaults = {
		life_time : 5000
	};
	
	public = {		
		init : function(options) {
			settings = $.extend({}, defaults, options);

			$(this).append('<div id="notify-traits"></div>');
		},
		
		add : function(message, type) {
			var type = type || 'success',
				notification = $('<p>').addClass('alert glow dismiss initial').addClass(type).html(message);
			
			$('#notify-traits').append(notification);
			
			setTimeout(function() {
				notification.removeClass('initial').addClass('out');

				setTimeout(function() {
					notification.remove();
				}, 1000);				
			}, settings.life_time);
		},
		
		defaults : function(options) {
			$.extend(defaults, options);
		}
	};
	
	private = {};
	
	$.fn[plugin] = function(method) {
		if (public[method]) {
			return public[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return public.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + plugin);
			return false;
		}
	};
})(jQuery);

$(document).ready(function() {	
	$('body').dropdown();
	$('body').alert();
	$('body').tabs();
	$('body').notify();
	$('.selectpicker').selectpicker();
	$('.modal').Modal({
		effect : 'fade'
	});
});