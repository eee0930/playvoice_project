/**
 * 사용자의 세션 정보를  sessionStorage를 이용하여 저장 및 획득한다.
 * userContainer를 얻고자 할 때 값이 없다면 로그인 페이지로 이동한다.
 * @author LGM
 */
class js{
	jsContainer;
	
	// 세션 스토리지로부터 사용자 컨테이너 정보 획득. 값이 없으면 홈으로 이동.
	static get userContainer(){
		if(this.jsContainer == null){
			var container = sessionStorage.getItem("ttsContainer");
			
			if(container != null){
				return JSON.parse(container);
			}else{
				location.replace('/tts');
			}
		}else{
			return this.jsContainer;
		}
	}
	
	/** 사용자의 컨테이너 정보를 세션스토리지에 저장
	 * 객체 정보를 그대로 저장하면 "[Object object]" 라고 저장되니 stringify 필요.
	 */
	static store(jsonUserContainer){
		if(jsonUserContainer != null){
			sessionStorage.setItem('ttsContainer', JSON.stringify(jsonUserContainer));
			return;
		}
	}
}

/**
 * 변환이 완료된 음성 파일들을 압축파일 형태로 저장
 * @author LGM
 */
function downloadZip(form){
	
	// 폼 데이터를 JSONObject화
	jQuery.fn.serializeObject = function() { 
	      var obj = null; 
	      try { 
	          if(this[0].tagName && this[0].tagName.toUpperCase() == "FORM" ) { 
	              var arr = this.serializeArray(); 
	              if(arr){ obj = {}; 
	              jQuery.each(arr, function() { 
	                  obj[this.name] = this.value; }); 
	              } 
	          } 
	      }catch(e) { 
	          alert(e.message); 
	      }finally {} 
	      return obj; 
    }
	return new Promise(function(resolve, reject) {
		// 안드로이드 앱에서의 다운로드 처리
		if(AndroidJS != null ){
			var rs = AndroidJS.downloadAsZip('/tts/download',
					JSON.stringify($(form).serializeObject())
					);
			resolve(rs);
		}
	});
}
/**
 * 나의 앨범들 중 지정한 앨범들을 삭제.
 * 
 * @param command 전달 커맨드 {memberId, albumList[]}
 * @param doms 화면 상에서 선택된 앨범들의 DOM list
 * 
 * @author LGM
 */
function removeMyAlbum(command, doms){
	$.ajax({
		type: 'POST',
		url: '/tts/myalbum/del',
		data: JSON.stringify(command),
		dataType: 'json',
		contentType: 'application/json',
		success: function(delVoicePathList){
			alert('선택한 앨범을 삭제했습니다.');
			if(AndroidJS != null){
				AndroidJS.removeFiles(delVoicePathList);
			}
		},error: function(xhr){
			alert('앨범 삭제 중 오류가 생겼습니다. 다시 시도해 주시기 바랍니다.')
		}
	})
}

/**
 * 플레이 리스트에서 문장(음성)들을 삭제
 *
 * @param command 전달 커맨드 {cloudVoiceIdList[]}
 * @param $doms 화면 상에서 선택된 문장(음성)들의 jquery DOM list
 *
 * @author LGM
 */
function deletePlayList(command, $doms){
	$.ajax({
		type: 'POST',
		url: '/tts/player/playlist/del',
		data: JSON.stringify(command),
		dataType: 'json',
		contentType: 'application/json',
		success: function(){
			alert('선택한 문장들을 앨범에서 삭제했습니다.');
			if(AndroidJS != null){
				var delPaths = $doms.get().map(function(elem){
					return $(elem).find('.path').val();
				})
				AndroidJS.removeFiles(delPaths);
			}
			//--------------------------
			successDeletePlayList($doms);
			//--------------------------
		},error: function(xhr){
			alert('문장 및 음성 삭제 중 오류가 생겼습니다. 다시 시도해 주시기 바랍니다.');
		}
	})
}

/**
 * 플레이 리스트에서 문장(음성)들의 순서 수정
 *
 * @param command 전달 커맨드 {cloudVoiceList{vid,orderNum}[]}
 *
 * @author LGM
 */
function editPlayList(command){
	$.ajax({
		type: 'POST',
		url: '/tts/player/playlist/reorder',
		data: JSON.stringify(command),
		dataType: 'json',
		contentType: 'application/json',
		success: function(){
			alert('문장 순서가 변경되었습니다.');
			//-------------------
			successEditPlayList();
			//-------------------
		},error: function(xhr){
			alert('문장 순서 변경 중 오류가 생겼습니다. 다시 시도해 주시기 바랍니다.');
			restoreOrder();
		}
	})
}