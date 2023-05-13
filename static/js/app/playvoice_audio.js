var audio = null;  //음성 객체를 담을 변수
var loopN=0; //반복횟수
var audioloadTimer;
/*************************보이스 재생************************************/
/**
 * 이 스크립트는 jquery.base64.js 를 필요로 합니다.
 * 
 * filUri: 재생할 파일을 요청할 uri (쿼리문자열의 '='까지 쓴다.예: "/pictionary/file/view?path=").
 * vPath: 재생하려는 파일의 경로를 포함한 파일명.
 * loopNum: 재생하려는 횟수.
 * target: 재생 버튼 element를 넣으면 재생 상태에 따라 버튼 모양을 토글.
 * 파일명을 url인코딩 하여 서버로부터 파일을 가져와
 * 원하는 횟수 만큼 0.8초 간격으로 재생한다.
 * 멈추고 싶을 땐 다시 누른다.
 */
function playVoice(fileUri, vPath, loopNum, target){
	if(audio!=null){  //audio 변수에 음성 객체가 있다면
		if(document.querySelector('.audioActive') !=null){
			document.querySelector('.audioActive').classList.remove('audioActive');
		}
		if(!audio.paused){  //멈춤 상태가 아닐 시 
			audio.pause();  //재생을 정지.
		}
		loopN = 0;  //반복횟수값은 0으로 변경
		audio = null;
	}else{  //audio 변수에 음성 객체가 없다면
		let actives = document.querySelectorAll('.audioActive');
		if(actives != null){
			actives.forEach(function(elt, i, array) {
				elt.classList.remove('audioActive');
			})
		}
		try {
			loopN=loopNum;
			var timeout;
			audio = new Audio(fileUri+vPath);
			// 음성을 불러오는 중
			audio.addEventListener('loadstart', function(){
				$('#playvoiceNetworkLoading').show();
			});
			// 음성 불러오기 실패
			audio.addEventListener('error', function(){
				clearTimeout(audioloadTimer);
				audioloadTimer = setTimeout(function() {
					$('#playvoiceNetworkLoading').hide();
				}, 300);
			});
			/// 음성 불러오기 완료
			audio.addEventListener('loadeddata', function(){
				clearTimeout(audioloadTimer);
				audioloadTimer = setTimeout(function() {
					$('#playvoiceNetworkLoading').hide();
				}, 300);
			})
			audio.addEventListener('canplaythrough', function(){
				if(typeof target != 'undefined' && !target.classList.contains('audioActive')){
					target.classList.add('audioActive');
				}
				audio.play();
			});
			audio.addEventListener('ended',function(){
//				audio.currentTime=0;
				clearTimeout(timeout);
				timeout=setTimeout(function() {
					if(loopN>1){
						loopN--;
						audio.play();
					}else{  //반복 재생이 끝나면 
						if(typeof target != 'undefined' && target.classList.contains('audioActive')){
							target.classList.remove('audioActive');
						}
						audio=null; //다시 눌렀을 때 재생하기 위해 null로 초기화.
					}
				}, 800)
			});
			audio.load();
		} catch (e) {
			alert('음성을 불러올 수 없습니다.');
		}
	}
};
function pauseVoice() {
	if(audio!=null && !audio.paused){
		audio.pause();
	}
};
function stopVoice() {
	if(audio!=null){  //audio 변수에 음성 객체가 있다면
		if(!audio.paused){  //멈춤 상태가 아닐 시 
			audio.pause();  //재생을 정지.
		}
		loopN = 0;  //반복횟수값은 0으로 변경
		audio = null;
	}
};
function resumeVoice() {
	if(audio!=null && audio.paused){
		audio.play();
	}
};