

/*----------------------------------------
 *			 index.html
 *---------------------------------------*/

/**
 * 플레이보이스북 관련 practice 댓글 불러오기
 */
function getPracticeCommentList(pageNo) {
	$.ajax({
		type: 'GET',
		url: '/playvoiceBook/practiceComments/' + pageNo,
		contentType:false,
		processData:false,
		success: function(appReplyList) {
			if(appReplyList != null && appReplyList.content.length > 0){
				successGetPracticeCommentList(appReplyList.content);
			}else{
				failGetPracticeCommentList();
			}
		},
		error : function (xhr){
			failGetPracticeCommentList();
		}
	});
}



/*----------------------------------------
 *			 list_levels.html
 *---------------------------------------*/

/*
 * 특정 레벨의 스테이지 목록 조회하기
 * selector : (이벤트 소스) '#levelListPanel .levelDiv'
 */
function getStageList(levelId, selector) {
	
	$.ajax({
		url : '/playvoiceBook/stagelist/' + levelId,
		type : 'get',
		contentType : "application/json",
		success : function(stageList) {
			displayStageList(stageList, selector);
		},
		error : function(e) {
			alert("처리중 에러가 발생하였습니다.\n" + JSON.stringify(e));
			console.log("ERROR : ", e);
		}
	});
}

/*
 * 선택한 스테이지를 플레이어로 이동하기
 */
function forwardPlayerPage(stageId56, levelSeq, stageSeq){
	stageId = stageId;
	var destPage = "/playvoiceBook/player/"+stageId56+"?lseq="+levelSeq+"&sseq="+stageSeq;
	//로그인 경우
	if($('#loginStatus').text() == 'true'){
		location.href=destPage
	}
	//로그인 전이라면
	else{
		if(confirm("로그인 페이지로 이동합니다.")){
			location.href="/auth/login?destPage="+destPage;
		}
	}
	
	
}


/*----------------------------------------
 *		play_playvoice_book.html
 *---------------------------------------*/
var stageId						//현재 스테이지 id

var playvoiceList;				//현재 스테이지의 플레이보이스 리스트
var audioList = null;			//현재 문장에서 재생할 Audio 리스트
var voiceActorList = null;		//보이스 성우 List
var totalSentenceNum;			//현재 스테이지 전체 문장 갯수
var currentSentenceIndex = 0;	//플보북 내에서 현재 학습 중인 센텐스의 인덱스.
var studyOverCount = 0;			//학습한 센텐스의 갯수

var currentAudio;
var currentVoiceIndex = 0;		//현재 센텐스 보이스들의 인덱스.
var currentVoiceActor;			//현재 재생되는 보이스(액터정보를 위해)
var playCount = 0;				//오디오  재생 횟수
var isRepeat = false; 			//스테이지 무한 반복 지정 , false일경우 스테이지 마지막 문장 재생 후 다음 스테이지로 이동
var loopSize = 3;				//오디오 반복 재생 횟수
var timer;						//재생 간격을 처리하기 위해 쓰는 타이머 객체
var isSentenceAutoPlay = true;	//센텐스가 변경될 때 오디오 자동재생 여부
var voiceResourcePath="/resource/voice/";

/**
 * 서버로부터 받은 playvoiceList를 자바스크립트 변수로 파싱한다.
 */
function parsePlayvoiceList(pvl){
	playvoiceList = JSON.parse(JSON.stringify(pvl));
}

/**
 * 스테이지의 플레이보이스 정보를 초기화한다.
 */
function initCurrentStage(playvoiceList){
	totalSentenceNum = playvoiceList.length-1;
	
	//레벨/스테이지 정보 화면설정
	confirmStageObjective();
	
	//현재 센텐스의 보이스를 오디오객체로 생성 및 저장한다.
	initPlayvoice();
	
	//실행할 currentAudio를 설정한다.
	nextVoice();
}


/**
 * 스테이지의 타겟 센텐스의 보이스를 오디오 객체로 생성 및 저장한다.
 * 스테이지의 센텐스가 변경될 때 마다 호출된다.
 */
function initPlayvoice(){
	//console.log("[Count] "+playCount+", "+currentSentenceIndex);
	clearTimeout(timer);
	
	//초기화
	audioList = [], voiceActorList = [];
	playCount = 0;
	$('#loopNum, #loopNum_xs').val(loopSize);
	
	nextSentence(currentSentenceIndex).voiceList.forEach(function(voice, i) {
		var nextAudio, audioListIndex;
		nextAudio = new Audio();
		nextAudio.preload = 'none';
		nextAudio.onerror = function(){
			nextAudio.src = voiceResourcePath + voice.path + '?v=' + Math.random();
			nextAudio.load();
			audioList.splice(audioListIndex, 1, nextAudio);
		}
		nextAudio.src = voiceResourcePath + voice.path;
		nextAudio.load();				//for Safari
		audioList.push(nextAudio);
		audioListIndex = audioList.indexOf(nextAudio);
		voiceActorList.push(voice);
	});
	

}

