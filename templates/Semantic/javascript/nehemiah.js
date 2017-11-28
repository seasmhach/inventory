/*
 * The MIT License
 *
 * Copyright 2017 nehemiah.
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
	var plugin = 'MessageAPI',
		public,
		private,
		defaults,
		settings;

	defaults = {};

	public = {
		init : function(options) {
			settings = $.extend({}, defaults, options);

			/**
			 * Register event listeners.
			 */
			this.on('display-message', public.display_message);
			this.on('clear-message', public.clear_message);

			return this;
		},

		/**
		 * Clear message
		 */
		clear_message : function() {
			var message = $(this);

			message.transition('hide');
		},

		/**
		 * Display message
		 *
		 * @param {type} event
		 * @param {type} parameters
		 */
		display_message : function(event, parameters) {
			var message = $(this),
				header = message.find('.header'),
				list = message.find('.list'),
				type = parameters.type || 'success';

			message.removeClass('info error success warning');
			message.addClass(type);
			list.empty();

			if (parameters.header) {
				header.text(parameters.header);
			}

			if (parameters.list) {
				$.each(parameters.list, function() {
					var item = $('<li>').text(this);

					list.append(item);
				});
			}

			message.transition('fade');
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
	var plugin = 'RecordAPI',
		public,
		private,
		defaults,
		settings;

	defaults = {};

	public = {
		init : function(options) {
			settings = $.extend({}, defaults, options);

			/**
			 * Register event listeners.
			 */
			this.on('add-record', public.add_record);

			return this;
		},

		add_record : function(event, key, record) {
			var table = $(this),
				existing = false,
				template;

			if (0 === (template = table.find('[data-record="' + key + '"]')).length) {
				template = table.find('.clone-template').clone().removeClass('clone-template');
				existing = true;
			}

			template.attr('data-record', key);

			$.each(record, function(name, value) {
				var column = template.find('[data-column="' + name + '"]');

				if (0 < column.length) {
					if (!value && column.is('[data-default]')) {
						value = column.attr('data-default');
					}

					column.text(value);
				}
			});

			template.find('[data-href]').each(function() {
				var anchor = $(this),
					href = anchor.attr('data-href');

				$.each(record, function(name, value) {
					href = href.split('%' + name + '%').join(value);
				});

				anchor.attr('href', href);
			});

			if (true === existing) {
				if (table.is('[data-insert]') && table.attr('data-insert') === 'prepend') {-
					table.prepend(template);
				} else {
					table.append(template);
				}
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
	var plugin = 'AjaxAPI',
		public,
		private,
		defaults,
		settings;

	defaults = {};

	public = {
		init : function(options) {
			settings = $.extend({}, defaults, options);

			/**
			 * Check if the 'jQuery Form' plugin is loaded.
			 */
			if (!$.fn.ajaxForm || !$.fn.ajaxSubmit) {
				console.log("You need to include the 'jQuery Form' plugin!");

				return;
			}

			this.on('submit', 'form.ajax-form', public.form_initiator);
			this.on('click', 'a.ajax', public.link_initiator);
			this.on('change', '[data-options]', public.select_initiator);

			return this;
		},

		/**
		 * Select AJAX initiator
		 *
		 * @param  {object} event jQuery event
		 */
		select_initiator : function(event) {
			event.preventDefault();

			var select = $(this),
				url = select.attr('data-href') + '/' + select.val(),
				callback;

			callback = function() {
				var jqXHR = $.get(url, {
					dataType : 'json'
				});

				jqXHR.always(function() {
					alert('gr8');
				});
			};

			private.initiator(select, callback);
		},

		/**
		 * Ajax initiator for forms.
		 *
		 * @param {object} event - jQquery Event
		 */
		form_initiator : function(event) {
			event.preventDefault();

			var form = $(this),
				response_type = form.attr('data-response-type') || 'json',
				callback;

			// The form is not yet finished with loading the previous call
			if (form.hasClass('loading')) {
				return;
			}

			// Passed to the private.initiator
			callback = function() {
				var jqXHR;

				/**
				 * Remove any status classes from input elements within the initiator
				 * element.
				 */
				form.find('.field').removeClass('info error success warning');
				form.addClass('loading');
				form.ajaxSubmit({dataType : response_type});

				jqXHR = form.data('jqxhr');

				jqXHR.always(function () {
					form.removeClass('loading');
				});

				jqXHR.done(function(response) {
					if (response.message) {
						private.set_message(form, response.message);
					}

					if (response.set) {
						private.set_form_control_values(form, response.set);
					}

					if (response.action) {
						form.find('[data-display-on="' + response.action + '"]').removeClass('hide');
					}

					if (form.is('.reset')) {
						form.resetForm();
					}
				});

				jqXHR.fail(function() {
					switch(jqXHR.status) {
						case 422:
							if (jqXHR.responseJSON) {
								private.set_message(form, jqXHR.responseJSON.message, 'warning', jqXHR.responseJSON.errors);

								if (jqXHR.responseJSON.fields) {
									private.highlight_controls(form, jqXHR.responseJSON.fields);
								}
							}

							break;
						default:
							private.set_message(form, arguments[2], 'error');
					}
				});
			};

			private.initiator(form, callback);
		},

		link_initiator : function(event) {
			event.preventDefault();

			var link = $(this),
				response_type = link.attr('data-response-type') || 'json',
				callback;

			callback = function() {
				var jqXHR = $.get(link.attr('href'), {
					dataType : response_type
				});

				jqXHR.done(function(response) {
					if (link.is('[data-remove]')) {
						if (link.attr('data-remove') === 'record') {
							link.closest('tr').remove();
						} else {
							$(link.attr('data-remove')).remove();
						}
					}

					if (link.is('[data-form]')) {
						private.populate_form($(link.attr('data-form')), response);
					}

					if (link.is('[data-modal]')) {
						$(link.attr('data-modal')).modal({
							onHide : function() {
								$(this).find('.message').transition('hide');
							},

							onVisible : function() {
								$(this).find('.pickdate').calendar({
									type: 'date',
									formatter: {
										date: function (date) {
											return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2)+ '-' + ('0' + date.getDate()).slice(-2);
										}
									}
								});

								$('.popup', this).popup();
							}
						}).modal('show');
					}
				});
			};

			private.initiator(link, callback);
		},

		link_response_handler : function () {

		},

		/**
		 * Handle the AJAX response
		 *
		 * @param {type} response
		 * @param {type} textStatus
		 * @param {type} jqXHR
		 * @param {type} initiator
		 * @returns {undefined}
		 */
		ajax_response : function(response, textStatus, jqXHR, initiator) {
			if (response.data) {
				if (response.data.message) {
					private.set_message(
						initiator,
						response.data.message,
						response.success ? 'success' : 'warning',
						response.data.messages
					);
				}

				if (response.data.controls) {
					private.highlight_controls(initiator, response.data.controls);
				}

				if (initiator.is('[data-table]') && response.data.record && response.data.key) {
					$(initiator.attr('data-table')).trigger('add-record', [response.data.key, response.data.record]);
				}

				if (initiator.is('[data-form]') && response.data.record) {
					private.populate_form($(initiator.attr('data-form')), response.data.record);
				}

				if (initiator.is('[data-snippet]') && response.data.snippet) {
					$(initiator.attr('data-snippet')).html(response.data.snippet);
				}

				if (initiator.is('[data-modal]')) {
					$(initiator.attr('data-modal')).modal({
						onHide : function() {
							$(this).find('.message').transition('hide');
						},

						onVisible : function() {
							$(this).find('.pickdate').calendar({
								type: 'date',
								formatter: {
									date: function (date) {
										return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2)+ '-' + ('0' + date.getDate()).slice(-2);
									}
								}
							});

							$('.popup', this).popup();
						}
					}).modal('show');
				}

				if (response.success) {
					initiator.trigger('ajax-success', response.data);

					if (initiator.is('[data-remove]')) {
						if (initiator.attr('data-remove') === 'record') {
							initiator.closest('tr').remove();
						} else {
							$(initiator.attr('data-remove')).remove();
						}
					}

					if (initiator.is('.reset')) {
						initiator.resetForm();
					}

					if (initiator.is('[data-options]') && response.data.key_value_pairs) {
						private.set_options(initiator.attr('data-options'), response.data.key_value_pairs);
					}

					if (response.data && response.data.primary_key) {
						private.set_primary_key(initiator, response.data.primary_key);
					}
				}
			}
		},

		/**
		 * Handle the AJAX error
		 *
		 * @param {type} initiator
		 * @returns {undefined}
		 */
		ajax_error : function(initiator) {
			private.set_message(
				initiator,
				'An unexpected error occured while submitting the form. The server didn\'t reply (correctly). Please try again. Contact the administrator if this error persists.',
				'error'
			);
		},

		defaults : function(options) {
			$.extend(defaults, options);
		}
	};

	private = {
		/**
		 * General AJAX initiator. All Initiators should call this initiator before
		 * the actual AJAX request is being made!
		 *
		 * @param {jquery selection} initiator The element on which the initiator is called
		 * @returns {bool}  False if the AJAX request should be cancelled true otherwise
		 */
		initiator : function(initiator, callback) {
			var confirm;

			/**
			 * Reset the message area
			 */
			private.set_message(initiator, null);

			if (initiator.is('[data-confirm]')) {
				confirm = $('#confirm-dialog');
				confirm.find('.dialog-body').text(initiator.attr('data-confirm'));

				confirm.modal({
					closable : false,
					onDeny		: function(){
						initiator.removeClass('loading');
					},

					onApprove : function() {
						callback.call();
					}
				}).modal('show');
			} else {
				callback.call();
			}
		},

		set_message : function(initiator, content, type, list) {
			var message;

			/**
			 * Find out if the initiator has a message area defined for it. There's
			 * two way to define a message area.
			 *
			 * - Set the 'data-message' attribute on the initiator with a valid selector
			 * - Have a Semantic message area element as a child of the initiator
			 */
			if (initiator.is('[data-message]')) {
				message = $(initiator.attr('data-message'));
			} else {
				message = initiator.find('.ui.message');
			}

			if (message.length > 0) {
				if (null === content) {
					message.trigger('clear-message');
				} else {
					message.trigger('display-message', {
						'header' : content,
						'type' : type,
						'list' : list
					});
				}
			}
		},

		highlight_controls : function(initiator, controls) {
			$.each(controls, function() {
				var field = initiator.find('[name="' + this + '"]').closest('.field');

				field.addClass('error');
			});
		},

		populate_form : function(form, record) {
			if (form.length <= 0) {
				console.log("Could not populate form. Form doesn't exists.");

				return false;
			}

			$.each(record, function(name, value) {
				var column = form.find('[name="' + name + '"]');

				if (0 < column.length) {
					if (column.is('[type="checkbox"]')) {
						if (column.attr('value').toString() === value.toString()) {
							column.prop('checked', true);
						} else {
							column.prop('checked', false);
						}
					} else if (column.is('[multiple]')) {
						column.dropdown('clear');
					} else if (column.is('.wysiwyg')) {
						// TODO: Fix this situation!
						//tinyMCE.execCommand("mceRepaint");
					} else {
						column.val(value);
					}

					if (column.parent().is('.dropdown')) {
						if (null === value) {
							column.dropdown('set selected', '0');
						} else {
							column.dropdown('set selected', value);
						}
					}
				}
			});
		},

		set_options : function(select, options) {
			var select = $('[name="' + select + '"]'),
				first = true,
				observer_options = { childList: true, characterData: true, attributes: true, subtree: true },
				mutation_observer = window.MutationObserver || window.WebKitMutationObserver,
				observer;

			select.empty();

			observer = new mutation_observer(function() {
				observer.disconnect();
				select.dropdown('set selected', first);
				select.dropdown('refresh');
			});

			select.each(function() {
				observer.observe(this, observer_options);
			});


			$.each(options, function(key) {
				if (true === first) {
					first = key;
				}

				select.append($('<option value="' + key + '">' + this + '</option>'));
			});
		},

		set_form_control_values : function(initiator, controls) {
			$.each(controls, function(name) {
				var control = initiator.find('[name="' + name + '"]');

				if (!control.length) {
					control = $('<input>').attr({
						type: 'hidden',
						name: name
					});

					initiator.prepend(control);
				}

				console.log('control');

				control.val(this);
			});
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
	var plugin = 'AppendRow',
		public,
		private,
		defaults,
		settings;

	defaults = {};

	public = {
		init : function(options) {
			settings = $.extend({}, defaults, options);

			this.click(public.append);

			return this;
		},

		append : function() {
			var table = $(this).closest('table'),
				tbody = table.find('> tbody'),
				row_index = tbody.attr('data-index'),
				template = tbody.find('.clone-template'),
				clone = template.clone();

			if (!row_index) {
				row_index = 0;
			} else {
				row_index = (row_index / 1) + 1;
			}

			tbody.attr('data-index', row_index);

			clone.find(':input').each(function() {
				var input = $(this),
					name = input.attr('name'),
					value = input.val(),
					options = input.attr('data-options');

				if (!name) {
					return;
				}

				input.attr('name', name.replace('%row_index%', row_index));

				if (value) {
					input.val(value.replace('%row_index%', row_index));
				}

				if (options) {
					input.attr('data-options', options.replace('%row_index%', row_index));
				}
			}).prop('disabled', false);

			clone.find('.dropdown').dropdown({ fullTextSearch: 'exact' }).removeClass('disabled');
			clone.find('.ui.slider').checkbox();
			clone.find('.pickdate').calendar({
				type: 'date',
				formatter: {
					date: function (date) {
						return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2)+ '-' + ('0' + date.getDate()).slice(-2);
					}
				}
			});

			clone.removeClass('clone-template');
			clone.attr('data-row', row_index);
			tbody.append(clone);
			table.trigger('row-added', clone);
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

			return this.each(function() {
				var conditional_element = $(this),
					values = conditional_element.attr('data-visible-on').split(','),
					form = conditional_element.closest('form'),
					referencing_element = form.find('[name="' + conditional_element.attr('data-depends-on') + '"]');

				referencing_element.change(function() {
					var value;

					if (referencing_element.is('[type="checkbox"]')) {
						value = referencing_element.prop('checked') ? '1' : '0';
					} else {
						value = referencing_element.val();
					}

					if ($.inArray(value, values) !== -1) {
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

(function($) {
	var plugin = 'ShortKeys',
		public,
		private,
		defaults,
		settings;

	defaults = {};

	public = {
		init : function(options) {
			settings = $.extend({}, defaults, options);

			var save_form = $('form.save');

			if (save_form.length) {
				save_form.bind('keydown', function(event) {
					if ((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() === 's') {
						event.preventDefault();

						$(this).trigger('submit');
					}
				});
			}

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

$(document).ready(function() {
	$('.message.ui').MessageAPI();
	$('table.records').RecordAPI();
	$('body').AjaxAPI();
	$('.dropdown').dropdown({ fullTextSearch: 'exact' });
	$('.ui.checkbox').checkbox();
	$('.popup').popup();
	$('.inline-popup').popup({inline: true});
	$('[data-depends-on]').Depends();
	$('.append-row').AppendRow();
	$('.datepicker').calendar({
		type: 'date',
		today: true,
		formatter: {
			date: function (date) {
				return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2)+ '-' + ('0' + date.getDate()).slice(-2);
			}
		}
	});

	$('body').on('click', '.delete_row', function(event) {
		event.preventDefault();

		$(this).closest('tr').remove();
	});

	$('body').on('change', '.file-upload [type="file"]', function() {
		var input = $(this),
			wrapper = input.closest('label');

		wrapper.find('span').text(input.val());
	});

	$(window).ShortKeys();
});
