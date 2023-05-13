/**
 * 
 */

(function (factory) {
    /* global define */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(window.jQuery);
    }
}(function ($) {
	// [get custom shortcut for editorMethod]-----------------------------------
	const representShortcut = function(editorMethod) {
	    let keyMap = (navigator.appVersion.indexOf('Mac') > -1)?
		        	   $.summernote.options.keyMap.mac 
		        	   : $.summernote.options.keyMap.pc;
	    
	    const inverted = {};
	    for (const key in keyMap) {
	        if (keyMap.hasOwnProperty(key)) {
	          inverted[keyMap[key]] = key;
	        }
	      }
	    let shortcut = inverted[editorMethod];
	    if (!$.summernote.options.shortcuts || !shortcut) {
	      return '';
	    }

	    if (navigator.appVersion.indexOf('Mac') > -1) {
	      shortcut = shortcut.replace('CMD', '⌘').replace('SHIFT', '⇧');
	    }

	    shortcut = shortcut.replace('BACKSLASH', '\\').replace('SLASH', '/').replace('LEFTBRACKET', '[').replace('RIGHTBRACKET', ']');
	    return ' (' + shortcut + ')';
	  }
	//----------------------------------[/ get custom shortcut for editorMethod]
    
	$.extend($.summernote.options, {
		lang: 'ko-KR',
		placeholder: '사진이나 영상 등을 첨부하실 수 있습니다.',
		focus: true,
		followingToolbar: (navigator.userAgent.indexOf("Mobi") > -1),
		tabDisable: true,
		disableDragAndDrop: true,
		codeviewFilter: true,
	    codeviewFilterRegex: /<\/*(?:applet|b(?:ase|utton|gsound|link)|embed|frame(?:set)?|ilayer|l(?:ayer|ink)|meta|object|s(?:cript|tyle)|t(?:itle|extarea)|xml)[^>]*?>/gi,
		shortcuts : (navigator.userAgent.indexOf("iPhone") == -1),
		fontSizes: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '20', '24'],
		styleTags: ['p','h1','h2','h3','h4','h5','h6',{title: '인용구',tag:'blockquote',className:'blockquote',value:'blockquote'}],
		paragraph: [],
		toolbar: [
			  ['style'	, ['style']],
			  ['font'	, ['bold','underline','strikethrough','superscript','subscript']],
			  ['font2'	, ['fontsize','forecolor']],
			  ['para'	, ['paragraph2','ul','ol']],
			  ['insert'	, ['table','link','picture','video']],
			  ['view'	, ['fullscreen','codeview']],
			  ['hr2'	, ['hr2']]
		]
	});
	
	/**
	 * Added 'resizeFourfifth' popover button to resize image into 80%
	 */
	$.extend($.summernote.options.popover, {
		image: [
			["resize", ["resizeFull", "imageResize80", "resizeHalf", "resizeQuarter", "resizeNone"]],
			["float", ["floatLeft", "floatRight", "floatNone"]],
			["remove", ["removeMedia"]]
		]
	})
	
    // Extends plugins  - plugin is external module for customizing.
    $.extend($.summernote.plugins, {
    	/**
    	 * horizontal rule for smalltalk
    	 * @param {Object} context - context object has status of editor.
    	 */
    	'hr2': function (context) {
    		context.memo('button.hr2', function(){
        		return $.summernote.ui.button({
        			contents: '<i class="note-icon-minus" style="color:red"></i>',
        			tooltip: context.options.langInfo.hr.insert + representShortcut('insertHorizontalRule'),
        	        click: context.createInvokeHandler('editor.insertHorizontalRule')
        		}).render();
        	})
    	},
        /**
        * for pasting clipboards
        * @param {Object} context - context object has status of editor.
        */
        'pasteText': function (context) {
            var self = this;

            // This events will be attached when editor is initialized.
            this.events = {
                // This will be called after modules are initialized.<br>
            	// paste HTML that of each lines wrapped with <p></p>
                'summernote.paste': function (we,e) {
					e.preventDefault();
					
					var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData)
										.getData('text');
					var textArr = bufferText.split(/\r?\n/);
					var contextHTML = "";
					for(var i = 0; i < textArr.length; i++){
						var text = textArr[i];
						if(text.trim().length > 0){
							var tempPara = $("<p></p>").text(text)[0];
							contextHTML += tempPara.outerHTML;
						}else{
							contextHTML += "<p><br></p>";
						}
					}
					contextHTML.replace(/\t/gi, "&nbsp;".repeat(4))
		            var sel = window.getSelection();
		            if(sel.rangeCount){
		            	var range = sel.getRangeAt(0);
	            		range.deleteContents();
	            		try{
	            			var tempContainer = $("<div></div>").html(contextHTML)[0];
	            			context.invoke("editor.insertNode", tempContainer);
	            			tempContainer.outerHTML = tempContainer.innerHTML;
	            		}catch(e){
	            			console.log(e)
	            		}
	            	}
		        }
            };
        },
        /**
         * for image popover buttons
         */
        'customResizeImage': function(context){
        	context.memo('button.imageResize80', function(){
        		return $.summernote.ui.button({
        			contents: '<span class="note-fontsize-10">80%</span>',
        	        tooltip: '80% 크기로 변경',
        	        click: context.createInvokeHandler('editor.resize', '0.8')
        		}).render();
        	})
        },
        /**
         * for paragraph buttons order
         */
        'customParagraph': function(context){
        	var _this = $.summernote;
        	
        	context.memo('button.paragraph2', function(){
        		var btns = _this.ui.buttonGroup([
        			_this.ui.button({
        				className: 'dropdown-toggle',
        				contents: _this.ui.dropdownButtonContents(_this.ui.icon(_this.options.icons.alignLeft), _this.options),
        				tooltip: _this.lang['ko-KR'].paragraph.paragraph,
        				data: {
        					toggle: 'dropdown'
        				}
        			}),
        			_this.ui.dropdown([
        				_this.ui.buttonGroup({
        					className: 'note-align',
        					children: [_this.ui.button({
        			              contents: _this.ui.icon(_this.options.icons.alignCenter),
        			              tooltip: _this.lang['ko-KR'].paragraph.center + representShortcut('justifyCenter'),
        			              click: context.createInvokeHandler('editor.justifyCenter')
        			          }), _this.ui.button({
        			              contents: _this.ui.icon(_this.options.icons.alignLeft),
        			              tooltip: _this.lang['ko-KR'].paragraph.left + representShortcut('justifyLeft'),
        			              click: context.createInvokeHandler('editor.justifyLeft')
        			          }), _this.ui.button({
        			              contents: _this.ui.icon(_this.options.icons.alignRight),
        			              tooltip: _this.lang['ko-KR'].paragraph.right + representShortcut('justifyRight'),
        			              click: context.createInvokeHandler('editor.justifyRight')
        			          }), _this.ui.button({
        			              contents: _this.ui.icon(_this.options.icons.alignJustify),
        			              tooltip: _this.lang['ko-KR'].paragraph.justify + representShortcut('justifyFull'),
        			              click: context.createInvokeHandler('editor.justifyFull')
        			          })]
        				}),
        				_this.ui.buttonGroup({
        					className: 'note-list',
        					children: [_this.ui.button({
        			              contents: _this.ui.icon(_this.options.icons.outdent),
        			              tooltip: _this.lang['ko-KR'].paragraph.outdent + representShortcut('outdent'),
        			              click: context.createInvokeHandler('editor.outdent')
        			          }), _this.ui.button({
        			              contents: _this.ui.icon(_this.options.icons.indent),
        			              tooltip: _this.lang['ko-KR'].paragraph.indent + representShortcut('indent'),
        			              click: context.createInvokeHandler('editor.indent')
        			          })]
        				})
    				])
				]);
        		return btns.render();
        	})
        }
    });
}));