/* 동적 post 전송 */
/*
* path : 전송 URL
* params : 전송 데이터 {'q':'a','s':'b','c':'d'…}으로 묶어서 배열 입력
* method : 전송 방식(생략가능)
*/
window.submitPost = function(path, params, method) {
	method = method || "post";
	var form = document.createElement("form");
	form.setAttribute("method", method);
	form.setAttribute("action", path);
	
	for(var key in params) {
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		hiddenField.setAttribute("value", params[key]);
		form.appendChild(hiddenField);
	}
	document.body.appendChild(form);
	form.submit();
}




/* 폼: 생성 */ 
window.createForm = function(formName,action, method,target) { 
	var f = document.createElement("form"); 
	f.name = formName; 
	f.method = method; 
	f.action = action; 
	f.target = target ? target : "_self"; 
	
	return f; 
} 

window.create = function(elem) {
	return document.createElement(elem);
	//return document.createElementNS ? document.createElementNS("http://www.w3.org/1999/    xhtml", elem) : document.createElement(elem);
}
/**
 * 특정 엘리먼트에 속성을 설정한다.
 * @param elem
 * @param name
 * @param value
 * @returns
 */
window.attr = function(elem, name, value) {
	if (!name || name.constructor != String) {
		return "";
	}
	//name = {"for": "htmlFor", "class": "className"}[name] || name;
	
	if (typeof value != "undefined") {
		elem[name] = value;
		if (elem.setAttribute) {
			elem.setAttribute(name, value);
		}
	}
	//return elem[name] || elem.getAttribute(name) || "";
	return elem;
}

window.createDiv = function(id, cssClass){
	var div = document.createElement("div");
	if(typeof id != 'undefined' && id.length > 0){
		div.id = id;
	}
	
	if(typeof cssClass != 'undefined' && cssClass > 0){
		div.class = cssClass;
	}
	
	return div;
}

window.createLabel = function(forStr, cssClass, title){
	var label = document.createElement("label");
	label.for = forStr;
	label.class=cssClass
	label.innerHTML = title;
	
	return label;
}

/* 폼: 인풋 생성 */ 
window.createInput = function(type, name, value, id) { 
	var input = document.createElement("input"); 
	input.type = type; 
	input.name = name; 
	input.value = value; 
	
	if(typeof id != 'undefined' && id.length > 0){
		input.id = id;
	}else{
		input.id = name;
	}
	
	return input;
} 

window.createHidden = function(targetForm, nanme, value) { 
	var input = document.createElement("input"); 
	input.type = "hidden"; 
	input.name = nanme; 
	input.value = value; 
	//f.appendChild(input); 
	targetForm.insertBefore(input, null); 
	//f.insertBefore(input); 
	return targetForm; 
} 
	
/* 폼: 전송 */ 
window.submitForm = function(f) { 
	document.body.appendChild(f); 
	f.submit(); 
} 


/**
 * display 보이기, 숨기기
 */

window.show = function(elementId) {
	var element = document.getElementById(elementId);
	if (element) {
		element.style.display = '';
	}
}

window.hide = function(elementId) {
	var element = document.getElementById(elementId);
	if (element) {
		element.style.display = 'none';
	}
}

/**
 * 폼 요소 삭제
 * @param idCount
 * @returns
 */
window.removeItem = function(targetId) {
	var item = document.getElementById(targetId);
	if (item != null) {
		item.parentNode.removeChild(item);
	}
}



/**
 * 현재 URL을 기준으로 연결된 파라메터를 구한다.
 * request.getParameter(String name)과 동일 기능
 * ex) var prodId = getParameter('prodId');
 * 
 * @param name
 * @returns
 */
window.getParameter = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * 디버깅
 * 단 div의 id를 debugConsole로 설정해야 함.
 */
window.log = function(msg) {
	var console = document.getElementById("debugConsole");
	if (console != null) {
		console.innerHTML += msg +"<br/>";
	}
}


/**
 * OS의 줄바꿈 기호를 <br>태그로 치환한다.
 * 
 * @param str : 대상 문자열
 * @returns
 */
window.lineBreak = function(str){
	return str.replace(/(\n|\r\n)/g, '<br>');
}

