/* 
 * The MIT License
 *
 * Copyright 2017 Tribal Trading <info@tribaltrading.eu>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


(function($) {
	var plugin = 'Duplicator',
		public,
		private,
		defaults,
		settings;
		
	defaults = {};
	
	public = {		
		init : function(options) {
			settings = $.extend({}, defaults, options);
			
			this.on('click', '[data-duplicate]', function() {
				var button = $(this),
					selector = button.attr('data-duplicate'),
					templates = $(selector);
				
				templates.each(function() {
					$(this).Duplicator('duplicate');
				});
			});
			
			$('.clone-template').find(':input').attr('disabled', 'disabled');
			
			return this;
		},
		
		duplicate : function(callback) {
			var template = $(this),
				clone = template.clone();
			
			clone.removeAttr('id').removeClass('hidden clone-template').find(':disabled').removeAttr('disabled');
			template.parent().append(clone);
			clone.find(':input').first().focus();
			
			if (callback) {
				callback(clone);
			}
			
			return clone;
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
	var plugin = 'Copyer',
		public,
		private,
		defaults,
		settings;
		
	defaults = {};
	
	public = {		
		init : function(options) {
			settings = $.extend({}, defaults, options);
			
			this.on('change', ':input', public.copy);
			
			return this;
		},
		
		copy : function () {			
			var element = $(this),
				form = element.closest('form'),
				target = form.find('[data-copy="' + element.attr('name') + '"]');

			if (target.hasClass('selectpicker')) {
				target.selectpicker('val', element.val());
			} else {
				target.val(element.val());
			}
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
	var plugin = 'Depends',
		public,
		private,
		defaults,
		settings;
		
	defaults = {};
	
	public = {		
		init : function(options) {
			settings = $.extend({}, defaults, options);
			
			$('[data-depends-on]').each(function() {
				var container = $(this),
					selector = container.attr('data-depends-on'),
					value = container.attr('data-visible-on');
				
				$('body').on('change initialize', selector, function() {
					if ($(this).val() === value) {
						container.removeClass('hidden');
					} else {
						container.addClass('hidden');
					}
				});
				
				$(selector).trigger('initialize');
			});
			
			return this;
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
	var plugin = 'DeleteAncestor',
		public,
		private,
		defaults,
		settings;
		
	defaults = {};
	
	public = {		
		init : function(options) {
			settings = $.extend({}, defaults, options);
			
			this.on('click', '[data-delete-ancestor]', public.remove);
			
			return this;
		},
		
		remove : function () {
			var element = $(this),
				targets = element.closest(element.attr('data-delete-ancestor'));
		
			targets.each(function() {
				var target = $(this),
					form;
				
				if (target.find(':input').length) {
					form = target.closest('form');
				}
				
				target.fadeOut({
					complete : function() {
						targets.remove();
						
						if (form) {
							form.change();
						}
					}
				});
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

$(document).ready(function() {
	$(document).Duplicator();
	
	$('form').Copyer().Depends();
	
	$(document).DeleteAncestor();
});