/**
 * for Safari
 * @param url
 * @returns
 */
function preloadAudio(url) {  
	//console.log("trying to preload "+ url);
	var audio = new Audio();
	// once this file loads, it will call loadedAudio()
	// the file will be kept by the browser as cache
	audio.addEventListener('canplaythrough', audio.play(), false);

	audio.addEventListener('error', function failed(e) {
		console.log("COULD NOT LOAD AUDIO");
		$("#NETWORKERROR").show();
	});
	audio.src = url;

	audio.load(); // add this line
	return audio;
}


/**
 * stage를 구성하는 센텐스 중에서 sentenceIndex번째 sentence를 리턴한다.
 * 
 * @param sentenceIndex
 * @returns
 */
function nextSentence(sentenceIndex){
	var playvoice = playvoiceList[sentenceIndex];
	
	if(playvoice != undefined){
		return playvoice.sentence;
	}
}


/**
 * 오디오 목록으로부터 currentAudio를 설정한다.
 * currentAudio는 목록으로부터 랜덤하게 설정된다.
 */
var tryCount = 0;
function nextVoiceIndex(){
	var nextIndex =  (audioList.length-1) - tryCount;
	if(nextIndex < 0){
		tryCount++;
		return nextIndex;
	}else{
		tryCount = 0;
		return audioList.length -1 ;
	}
}

function nextVoice(){
	var random = Math.floor(Math.random() * audioList.length);	//nextVoiceIndex();
	//console.log("random="+random+", length="+audioList.length);
	
	if(currentAudio==undefined){
		currentAudio = audioList[random];
	}else{
		currentAudio.src = audioList[random].src;
	}
		
	currentVoiceActor = voiceActorList[random];	//성우출력을 위해
	
	//console.log("currentAudio i: "+random);
	if(currentAudio){
		//console.log("nextVoice()="+currentAudio.src.slice(-7));
		addEndAudioEvent(currentAudio);
	}else{
		console.log("nextVoice() : problem occurred, "+random+": "+audioList[random]);
	}
	
	return currentAudio;
}


/**
 * 하나의 오피오 파일 재생이 끝날때 수행할 이벤트를 정의한다.
 * 지금 재생된 오디오 파일을 1초 간격으로 loopSize만큼 반복시키거나
 * 다음 센텐스와 오디오 파일을 찾아
 * @returns
 */
function addEndAudioEvent(){
	//오디오의 재생이 끝날 때마다 이벤트 발생
	currentAudio.addEventListener('ended', function setNextPlay() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			currentAudio.pause();
			//이벤트리스너가 중복으로 호출되지 않기 위해 이전 이벤트리스너를 제거한다.
			currentAudio.removeEventListener('ended',setNextPlay);
			//동일 문장에 대한 반복이라도 매번 보이스를 변경한다.
			nextVoice();
			// changeSentenceDisplay();
         
			if(playCount < loopSize-1){
				playAudio(currentAudio);
				playCount++;
            
				//console.log("playCount="+playCount);
				//console.log("addEventListener()="+currentAudio.src.slice(-7));
			}else{
				autoNextSentence();
			}
		}, 2000);
	});
}


/**
 * 오디오 재생
 * @returns
 */
function playAudio() {
	if(currentAudio){
		//두 개이상의 오디오가 동시에 재생되는 것을 방지를 위해 
		//타겟 오디오 재생을 위해 항상 현재 재생되고 있는 것이 있다면 중지시킨다.
		if(!currentAudio.pause){
			currentAudio.pause();
		}
		displayVoiceActorInfo();
		currentAudio.addEventListener('canplaythrough', currentAudio.play());
		
	}else{
		console.log("can't play the audio.");
	}
};


/**
 * 오디오 일시정지
 * 오디오 정지시는 currentAudio.currentTime = 0;
 * @returns
 */
function stopAudio() {
	if (currentAudio && !currentAudio.paused && !currentAudio.ended
			&& currentAudio.readyState > 2) {
		currentAudio.pause();
		//currentAudio.currentTime = 0;
	}
};


/**
 * 현재 학습을 종료하고 스테이지 목록으로 이동
 */