/*datepicker 설정 */
window.setDefaultDatePicker = function(form, to){
	//[datepicker 설정]------------------------------------------------------
	var fromDate = $('#fromDate');
	var toDate = $('#toDate');
	var today = new Date();
	
	fromDate.datepicker({ 
		language : 'kr', //한국꺼
		pickTime : false, //시간은 안쓸랭
		format: "yyyy-mm-dd"
	}); 
	
	toDate.datepicker({ 
		language : 'kr', 
		pickTime : false, 
		format: "yyyy-mm-dd"
	});
	
	var pattern = /[^(0-9)]/gi;
	fromDate.keyup(function(){
		var from = fromDate.val();
		fromDate.val(from.replace(pattern, ""));
	});
	toDate.keyup(function(){
		var to = toDate.val();
		toDate.val(to.replace(pattern, ""));
	});
	
	
	fromDate.datepicker("setDate", firstDay() );
	toDate.datepicker("setDate", today);
}
 
/*startDate의 기본값으로 한달 전인 지난 달로 설정시*/
window.lastMonth = function(){
	var startDate = new Date();
	startDate.setMonth(startDate.getMonth()-1);
	return startDate;// star기본값으로 오늘 날짜  
}

/*startDate의 기본값으로 이 달의 첫째날을 기본값으로 설정시 */
window.firstDay = function(){
	var startDate = new Date();
	startDate.setDate(1);
	return startDate;// 기본값으로 오늘 날짜  
}

