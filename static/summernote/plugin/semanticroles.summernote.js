/**
 * 주어, 동사, 목적어, 수식을 표시하는 툴바버튼 추가
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
	$.extend($.summernote.plugins, {
		'semanticRoles': function(context){
			var _self = this,
				tempMark = 'font[face="temp"]',
				//스몰톡: empVerb,empAdv,empMod
				// 그래머북,왓슨: subject-role,object-role,actione-role
				roles = '.subject-role,.object-role,.action-role,[class^="empMod"],.empAdv,.empVerb', // roles Regex
				currentRole,
				$content = context.layoutInfo.editable,
				$toolbar = context.layoutInfo.toolbar;
			
			// <span class='subject-role'> 표시
			context.memo('button.subjectrole', function(){
				var button = $.summernote.ui.button({
					contents: '<i class="fa fa-pen" style="color: #ffc107"/> 주어부',
					tooltip: "주어부 표시",
					className: "hintPen subject-role-btn",
					click: function(e){
						currentRole = "subject-role";
						_self.clickHintBtn(e);
					}
				});
				return button.render();
			});
			// <span class='action-role'> 표시
			context.memo('button.actionrole', function(){
				var button = $.summernote.ui.button({
					contents: '<i class="fa fa-pen" style="color: #BA2828"/> 동사부',
					tooltip: '동사부 표시',
					className: 'hintPen action-role-btn',
					click: function(e){
						currentRole = "action-role";
						_self.clickHintBtn(e);
					}
				});
				return button.render();
			});
			// <span class='object-role'> 표시
			context.memo('button.objectrole', function(){
				var button = $.summernote.ui.button({
					contents: '<i class="fa fa-pen" style="color: #46da00"/> 목적어부',
					tooltip: '목적어부 표시',
					className: 'hintPen object-role-btn',
					click: function(e){
						currentRole = "object-role";
						_self.clickHintBtn(e);
					}
				});
				return button.render();
			});
			// <span class='empMod'> 표시1
			context.memo('button.modrole', function(){
				var button = $.summernote.ui.button({
					contents: '<i class="fa fa-pen" style="color: #3676FC"/> 수식어',
					tooltip: '수식 표시',
					className: 'hintPen empMod-btn',
					click: function(e){
						currentRole = "empMod";
						_self.clickHintBtn(e);
					}
				});
				return button.render();
			});
			// <span class='empVerb'> 표시
			context.memo('button.empVerb', function(){
				var button = $.summernote.ui.button({
					contents: '<i class="fa fa-pen" style="color: #BA2828"></i> 동사',
					tooltip: '메인 동사 표시',
					className: 'hintPen btn btn-verb',
					click: function(e){
						currentRole = "empVerb";
						_self.clickHintBtn(e);
					}
				});
				return button.render();
			});			
			// <span class='empMod'> 표시2(왼쪽)
			context.memo('button.empMod-f', function(){
				var button = $.summernote.ui.button({
					contents: '<i class="fa fa-arrow-left" style="color: #F9A825"/> 왼쪽 수식',
					tooltip: '수식 표시(왼쪽)',
					className: 'hintPen btn btn-mod',
					click: function(e){
						currentRole = "empMod-f";
						_self.clickHintBtn(e);
					}
				});
				return button.render();
			});
			// <span class='empMod'> 표시2(오른쪽)
			context.memo('button.empMod-b', function(){
				var button = $.summernote.ui.button({
					contents: '<i class="fa fa-arrow-right" style="color: #F9A825"/> 오른쪽 수식',
					tooltip: '수식 표시(오른쪽)',
					className: 'hintPen btn btn-mod',
					click: function(e){
						currentRole = "empMod-b";
						_self.clickHintBtn(e);
					}
				});
				return button.render();
			});
			// <span class='empAdv'> 표시
			context.memo('button.empAdv', function(){
				var button = $.summernote.ui.button({
					contents: '<i class="fa fa-pen" style="color: #609063"></i> 비수식어구(절)',
					tooltip: '비수식 표시',
					className: 'hintPen btn btn-adv',
					click: function(e){
						currentRole = "empAdv";
						_self.clickHintBtn(e);
					}
				});
				return button.render();
			});
			// 힌트 표시 제거
			context.memo('button.hinteraser', function(){
				var button = $.summernote.ui.button({
					contents: '<i class="fa fa-eraser" style="color: #6c98b3"/> 힌트 제거',
					tooltip: '힌트 표시 제거',
					className: 'hintPen hinteraser-btn',
					click: function(e){
						$toolbar.find(".hintPen").not(".hinteraser-btn").removeClass("active");
						$(this).toggleClass("active");
						$content.toggleClass("erasable");
						var sel = window.getSelection();
						if(!sel.isCollapsed) sel.collapseToStart();
						$content.off("mouseup", _self.applyHintPassive);
					}
				});
				return button.render();
			});
			// 힌트 버튼 클릭
			this.clickHintBtn = function(e){
				// 힌트지우개와 나머지 힌트버튼 비활성화
				$toolbar.find(".hintPen").not(e.target).removeClass("active");
				$content.removeClass("erasable");
				if(window.getSelection().isCollapsed){
					if($(e.target).toggleClass("active").is(".active")){
						$content.off("mouseup", _self.applyHintPassive);
						$content.on("mouseup", _self.applyHintPassive);
					}else{
						$content.off("mouseup", _self.applyHintPassive);
					}
				}else{
					_self.applyHint();
				}
			}
			
			// 선택돼있는 텍스트에 태그 적용
			this.applyHint = function(){
				// 임시 식별용 폰트태그 적용
				document.execCommand('fontName', false, 'temp');	
				var $currentSelection = $(tempMark);
				var overAppliedNum = 0;
				var	$target = $content.find(roles + "," + tempMark);
				while($target.length > 0){
					$target = $target.find(roles + "," + tempMark);
					overAppliedNum += 1;
				}
				if(overAppliedNum > 2){		// 힌트 중복 적용은 2단계까지만 가능
					$("#alertModal").modal("show");
				}else{
					$currentSelection.wrap('<span class="' + currentRole + '"/>');
				}
				// 임시 식별용 폰트태그 제거
				$currentSelection.contents().unwrap(tempMark);	
				window.getSelection().removeAllRanges();
				_self.mergeHints();
			}
			
			// 텍스트를 선택하면 태그 적용
			this.applyHintPassive = function(){
				if(!window.getSelection().isCollapsed){
					_self.applyHint(currentRole);
				}
			}
			
			// 중복으로 연속되는 태그 합치기
			this.mergeHints = function(){
				var spans = [];
				spans = Array.from($content[0].childNodes).filter(function(node,i){
					return i > 0 && node.nodeName == 'SPAN' && node.previousSibling.nodeName == 'SPAN';
				})
				function findHintAtFirst(targetNode){
					if(targetNode == null) return null;
					if(targetNode.childNodes.length == 1 && targetNode.firstChild.nodeName == '#text'){
						return (targetNode.nodeName == 'SPAN' && $(targetNode).is(roles))? targetNode : null;
					}else{
						return findHintAtFirst(targetNode.firstChild);
					}
				}
				function findHintAtLast(targetNode){
					if(targetNode == null) return null;
					if(targetNode.childNodes.length == 1 && targetNode.lastChild.nodeName == '#text'){
						return (targetNode.nodeName == 'SPAN' && $(targetNode).is(roles))? targetNode : null;
					}else{
						return findHintAtLast(targetNode.lastChild);
					}
				}
				spans.forEach(function(elt, i, array) {
					var prevHint = findHintAtLast(elt.previousSibling);
					var nextHint = findHintAtFirst(elt);
					if(prevHint != null && nextHint != null
							&& prevHint.className == nextHint.className){
						nextHint.childNodes.forEach(function(node, i2) {
							prevHint.appendChild(node);
						});
						nextHint.remove();
					}
				});
				var $continuousHints = $content.find(roles)
								.filter(function(i){
									return $(this).prev($(this).className).length > 0;
								});
				for(var i=0;i<$continuousHints.length;i++){
					var candidate = $continuousHints.get(i);
					var previous = candidate.previousSibling;
					if(previous.className == candidate.className){
						previous.appendChild(candidate);
						$(candidate).contents().unwrap();
					}
				}
			}
			
			// 힌트 태그 삭제
			$content.on("click", roles, function(e){
				if($content.is(".erasable")){
					$(this).contents().unwrap(roles);
					e.stopPropagation();
				}
			}).on("mouseover", roles, function(e){
				if($content.is(".erasable")){
					$(this).addClass("erasingTarget");
					e.stopPropagation();
				}
			}).on("mouseout", roles, function(e){
				if($content.is(".erasable")){
					$(this).removeClass("erasingTarget");
					e.stopPropagation();
				}
			})
		}
	});
}));