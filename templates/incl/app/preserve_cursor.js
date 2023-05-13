/**
 * ASCII 범위를 벗어나는 유니코드 문자를 ASCII 문자로 대체(replaceQuotes(common.js)) 후 커서 위치 복귀.
 * 복합입력 글자(한글)에선 오작동하므로 적용에서 제외.
 * @author 이광민
 */
function quoteReplaceInDiv(event) {
	var inputData = event.originalEvent.data || '';
	if(inputData.match(/[\u005B-\u0060|\u007B-\u007F|\u1100-\u11FF|\u3130-\u318F|\uAC00-\uD7AF]/gi) == null
			&& typeof saveCaretPosition == 'function'){
		var target = event.target;
		var restore = saveCaretPosition(event.target);
		var inputText = $(target).html();
		$(target).html(replaceQuotes(inputText));
		restore();
	}
};
function saveCaretPosition(context){
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    range.setStart(  context, 0 );
    var len = range.toString().length;

    return function restore(){
        var pos = getTextNodeAtPosition(context, len);
        selection.removeAllRanges();
        var range = new Range();
        range.setStart(pos.node ,pos.position);
        selection.addRange(range);

    }
}

function getTextNodeAtPosition(root, index){
    const NODE_TYPE = NodeFilter.SHOW_TEXT;
    var treeWalker = document.createTreeWalker(root, NODE_TYPE, function next(elem) {
        if(index > elem.textContent.length){
            index -= elem.textContent.length;
            return NodeFilter.FILTER_REJECT
        }
        return NodeFilter.FILTER_ACCEPT;
    });
    var c = treeWalker.nextNode();
    return {
        node: c? c: root,
        position: index
    };
}