window.b64Encode = function(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

window.b64Decode = function(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

/**
 * 로그인여부 확인후 로그인 페이지로 연결
 */
window.forwardLoginPage = function(isLogin){
	if(isLogin == null){
		if(confirm("로그인 페이지로 이동합니다.")){
			var destPage=window.location.href;
			alert(destPage);
			self.location = "/auth/login?destPage=" + destPage;
		}
		return;
	}
}

window.toString = function(obj){
	/*for(key in obj.handleObj){
		console.log("obj[" + key + "]" + obj.handleObj[key]);
	}*/
	
	for(key in obj){
		if (obj.hasOwnProperty(key)){
			console.log("obj[" + key + "]=" + obj[key]);
		}
	}
}

window.isEmpty = function(str){
	//undefined와 null은 false로 처리
	if(!str){
		return true;
	} 
		
	if(str.trim().length == 0){
		return true;
	}else{
		return false;
	}
};


window.confirmAttend = function(msg) {
	$.ajax({
		type: 'GET',
		url: '/auth/confirm',
		success: function(result) {
			//alert(msg);
			$("#checkAttend_modal #modalMsg").html(msg);
			$("#checkAttend_modal").modal({
				show : true
			});
		}
	}); //end ajax   
};

/**
 * 문자열 내의 url을 찾아 '<a>'태그로 변환.
 * 프로토콜을 입력하지 않은 url에는 href값에 프로토콜을 붙여준다.
 */
window.autolink = function(string) {
	// url 필터링에 ="url" 형태도 포함. 수작업으로 ="url"은 제외.
	var expUrl = /(https?:\/\/)?(([a-zA-Z\-_0-9]+){2,}(\.[^(\n|\t|\s|,|<|>")]+)+)/gi;
	return string.replace(expUrl, '<a href="https://$2">$2</a>');
};

/**
 * 대상 요소(노드) 속에서 텍스트 노드만 찾아 '<a>'태그로 변환
 */
window.autoLinkElement = function(element){
	var orgChild, targets = [],
		treeWalker = document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
	while(orgChild = treeWalker.nextNode()){
		targets.push(orgChild);
	}
	for(var i = 0; i < targets.length; i++){
		var target = targets[i];
		var parent = target.parentNode;
		var temp = document.createElement('temp');
		temp.innerHTML = autolink(target.textContent);
		parent.replaceChild(temp, target);
		$(temp).unwrap('temp');
	}
}


Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";
 
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;
     
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};

/**
 * 해당 날짜의 주차를 표시. (예:2020-04-03 = 16)
 */
Date.prototype.getWeek = function(){
	var begin = new Date(this.getFullYear(), 0, 1);
	return Math.ceil((((this - begin) / 86400000) + begin.getDay() + 1) / 7);
};

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};


//example] console.log(new Date().format("yyyy-MM-dd"));

// trim this element's value
Element.prototype.trim = function(){
	this.value = this.value.trim();
}

/**
 * json 객체에 escape문자들을 unescape하여 JSON.parse 결과 반환
 */
JSON.parseEscape = function(jsonStr){
	var escaped = jsonStr.replace(/\n/gi, "\\n").replace(/\r/gi, "\\r")
						 .replace(/\t/gi, "\\t").replace(/\f/gi, "\\f");
	return JSON.parse(escaped);
}

/**
 * window의 기본 경고창을 모달 팝업으로 변형. 모달 안에서 msg 문자열을 표시.<br>
 * 전달받은 hasCallback 값이 true면 <br>
 * 모달이 닫힐 때 alertCallback()이라는 function[페이지에 구현 요망] 실행
 */
window.alert = function(msg, hasCallback){
	var modal = null;
	if(document.getElementById('modal_commonjs') != null) {
		modal = document.getElementById('modal_commonjs');
		$(modal).modal('hide');
	}
	modal = document.createElement('DIV');
	modal.setAttribute('id', 'modal_commonjs');
	modal.className = "modal fade common-alert-modal";
	modal.innerHTML = '<div class="modal-dialog">'
		+ '<div class="modal-content">'
		+ '<div class="alert-msg">' + msg + '</div>'
		+ '<div class="button-section">'
		+ '<button type="button" class="btn btn-main2" data-dismiss="modal">확인</button>'
		+ '</div></div></div>';
	$(modal).on('hidden.bs.modal', function(){
		$(modal).remove();
		if(hasCallback == true){
			if(typeof alertCallback == 'function'){
				alertCallback();
			}
		}
	});
	document.body.appendChild(modal);

	$(modal).modal("show");
}

/**
 * <b>공유 및 검색용 메타 태그 설정</b><br>
 * title: 표시 제목 문자열<br>
 * desc: 표시 설명 문자열<br>
 * url: hostname을 포함하는 표시 url 문자열<br>
 * img: src속성을 지니는 &lt;img&gt;<br>
 * regDate: 'yyyy-MM-dd'양식의 날짜 문자열
 */
window.replaceMetaInfo = function(title, desc, url, img, regDate){
	// 제목 설정
	document.querySelectorAll('meta[name="title"],meta[property="og:title"],meta[name="twitter:title"],meta[itemprop="name"]')
			.forEach(function(elt, i, array) {
		elt.setAttribute('content', (title != null)? title : '플레이보이스 (playvoice)');
	});
	// 설명 설정
	document.querySelector('meta[name="description"]')
			.setAttribute('content', 
					(desc != null)? desc.substring(0,200) 
					: '대한민국 영어 복구 프로젝트 : 세상과 일상에서 배우다  - The First BaseCamp for Climbing English, 플레이보이스 (playvoice)');
	document.querySelectorAll('meta[name="twitter:description"],meta[property="og:description"],meta[itemprop="description"]')
			.forEach(function(elt, i, array) {
		elt.setAttribute('content', 
					(desc != null)? desc.substring(0,60) 
					: '대한민국 영어 복구 프로젝트 : 세상과 일상에서 배우다  - The First BaseCamp for Climbing English, 플레이보이스 (playvoice)');
	});
	// url 설정
	document.querySelectorAll('meta[property="og:url"],meta[name="twitter:url"]')
			.forEach(function(elt, i, array) {
		elt.setAttribute('content', (url != null)? url : location.href);
	});
	// 대표 이미지 설정
	document.querySelectorAll('meta[property="og:image"],meta[name="twitter:image"],meta[itemprop="image"]')
			.forEach(function(elt, i, array) {
		elt.setAttribute('content', 
					(img != null)? img.src 
					: '/images/common/characters/goto_travel_evening.jpg');
	});
	// 작성일 설정
	document.querySelector('meta[property="og:updated_time"]')
			.setAttribute('content', (regDate != null)? regDate : '');
}

/**
 * sns공유용 새창을 띄우거나 링크복사를 한다.
 * 링크주소와 공유제목 외의 정보는 meta태그로부터 가져온다.<br>
 * * 페이지는 meta_fragment를 포함하고, replaceMetaInfo 함수의 호출이 선행돼야 함.
 */
window.snsShare = function(snsName, link, title) {

	if (title === null) return false;
	
	var snsPopUp;
	var _width = '500';
	var _height = '450';
	var _left = Math.ceil(( window.screen.width - _width )/2);
	var _top = Math.ceil(( window.screen.height - _height )/2);
	link = encodeURIComponent(location.host + link)
	switch(snsName){
		case 'facebook':
			snsPopUp = window.open("http://www.facebook.com/sharer/sharer.php?u=" 
			+ link, '', 'width='+ _width +', height='+ _height +', left=' + _left + ', top='+ _top);
		break;
		
		case 'twitter' :
			snsPopUp = window.open("http://twitter.com/intent/tweet?url=" 
			+ link + "&text=" + title, '', 'width='+ _width +', height='+ _height +', left=' + _left + ', top='+ _top);
			break;
		
		case 'kakao' :
			function sendKakao(){
				if(!Kakao.isInitialized()){
					Kakao.init('3d3342c6a57a723834fcbeed350828f9');
				}
				Kakao.Link.sendDefault({
				  objectType: 'feed',
				  content: {
				    title: title,
				    description: '대한민국 영어 복구 프로젝트 : 세상과 일상에서 배우다  - The First BaseCamp for Climbing English, 플레이보이스 (playvoice)',
				    imageUrl: // 썸네일 이미지
				    	document.querySelector('meta[property="og:image"]').getAttribute('content'),
				    link: {
				      mobileWebUrl: link,
				      androidExecParams: 'test',
				    },
				  },
				  social: {
				    likeCount: 10,
				    commentCount: 20,
				    sharedCount: 30,
				  },
				  buttons: [
				    {
				      title: '웹으로 이동',
				      link: {
				        mobileWebUrl: link,
				      },
				    },
				    {
				      title: '앱으로 이동',
				      link: {
				        mobileWebUrl: link,
				      },
				    },
				  ],
				  success: function(response) {
				    console.log(response);
				  },
				  fail: function(error) {
				    console.log(error);
				  }
				});
			}
			if(!window.Kakao){
				const kakaolinkscript = document.createElement('script');
				kakaolinkscript.type = 'text/javascript';
				kakaolinkscript.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';
				document.body.appendChild(kakaolinkscript);
				kakaolinkscript.onload = sendKakao;
			}else{
				sendKakao();
			}
			
			break;
		
		case 'addurl' :
			var dummy = document.createElement("textarea");
			document.body.appendChild(dummy);
			dummy.value = link;
			dummy.select();
			document.execCommand("copy");
			document.body.removeChild(dummy);
			oneBtnModal("URL이 클립보드에 복사되었습니다.");
			break;
	}
}

/**
 * yyyy-MM-ddTHH:mm:ss 형식의 날짜/시간 문자열을 브라우저별 스크립트 엔진 무관하게 파싱하여 Date 객체 반환. 
 * 로케일 정보는 UTC를 기준으로 통일한다.
 */
window.parseDate = function(dateString){
	var t = dateString.split(/[- : T]/);
	return new Date(t[0] != undefined ? parseInt(t[0]) : 0, 
					t[1] != undefined ? parseInt(t[1]-1) : 0, 
					t[2] != undefined ? parseInt(t[2]) : 0, 
					t[3] != undefined ? parseInt(t[3]) : 0, 
					t[4] != undefined ? parseInt(t[4]) : 0, 
					t[5] != undefined ? parseInt(t[5]) : 0);
}

/**
 * <b>등차 수열의 배열을 생성한다.</b>		<br><br>
 * start: 시작 숫자					<br>
 * size: 배열의 크기					<br>
 * inc: 증가값						<br><br>
 * 
 * @auther 이광민
 */
window.makeArray = function(start, size, inc){
	return Array.apply(inc,Array(size)).map(function(curr,i){return start+i*inc});
}


/**
 * JSON 객체를 파싱하여 폼데이터를 추가한다.
 * 
 * 예 : 추가되는 [name, value] =
 *		["이름", "홍길동"], ["나이", 19], 
 *		["자식[0].이름", "길동이"], ["자식[0].나이", 5],
 *		["자식[1].이름", "길순이"], ["자식[1].나이", 3]
 *
 * dataName : 접두 이름
 * jsonData: 대상 JSON 데이터
 * @author 이광민
 */
window.appendData = function(form, jsonData, dataName){
	var prefix = dataName || '';
	if(typeof jsonData != 'object' || jsonData == null){
		// plain 데이터일 경우 바로 폼데이터로 추가
		createHidden(form,prefix,jsonData);
	}else if(Array.isArray(jsonData)){ 
		// 배열형일 경우 배열의 각 요소를 폼데이터로 추가
		for(var i = 0; i < jsonData.length; i++){
			appendData(form, jsonData[i], prefix + '[' + i + ']');
		}
	}else{
		// 속성을 가진 객체형일 경우 각 속성을 폼데이터로 추가
		var keys = Object.keys(jsonData);
		prefix = prefix.length > 0 ? (prefix + '.') : '';
		for(k in keys) {
			appendData(form, jsonData[keys[k]], prefix + keys[k]);
		}
	}
}


/**
 * 문자열의 내용 중 [‘],[’],[‚],[“],[”]와 같이 특수한 유니코드값을 ASCII 문자로 대체하여 반환
 * (추가: [ ],[&nbsp;])
 * 
 * 1. 큰따옴표 
 * '\u201c'[“] '\u201f'[‟]  '\u201d'[”] '\u201e'[„]
 * '\u2033'[″] '\u2036'[‶]  '\u275d'[❝] '\u275e'[❞]
 * '\u301d'[〝] '\u301e'[〞] '\uff02'[＂]
 * 
 * 2. 작은따옴표 
 * '\u2018'[‘] '\u2019'[’]  '\u201b'[‛]
 * '\u2032'[′] '\u2035'[‵]  '\u275b'[❛] '\u275c'[❜]
 * 
 * 3. 쉼표 
 * '\u201A'[‚] '\u060C'[،]  '\uFE50'[﹐] '\uFE51'[﹑]
 * '\uFF0C'[，] '\uFF64'[､]
 * 
 * 4. 공백 
 * '\u00A0' '&nbsp'
 * 
 * @author 강한별 
 */
window.replaceQuotes = function(content) {
	return content.replace(/“|‟|”|„|″|‶|❝|❞|〝|〞|＂/gi, "\"")
				.replace(/‘|’|‛|′|‵|❛|❜/gi, "'")
				.replace(/‚|،|﹐|﹑|，|､/gi, ",")
				.replace(/\u00A0/gi, " ");
}

/**
 * 기존 form에 커스텀 데이터(파일)를 추가/교체하여 submit 실행
 * 커스텀 데이터 양식: {name, value, filename}
 * @author 이광민
 */
window.customSubmit = function(form, ...customDatas){
	var submitData = new FormData(form);
	customDatas.forEach(function(d){
		if(submitData.get(d.name) != null){
			//submitData.set(d.name, d.value, d.filename);
		}else if(d.filename != null){
			submitData.append(d.name, d.value, d.filename);
		}else{
			submitData.append(d.name, d.value);
		}
	});
	form.submit();
}

/**
 * @description 애드핏 광고 노드가 로딩 완료되면 다른 요소 속으로 자리를 옮긴다.
 * 초기 로드 시 visible한 영역에 광고가 없으면 광고가 새로고침되지 않으므로,
 * 시선이 닿지 않는 곳에 우선적으로 로드 후 위치를 옮긴다.
 * @param adNode (Node) 광고 요소
 * @param destArea (Element, jQueryObject) 옮겨질 위치
 */
window.migrateAdFit = function(adNode, destArea){
	var observer = new MutationObserver(function(mutations){
		mutations.forEach(function(mutation){
			if(mutation.type === 'attributes' 
			&& mutation.target.getAttribute(mutation.attributeName) === 'done'){
				observer.disconnect();
				observer = undefined;
				$(destArea).append(adNode);
			}
		});
	})
	observer.observe(adNode,{attributes:true, attributeOldValue:true});
}