function stopLearning(stageId){
	//alert("stop"+stageId);
	stopAudio();
	if(currentAudio){
		currentAudio.currentTime = 0;
	}
	
	var lseq=getParameter('lseq');
	location.href="/playvoiceBook/stage/summary/"+stageId;
}


/**
 * 레벨 목록으로 가기
 * @returns
 */
function goLevelList(){
	stopAudio();
	if(currentAudio){
		currentAudio.currentTime = 0;
	}
	
	var lseq=getParameter('lseq');
	location.href="/playvoiceBook/level?lseq="+lseq;
}

//var block = false;	//학습 현황에 따라 다음 레벨의 진입 여부를 결정
var passLevel = 0;		//테스트할 세트 페이지

function goDictationTest(passLevel){
	stopAudio();
	if(currentAudio){
		currentAudio.currentTime = 0;
	}
	location.href="/playvoiceBook/notice/test/820/"+passLevel;//ref) IndexPlayvoiceBookController
}

/**
 * 현재 학습중인 스테이지의 다음 스테이지를 리턴한다.
 * block은 학습 현황에 따라 다음 레벨의 진입 여부를 결정한다. true일 때 진입 불허용
 * 이 값은 세트페이지가 바뀌는 시점에 유효하다. 
 * 현재 세트페이지 내에서 스테이지 이동 시 block 값은 계속해서 false.
 * 세트페이지가 넘어갈 때에는 true. 현재 세트페이지에 대한 레벨 테스트를 통과해야 false로 바뀐다.
 * @returns
 */
function goNextStage(stageId, levelSeq, stageSeq, block, passLevel){
	if(block){
		goDictationTest(passLevel);
		return;
	}
	
	$.ajax({
		url : '/playvoiceBook/nextStage/'+stageId+'?lseq=' + levelSeq +'&sseq='+stageSeq,
		type : 'get',
		contentType : "application/json",
		success : function(nextStage) {
			location.href="/playvoiceBook/player/"+nextStage.stageIdBase
			+"?lseq="+nextStage.levelSeq+"&sseq="+nextStage.stageSeq;
		},
		error : function(xhr) {
			if(xhr.status == 400){
				window.alertCallback = function(){
					location.href = '/playvoiceBook/kick/deck';
				}
				alert('다음 스테이지를 진행하려면 Johnny Deck을 플레이해 보세요.', true);
			}else{
				alert("처리중 에러가 발생하였습니다.");
				console.error(xhr.responseText);
			}
		}
	});
}


/** 문장의 강조처리 된 htmlString을 반환.
 * text: 대상 문장
 * emLoc: 강조위치(배열형태의 문자열)
 * effectTag: 강조효과 태그(시작태그와 종료태그 사이에 공란 없어야 함)
 */
function emphasizeText(text, emLoc, effectTag) {
	//html 요소 코딩시 한줄 내려쓰기등으로 발생하는 화이트페이이스 제거
	var text = text.trim();
	
	var emLocArrays = JSON.parse(emLoc);	// 배열로 파싱. 파싱결과는 2차배열.[[시작위치,끝위치],[시작위치,끝위치],...]
	var beforeEffect = 0;	//강조가 적용되기 전 위치
	var resultText = "";	//강조적용 결과 
	
	if(emLocArrays == null || emLocArrays.length == 0) { 
		/* 강조 위치가 없을 경우 입력받은 문장을 그대로 반환 */
		return text;
	} else {
		/* 강조위치의 갯수만큼 적용 */
		for(var k = 0; k < emLocArrays.length; k++) {
			var effectStart = emLocArrays[k][0];	// 강조 시작 위치
			var effectEnd = emLocArrays[k][1];	// 강조 끝 위치
			
			/* String.substring(start,end)은 start 위치는 포함, end 위치는 미포함 */
			var pureText = text.substring(beforeEffect, effectStart);	// 강조 시작위치 전 부분 -> 강조 미적용 문자열
			var effectTarget = text.substring(effectStart, effectEnd + 1);	// 강조 시작위치~끝위치 -> 강조 적용 문자열
		
			/* 강조효과태그의 시작태그와 종료태그 사이에 강조 적용 문자열을 끼운다 */
			var effectTagSplit = effectTag.split('><');
			var taggedText = effectTagSplit[0] + '>' + effectTarget + '<' + effectTagSplit[1];
			
			/* 모든 강조가 적용되는 문장은 강조가 미적용된 부분(pureText)과 강조가 적용된 부분(effectedText)의 조합으로 이루어진다.
			강조가 미적용된 부분부터 시작할 수 있어 pureText를 앞에 위치시킨다. */
			resultText += pureText + taggedText;
			
			beforeEffect = effectEnd + 1;	// 다음 강조 미적용 문자열 시작 위치 계산
			      
			if(k == emLocArrays.length - 1 && beforeEffect < text.length) { 
				//강조 미적용 문자열로 문장이 끝날 시 마지막 beforeEffect 위치부터 끝까지 그대로 이어붙인다.
				resultText += text.substring(beforeEffect);
			}
		}
		return resultText;
	}
};

