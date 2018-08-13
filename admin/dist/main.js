(function () {
	'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function appendNode(node, target) {
		target.appendChild(node);
	}

	function insertNode(node, target, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detach);
		}
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function createComment() {
		return document.createComment('');
	}

	function addListener(node, event, handler) {
		node.addEventListener(event, handler, false);
	}

	function removeListener(node, event, handler) {
		node.removeEventListener(event, handler, false);
	}

	function setAttribute(node, attribute, value) {
		node.setAttribute(attribute, value);
	}

	function destroyBlock(block, lookup) {
		block.d(1);
		lookup[block.key] = null;
	}

	function updateKeyedEach(old_blocks, component, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, intro_method, next, get_context) {
		var o = old_blocks.length;
		var n = list.length;

		var i = o;
		var old_indexes = {};
		while (i--) old_indexes[old_blocks[i].key] = i;

		var new_blocks = [];
		var new_lookup = {};
		var deltas = {};

		var i = n;
		while (i--) {
			var child_ctx = get_context(ctx, list, i);
			var key = get_key(child_ctx);
			var block = lookup[key];

			if (!block) {
				block = create_each_block(component, key, child_ctx);
				block.c();
			} else if (dynamic) {
				block.p(changed, child_ctx);
			}

			new_blocks[i] = new_lookup[key] = block;

			if (key in old_indexes) deltas[key] = Math.abs(i - old_indexes[key]);
		}

		var will_move = {};
		var did_move = {};

		function insert(block) {
			block[intro_method](node, next);
			lookup[block.key] = block;
			next = block.first;
			n--;
		}

		while (o && n) {
			var new_block = new_blocks[n - 1];
			var old_block = old_blocks[o - 1];
			var new_key = new_block.key;
			var old_key = old_block.key;

			if (new_block === old_block) {
				// do nothing
				next = new_block.first;
				o--;
				n--;
			}

			else if (!new_lookup[old_key]) {
				// remove old block
				destroy(old_block, lookup);
				o--;
			}

			else if (!lookup[new_key] || will_move[new_key]) {
				insert(new_block);
			}

			else if (did_move[old_key]) {
				o--;

			} else if (deltas[new_key] > deltas[old_key]) {
				did_move[new_key] = true;
				insert(new_block);

			} else {
				will_move[old_key] = true;
				o--;
			}
		}

		while (o--) {
			var old_block = old_blocks[o];
			if (!new_lookup[old_block.key]) destroy(old_block, lookup);
		}

		while (n) insert(new_blocks[n - 1]);

		return new_blocks;
	}

	function blankObject() {
		return Object.create(null);
	}

	function destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = noop;

		this._fragment.d(detach !== false);
		this._fragment = null;
		this._state = {};
	}

	function _differs(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function fire(eventName, data) {
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				handler.__calling = true;
				handler.call(this, data);
				handler.__calling = false;
			}
		}
	}

	function get() {
		return this._state;
	}

	function init(component, options) {
		component._handlers = blankObject();
		component._bind = options._bind;

		component.options = options;
		component.root = options.root || component;
		component.store = options.store || component.root.store;
	}

	function on(eventName, handler) {
		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) return;
		this.root._lock = true;
		callAll(this.root._beforecreate);
		callAll(this.root._oncreate);
		callAll(this.root._aftercreate);
		this.root._lock = false;
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		for (var key in newState) {
			if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(assign({}, oldState), newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);

		if (this._fragment) {
			this.fire("state", { changed: changed, current: this._state, previous: oldState });
			this._fragment.p(changed, this._state);
			this.fire("update", { changed: changed, current: this._state, previous: oldState });
		}
	}

	function callAll(fns) {
		while (fns && fns.length) fns.shift()();
	}

	function _mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	var proto = {
		destroy,
		get,
		fire,
		on,
		set,
		_recompute: noop,
		_set,
		_mount,
		_differs
	};

	/* src/components/Account.html generated by Svelte v2.9.1 */

	function id({ data }) {
		return data.id;
	}

	function name({ data }) {
		return data.name;
	}

	function balance({ data }) {
		return data.balance;
	}

	function currency({ data }) {
		return data.currencyCode;
	}

	function create_main_fragment(component, ctx) {
		var span, text, text_1, span_1, text_2, text_3, span_2, text_4_value = `${ctx.balance} ${ctx.currency}`, text_4;

		return {
			c() {
				span = createElement("span");
				text = createText(ctx.id);
				text_1 = createText("\r\n");
				span_1 = createElement("span");
				text_2 = createText(ctx.name);
				text_3 = createText("\r\n");
				span_2 = createElement("span");
				text_4 = createText(text_4_value);
			},

			m(target, anchor) {
				insertNode(span, target, anchor);
				appendNode(text, span);
				insertNode(text_1, target, anchor);
				insertNode(span_1, target, anchor);
				appendNode(text_2, span_1);
				insertNode(text_3, target, anchor);
				insertNode(span_2, target, anchor);
				appendNode(text_4, span_2);
			},

			p(changed, ctx) {
				if (changed.id) {
					text.data = ctx.id;
				}

				if (changed.name) {
					text_2.data = ctx.name;
				}

				if ((changed.balance || changed.currency) && text_4_value !== (text_4_value = `${ctx.balance} ${ctx.currency}`)) {
					text_4.data = text_4_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(span);
					detachNode(text_1);
					detachNode(span_1);
					detachNode(text_3);
					detachNode(span_2);
				}
			}
		};
	}

	function Account(options) {
		init(this, options);
		this._state = assign({}, options.data);
		this._recompute({ data: 1 }, this._state);
		this._intro = true;

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Account.prototype, proto);

	Account.prototype._recompute = function _recompute(changed, state) {
		if (changed.data) {
			if (this._differs(state.id, (state.id = id(state)))) changed.id = true;
			if (this._differs(state.name, (state.name = name(state)))) changed.name = true;
			if (this._differs(state.balance, (state.balance = balance(state)))) changed.balance = true;
			if (this._differs(state.currency, (state.currency = currency(state)))) changed.currency = true;
		}
	};

	/* src/components/ListItem.html generated by Svelte v2.9.1 */

	function create_main_fragment$1(component, ctx) {
		var span, text_value = ctx.JSON.stringify(ctx.data, "", 2), text;

		return {
			c() {
				span = createElement("span");
				text = createText(text_value);
			},

			m(target, anchor) {
				insertNode(span, target, anchor);
				appendNode(text, span);
			},

			p(changed, ctx) {
				if ((changed.JSON || changed.data) && text_value !== (text_value = ctx.JSON.stringify(ctx.data, "", 2))) {
					text.data = text_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	function ListItem(options) {
		init(this, options);
		this._state = assign({ JSON : JSON }, options.data);
		this._intro = true;

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ListItem.prototype, proto);

	/* src/components/List.html generated by Svelte v2.9.1 */

	function component({ type }) {
	    switch (type) {
	        case "accounts":
	            return Account;
	        default:
	            return ListItem;
	    }
	}

	function create_main_fragment$2(component_1, ctx) {
		var h3, text, text_1, ul, each_blocks_1 = [], each_lookup = blankObject();

		var each_value = ctx.list;

		const get_key = ctx => ctx.item.id;

		for (var i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_blocks_1[i] = each_lookup[key] = create_each_block(component_1, key, child_ctx);
		}

		return {
			c() {
				h3 = createElement("h3");
				text = createText(ctx.title);
				text_1 = createText("\r\n");
				ul = createElement("ul");

				for (i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].c();
			},

			m(target, anchor) {
				insertNode(h3, target, anchor);
				appendNode(text, h3);
				insertNode(text_1, target, anchor);
				insertNode(ul, target, anchor);

				for (i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].m(ul, null);
			},

			p(changed, ctx) {
				if (changed.title) {
					text.data = ctx.title;
				}

				const each_value = ctx.list;
				each_blocks_1 = updateKeyedEach(each_blocks_1, component_1, changed, get_key, 1, ctx, each_value, each_lookup, ul, destroyBlock, create_each_block, "m", null, get_each_context);
			},

			d(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text_1);
					detachNode(ul);
				}

				for (i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].d();
			}
		};
	}

	// (4:4) {#each list as item (item.id)}
	function create_each_block(component_1, key_1, ctx) {
		var li;

		var switch_value = ctx.component;

		function switch_props(ctx) {
			var switch_instance_initial_data = { data: ctx.item };
			return {
				root: component_1.root,
				store: component_1.store,
				data: switch_instance_initial_data
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props(ctx));
		}

		return {
			key: key_1,

			first: null,

			c() {
				li = createElement("li");
				if (switch_instance) switch_instance._fragment.c();
				this.first = li;
			},

			m(target, anchor) {
				insertNode(li, target, anchor);

				if (switch_instance) {
					switch_instance._mount(li, null);
				}
			},

			p(changed, ctx) {
				var switch_instance_changes = {};
				if (changed.list) switch_instance_changes.data = ctx.item;

				if (switch_value !== (switch_value = ctx.component)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));
						switch_instance._fragment.c();
						switch_instance._mount(li, null);
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}
			},

			d(detach) {
				if (detach) {
					detachNode(li);
				}

				if (switch_instance) switch_instance.destroy();
			}
		};
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		child_ctx.each_value = list;
		child_ctx.item_index = i;
		return child_ctx;
	}

	function List(options) {
		init(this, options);
		this._state = assign({}, options.data);
		this._recompute({ type: 1 }, this._state);
		this._intro = true;

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(List.prototype, proto);

	List.prototype._recompute = function _recompute(changed, state) {
		if (changed.type) {
			if (this._differs(state.component, (state.component = component(state)))) changed.component = true;
		}
	};

	/* src/components/AccountCreator.html generated by Svelte v2.9.1 */

	function create_main_fragment$3(component, ctx) {
		var input, text, input_1;

		return {
			c() {
				input = createElement("input");
				text = createText("\r\n");
				input_1 = createElement("input");
				setAttribute(input, "type", "text");
				input.name = "name";
				input.placeholder = "Account name";
				setAttribute(input_1, "type", "text");
				input_1.maxLength = "3";
				input_1.name = "currencyCode";
				input_1.placeholder = "Currency code";
			},

			m(target, anchor) {
				insertNode(input, target, anchor);
				insertNode(text, target, anchor);
				insertNode(input_1, target, anchor);
			},

			p: noop,

			d(detach) {
				if (detach) {
					detachNode(input);
					detachNode(text);
					detachNode(input_1);
				}
			}
		};
	}

	function AccountCreator(options) {
		init(this, options);
		this._state = assign({}, options.data);
		this._intro = true;

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(AccountCreator.prototype, proto);

	/* src/components/Creator.html generated by Svelte v2.9.1 */

	const options = [
	    {text:"Account",value:"account"},
	    {text:"Category",value:"category"},
	    {text:"User",value:"user"},
	    {text:"Transaction",value:"transaction"},
	];
	const getAccountComponent = type => {
	    switch (type) {
	        case "account":
	            return AccountCreator;
	    
	        default:
	            return null;
	    }
	};
	function options_1({ selected }) {
		return options.map(o => ({...o, selected: o.value == selected}));
	}

	function data() {
	    const defaultType = "account";
	    return {
	        selected: defaultType,
	        component: getAccountComponent(defaultType),
	    }
	}
	var methods = {
	    selectChanged(e) {
	        this.set({
	            selected: e.target.value,
	            component: getAccountComponent(e.target.value),
	        });
	    },
	    send(event) {
	        event.preventDefault();
	        this.fire('submit', this.data);
	        console.log(this.options);
	    }
	};

	function create_main_fragment$4(component, ctx) {
		var div, select, text_1, form, text_2, text_3, br, text_4, input;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
		}

		function change_handler(event) {
			component.selectChanged(event);
		}

		var switch_value = ctx.component;

		function switch_props(ctx) {
			var switch_instance_initial_data = { data: ctx.item };
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props(ctx));
		}

		function select_block_type(ctx) {
			if (ctx.selected == "account") return create_if_block;
			return create_if_block_1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		function submit_handler(event) {
			component.send(event);
		}

		return {
			c() {
				div = createElement("div");
				select = createElement("select");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text_1 = createText("\r\n");
				form = createElement("form");
				if (switch_instance) switch_instance._fragment.c();
				text_2 = createText("\r\n    ");
				if_block.c();
				text_3 = createText("\r\n    ");
				br = createElement("br");
				text_4 = createText("\r\n    ");
				input = createElement("input");
				addListener(select, "change", change_handler);
				setAttribute(input, "type", "submit");
				input.value = "Create";
				addListener(form, "submit", submit_handler);
			},

			m(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(select, div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				insertNode(text_1, target, anchor);
				insertNode(form, target, anchor);

				if (switch_instance) {
					switch_instance._mount(form, null);
				}

				appendNode(text_2, form);
				if_block.m(form, null);
				appendNode(text_3, form);
				appendNode(br, form);
				appendNode(text_4, form);
				appendNode(input, form);
			},

			p(changed, ctx) {
				if (changed.options || changed.selected) {
					each_value = ctx.options;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				var switch_instance_changes = {};
				if (changed.item) switch_instance_changes.data = ctx.item;

				if (switch_value !== (switch_value = ctx.component)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));
						switch_instance._fragment.c();
						switch_instance._mount(form, text_2);
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(form, text_3);
				}
			},

			d(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);

				removeListener(select, "change", change_handler);
				if (detach) {
					detachNode(text_1);
					detachNode(form);
				}

				if (switch_instance) switch_instance.destroy();
				if_block.d();
				removeListener(form, "submit", submit_handler);
			}
		};
	}

	// (3:4) {#each options as op}
	function create_each_block$1(component, ctx) {
		var option, text_value = ctx.op.text, text, option_value_value, option_selected_value;

		return {
			c() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.op.value;
				option.value = option.__value;
				option.selected = option_selected_value = ctx.op.value === ctx.selected;
			},

			m(target, anchor) {
				insertNode(option, target, anchor);
				appendNode(text, option);
			},

			p(changed, ctx) {
				if ((changed.options) && text_value !== (text_value = ctx.op.text)) {
					text.data = text_value;
				}

				if ((changed.options) && option_value_value !== (option_value_value = ctx.op.value)) {
					option.__value = option_value_value;
				}

				option.value = option.__value;
				if ((changed.options || changed.selected) && option_selected_value !== (option_selected_value = ctx.op.value === ctx.selected)) {
					option.selected = option_selected_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(option);
				}
			}
		};
	}

	// (10:4) {#if selected == "account"}
	function create_if_block(component, ctx) {
		var input, text, input_1;

		return {
			c() {
				input = createElement("input");
				text = createText("\r\n        ");
				input_1 = createElement("input");
				setAttribute(input, "type", "text");
				input.name = "name";
				input.placeholder = "Account name";
				setAttribute(input_1, "type", "text");
				input_1.maxLength = "3";
				input_1.name = "currencyCode";
				input_1.placeholder = "Currency code";
			},

			m(target, anchor) {
				insertNode(input, target, anchor);
				insertNode(text, target, anchor);
				insertNode(input_1, target, anchor);
			},

			p: noop,

			d(detach) {
				if (detach) {
					detachNode(input);
					detachNode(text);
					detachNode(input_1);
				}
			}
		};
	}

	// (13:4) {:else}
	function create_if_block_1(component, ctx) {
		var label, text;

		return {
			c() {
				label = createElement("label");
				text = createText(ctx.selected);
			},

			m(target, anchor) {
				insertNode(label, target, anchor);
				appendNode(text, label);
			},

			p(changed, ctx) {
				if (changed.selected) {
					text.data = ctx.selected;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(label);
				}
			}
		};
	}

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.op = list[i];
		child_ctx.each_value = list;
		child_ctx.op_index = i;
		return child_ctx;
	}

	function Creator(options) {
		init(this, options);
		this._state = assign(data(), options.data);
		this._recompute({ selected: 1 }, this._state);
		this._intro = true;

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$4(this, this._state);

		if (options.target) {
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(Creator.prototype, proto);
	assign(Creator.prototype, methods);

	Creator.prototype._recompute = function _recompute(changed, state) {
		if (changed.selected) {
			if (this._differs(state.options, (state.options = options_1(state)))) changed.options = true;
		}
	};

	/* src/components/App.html generated by Svelte v2.9.1 */

	var methods$1 = {
	    create() {
	        console.log('aaaa');
	    }
	};

	function create_main_fragment$5(component, ctx) {
		var text, text_1, text_2, text_3, if_block_3_anchor;

		var creator_initial_data = { selected: "category" };
		var creator = new Creator({
			root: component.root,
			store: component.store,
			data: creator_initial_data
		});

		creator.on("submit", function(event) {
			component.create();
		});

		var if_block = (ctx.accounts) && create_if_block$1(component, ctx);

		var if_block_1 = (ctx.users) && create_if_block_1$1(component, ctx);

		var if_block_2 = (ctx.categories) && create_if_block_2(component, ctx);

		var if_block_3 = (ctx.transactions) && create_if_block_3(component, ctx);

		return {
			c() {
				creator._fragment.c();
				text = createText("\r\n");
				if (if_block) if_block.c();
				text_1 = createText("\r\n");
				if (if_block_1) if_block_1.c();
				text_2 = createText("\r\n");
				if (if_block_2) if_block_2.c();
				text_3 = createText("\r\n");
				if (if_block_3) if_block_3.c();
				if_block_3_anchor = createComment();
			},

			m(target, anchor) {
				creator._mount(target, anchor);
				insertNode(text, target, anchor);
				if (if_block) if_block.m(target, anchor);
				insertNode(text_1, target, anchor);
				if (if_block_1) if_block_1.m(target, anchor);
				insertNode(text_2, target, anchor);
				if (if_block_2) if_block_2.m(target, anchor);
				insertNode(text_3, target, anchor);
				if (if_block_3) if_block_3.m(target, anchor);
				insertNode(if_block_3_anchor, target, anchor);
			},

			p(changed, ctx) {
				if (ctx.accounts) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$1(component, ctx);
						if_block.c();
						if_block.m(text_1.parentNode, text_1);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (ctx.users) {
					if (if_block_1) {
						if_block_1.p(changed, ctx);
					} else {
						if_block_1 = create_if_block_1$1(component, ctx);
						if_block_1.c();
						if_block_1.m(text_2.parentNode, text_2);
					}
				} else if (if_block_1) {
					if_block_1.d(1);
					if_block_1 = null;
				}

				if (ctx.categories) {
					if (if_block_2) {
						if_block_2.p(changed, ctx);
					} else {
						if_block_2 = create_if_block_2(component, ctx);
						if_block_2.c();
						if_block_2.m(text_3.parentNode, text_3);
					}
				} else if (if_block_2) {
					if_block_2.d(1);
					if_block_2 = null;
				}

				if (ctx.transactions) {
					if (if_block_3) {
						if_block_3.p(changed, ctx);
					} else {
						if_block_3 = create_if_block_3(component, ctx);
						if_block_3.c();
						if_block_3.m(if_block_3_anchor.parentNode, if_block_3_anchor);
					}
				} else if (if_block_3) {
					if_block_3.d(1);
					if_block_3 = null;
				}
			},

			d(detach) {
				creator.destroy(detach);
				if (detach) {
					detachNode(text);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(text_1);
				}

				if (if_block_1) if_block_1.d(detach);
				if (detach) {
					detachNode(text_2);
				}

				if (if_block_2) if_block_2.d(detach);
				if (detach) {
					detachNode(text_3);
				}

				if (if_block_3) if_block_3.d(detach);
				if (detach) {
					detachNode(if_block_3_anchor);
				}
			}
		};
	}

	// (2:0) {#if accounts}
	function create_if_block$1(component, ctx) {

		var list_initial_data = {
		 	type: "accounts",
		 	list: ctx.accounts,
		 	title: "Accounts"
		 };
		var list = new List({
			root: component.root,
			store: component.store,
			data: list_initial_data
		});

		return {
			c() {
				list._fragment.c();
			},

			m(target, anchor) {
				list._mount(target, anchor);
			},

			p(changed, ctx) {
				var list_changes = {};
				if (changed.accounts) list_changes.list = ctx.accounts;
				list._set(list_changes);
			},

			d(detach) {
				list.destroy(detach);
			}
		};
	}

	// (5:0) {#if users}
	function create_if_block_1$1(component, ctx) {

		var list_initial_data = {
		 	type: "users",
		 	list: ctx.users,
		 	title: "Users"
		 };
		var list = new List({
			root: component.root,
			store: component.store,
			data: list_initial_data
		});

		return {
			c() {
				list._fragment.c();
			},

			m(target, anchor) {
				list._mount(target, anchor);
			},

			p(changed, ctx) {
				var list_changes = {};
				if (changed.users) list_changes.list = ctx.users;
				list._set(list_changes);
			},

			d(detach) {
				list.destroy(detach);
			}
		};
	}

	// (8:0) {#if categories}
	function create_if_block_2(component, ctx) {

		var list_initial_data = {
		 	type: "categories",
		 	list: ctx.categories,
		 	title: "Categories"
		 };
		var list = new List({
			root: component.root,
			store: component.store,
			data: list_initial_data
		});

		return {
			c() {
				list._fragment.c();
			},

			m(target, anchor) {
				list._mount(target, anchor);
			},

			p(changed, ctx) {
				var list_changes = {};
				if (changed.categories) list_changes.list = ctx.categories;
				list._set(list_changes);
			},

			d(detach) {
				list.destroy(detach);
			}
		};
	}

	// (11:0) {#if transactions}
	function create_if_block_3(component, ctx) {

		var list_initial_data = {
		 	type: "transactions",
		 	list: ctx.transactions,
		 	title: "Transactions"
		 };
		var list = new List({
			root: component.root,
			store: component.store,
			data: list_initial_data
		});

		return {
			c() {
				list._fragment.c();
			},

			m(target, anchor) {
				list._mount(target, anchor);
			},

			p(changed, ctx) {
				var list_changes = {};
				if (changed.transactions) list_changes.list = ctx.transactions;
				list._set(list_changes);
			},

			d(detach) {
				list.destroy(detach);
			}
		};
	}

	function App(options) {
		init(this, options);
		this._state = assign({}, options.data);
		this._intro = true;

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(App.prototype, proto);
	assign(App.prototype, methods$1);

	var AppComponent = new App({
	    target: document.getElementById('root'),
	    data: null
	});

	var _this = undefined;

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var checkResult = function checkResult(result) {
	    if (result.success) return result.data;
	    throw result.error;
	};

	var mapArrayToObject = function mapArrayToObject(fieldNames, array) {
	    return array.reduce(function (acc, v, i) {
	        return Object.assign(acc, _defineProperty({}, fieldNames[i], v));
	    }, {});
	};

	var log = function log(data) {
	    if (Array.isArray(data)) {
	        return data.map(function (v) {
	            console.log(v);
	            return v;
	        });
	    }
	    console.log(data);
	    return data;
	};

	var prepareData = function prepareData(_ref) {
	    var users = _ref.users,
	        accounts = _ref.accounts,
	        categories = _ref.categories,
	        transactions = _ref.transactions;

	    var ac = accounts.reduce(function (acc, a) {
	        return Object.assign(acc, _defineProperty({}, a.id, 0));
	    }, {});
	    var t = transactions.reduce(function (acc, tr) {
	        acc[tr.accountId] = acc[tr.accountId] - tr.amount;
	        return acc;
	    }, ac);

	    return {
	        users: users,
	        accounts: accounts.map(function (a) {
	            return Object.assign({}, a, { balance: t[a.id] });
	        }),
	        categories: categories,
	        transactions: transactions
	    };
	};

	var initApp = function initApp(appComponent, data) {
	    appComponent.set(data);
	};

	var init$1 = function init() {
	    return Promise
	    // Get all the data from API
	    .all([fetch('http://localhost:3000/users'), fetch('http://localhost:3000/accounts'), fetch('http://localhost:3000/categories'), fetch('http://localhost:3000/transactions')])
	    // Extract JSON data from response body
	    .then(function (results) {
	        return Promise.all(results.map(function (v) {
	            return v.json();
	        }));
	    })
	    // Check if all of responses are succesful
	    .then(function (results) {
	        return results.map(checkResult);
	    })
	    // Map array to object
	    .then(mapArrayToObject.bind(_this, ["users", "accounts", "categories", "transactions"]))
	    // Prepare data
	    .then(prepareData)
	    // Log result
	    .then(log)
	    // Update component data
	    .then(initApp.bind(_this, AppComponent))
	    // If error throw to console
	    .catch(console.error);
	};

	/* eslint-disable no-unused-vars */

	init$1();

}());
