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
	var plugin = 'Depends',
		public,
		private,
		defaults,
		settings;
		
	defaults = {};
	
	public = {
		init : function(options) {
			settings = $.extend({}, defaults, options);

			return this.each(function() {
				var conditional_element = $(this),
					values = conditional_element.attr('data-visible-on').split(','),
					form = conditional_element.closest('form'),
					referencing_element = form.find('[name="' + conditional_element.attr('data-depends-on') + '"]');
				
				referencing_element.change(function() {					
					if ($.inArray(referencing_element.val(), values) !== -1) {
						conditional_element.show().find(':input').prop('disabled', false);
					} else {
						conditional_element.hide().find(':input').prop('disabled', true);
					}
				}).trigger('change');
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