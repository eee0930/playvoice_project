/** 문장의 강조처리 된 htmlString을 반환.
 * text: 대상 문장
 * emLoc: 강조위치(배열형태의 문자열)
 * effectTag: 강조효과 태그(시작태그와 종료태그 사이에 공란 없어야 함)
 */
window.emphasizeText = function(text, emLoc, effectTag) {
	var emLocArrays = JSON.parse(emLoc); // 배열로 파싱. 파싱결과는 2차배열.[[시작위치,끝위치],[시작위치,끝위치],...]
	var beforeEffect = 0; //강조가 적용되기 전 위치
	var resultText = ""; //강조적용 결과 

	if (emLocArrays == null || emLocArrays.length == 0) {
		/* 강조 위치가 없을 경우 입력받은 문장을 그대로 반환 */
		return text;
	} else {
		/* 강조위치의 갯수만큼 적용 */
		for (var k = 0; k < emLocArrays.length; k++) {
			var effectStart = emLocArrays[k][0]; // 강조 시작 위치
			var effectEnd = emLocArrays[k][1]; // 강조 끝 위치
			if(effectStart <= effectEnd && effectEnd <= text.length){
				/* String.substring(start,end)은 start 위치는 포함, end 위치는 미포함 */
				var pureText = text.substring(beforeEffect, effectStart); // 강조 시작위치 전 부분 -> 강조 미적용 문자열
				var effectTarget = text.substring(effectStart, effectEnd + 1); // 강조 시작위치~끝위치 -> 강조 적용 문자열
	
				/* 강조효과태그의 시작태그와 종료태그 사이에 강조 적용 문자열을 끼운다 */
				var effectTagSplit = effectTag.split('><');
				var taggedText = effectTagSplit[0] + '>' + effectTarget + '<'
						+ effectTagSplit[1];
	
				/* 모든 강조가 적용되는 문장은 강조가 미적용된 부분(pureText)과 강조가 적용된 부분(effectedText)의 조합으로 이루어진다.
				강조가 미적용된 부분부터 시작할 수 있어 pureText를 앞에 위치시킨다. */
				resultText += pureText + taggedText;
	
				beforeEffect = effectEnd + 1; // 다음 강조 미적용 문자열 시작 위치 계산
	
				if (k == emLocArrays.length - 1 && beforeEffect < text.length) {
					//강조 미적용 문자열로 문장이 끝날 시 마지막 beforeEffect 위치부터 끝까지 그대로 이어붙인다.
					resultText += text.substring(beforeEffect);
				}
			}
		}
		return resultText;
	}
};

/** 요소 내에 강조 문자열의 위치를 파악하여 배열 형태의 문자열로 반환.
 * targetElement의 내용도 변경되니 주의.
 * targetElement의 내용 자체가 입력 내용이라면 calcEmLoc부터 실행 후 서버전달 인자로 사용할 것.
 * targetElement: 강조 적용/미적용된 문자열을 지니는 요소(div,p,span 등.)
 */
window.calcEmLoc = function(targetElement) {
	targetElement.innerHTML = targetElement.innerHTML;
	//	textPosition: 텍스트의 커서위치. 0부터 시작
	var textPosition = 0;
	//	강조위치 배열. 각 요소도 배열 형태
	var emLocArray = [];
	//	※강조부분,비강조부분이 자식노드들.
	for(var j = 0; j < targetElement.childNodes.length; j++) {
		var node = targetElement.childNodes.item(j);
		if(j == 0){
			// 제일 첫 노드가 &nbsp;나 띄어쓰기(' ')로 시작하면 앞쪽 공백 제거
			while(node.textContent.indexOf(' '/*&nbsp;*/) == 0 
					|| node.textContent.indexOf(' ') == 0){
				node.textContent = node.textContent.slice(1);
			}
		}else if(j + 1 == targetElement.childNodes.length){
			// 제일 마지막 노트가 &nbsp;나 띄어쓰기(' ')로 끝나면 뒷쪽 공백 제거
			while(node.textContent.length > 0 && (node.textContent.lastIndexOf(' '/*&nbsp;*/) == node.textContent.length - 1
					|| node.textContent.lastIndexOf(' ') == node.textContent.length - 1)){
				node.textContent = node.textContent.slice(0, -1);
			}
		}
		//	강조가 적용된 문자열의 시작위치와 끝위치를 저장 (강조가 적용된 문자열은 태그로 감싸졌다고 가정. 태그들은 nodeType 1)
		if(node.nodeType == 1 && node.textContent.trim().length > 0) {
			//	emLoc: [시작위치,끝위치]
			var emLoc = [];
			
			var text = node.textContent.trim();
			
			//	강조 시작위치
			emLoc.push(textPosition + node.textContent.indexOf(text));
			//	강조 끝위치
			emLoc.push(textPosition + node.textContent.indexOf(text) + text.length - 1);

			//강조위치 배열에 추가
			emLocArray.push(emLoc);
		}
		//커서위치 
		textPosition += node.textContent.length;
	}
	
	return JSON.stringify(emLocArray);
}