/**
 * 대상 문장에서 강조 부분만 추출하여 반환.
 * 
 * text: 대상 문장
 * emLoc: 강조위치(배열형태의 문자열)
 */
function extractEmphasis(text, emLoc) {
	var emLocArrays = JSON.parse(emLoc); // 배열로 파싱. 파싱결과는 2차배열.[[시작위치,끝위치],[시작위치,끝위치],...]
	var result = "";
	
	if (emLocArrays == null || emLocArrays.length == 0) {
		return result;
	}else{
		var length = emLocArrays.length;
		var lastEffectEnd;
		for(var i = 0; i < length; i++){
			var effectStart = emLocArrays[i][0]; // 강조 시작 위치
			var effectEnd = emLocArrays[i][1]; // 강조 끝 위치	
			
			if(i > 0){
				result += " ".repeat(effectStart - lastEffectEnd - 1);
			}
			result += text.substring(effectStart, effectEnd + 1);
			lastEffectEnd = effectEnd;
		}
		
		return result;
	}
}

/**-----------------------------------------------------------------------------
 * 							Yg 플레이어 부분
 -----------------------------------------------------------------------------*/

var widget;
function onYouglishAPIReady(){
	widget = new YG.Widget("widget-1", {
		width: 700,
		components: 4, // 컴포넌트:타이틀만
		autoStart: 0,	// 자동재생(default:1=예),
		restrictionMode: 1, // 연령제한 검색: 예
		title: '%20', // 타이틀 빈칸으로
		events: {
			'onFetchDone': onYgFetchDone,
			'onVideoChange': onYgVideoChange,
			'onCaptionConsumed': onYgCaptionConsumed,
			'onCaptionChange': onYgCaptionChange,
			'onPlayerStateChange': onYgPlayerStateChange
		}          
	});
	var empText = extractEmphasis(
  		(playvoiceList[0].stage.rep == null) ? "" : playvoiceList[0].stage.rep,
 		(playvoiceList[0].stage.emLoc == null) ? "[]" : playvoiceList[0].stage.emLoc);
	if(empText == null || empText.length == 0){
		// ----------
		disableYg();
		// ----------
	}else{
		// 위젯으로 키워드 검색 
		widget.fetch(empText, "english");
	}
}
/**
 * 위젯에서 검색이 완료되면 호출되어 결과가 없으면 Yg 플레이어를 비활성화
 */
function onYgFetchDone(event){
	if (event.totalResult === 0){
		// ----------
		disableYg();
		// ----------
		console.log("No result found");
	}
}
 
var newVideo = false, currentTrackId = 0;   
/**
 * 새로운 영상으로 교체될 때마다 호출됨.
 */
function onYgVideoChange(event){
	newVideo = true;
}
/**
 * 현재 재생 중인 영상 자막이 끝나는 시점에 호출됨. 해당 자막이 반복 대상일 경우 되감기.
 */
function onYgCaptionConsumed(event){
	if(event.id == currentTrackId){
		widget.replay();
	}
}

/**
 * 영상의 자막이 바뀔 때마다 호출. 새 영상에서 처음 불러온 자막을 플레이어 내의 예문으로 표시.
 */
function onYgCaptionChange(event){
	if(newVideo){
		// 영상의 자막을 플레이어 컨트롤러에 표시
		//-----------------------------
		changeYgCaption(event.caption); 
		//-----------------------------
		currentTrackId = event.id;
		newVideo = false;
	}
}

/**
 * 플레이어의 재생 상태가 바뀔 때마다 호출. 영상 재생 버튼과 동기화 한다.
 */
function onYgPlayerStateChange(event){
	switch(event.state){
		case YG.PlayerState.PLAYING:
			//--------------------
			toggleYgPlayBtn(true);
			//--------------------
			break;
		case YG.PlayerState.PAUSED:
			//--------------------
			toggleYgPlayBtn(false);
			//--------------------
			break;
		}
}

/**-----------------------------------------------------------------------------
 * 							// Yg 플레이어 부분
 -----------------------------------------------------------------------------*/