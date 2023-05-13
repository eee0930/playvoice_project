/*------------------------------------------------------------------------------
 *								index.html
 *----------------------------------------------------------------------------*/

/**
 * 기능: 페이지 번호(1부터 시작)에 해당하는 프로필페이지를 불러온다.
 * 상세: 페이지 번호에 해당하는 프로필페이지를 요청하면 PageMaker 혹은 List 형태로 응답결과를 받는다.
 *      응답결과가 PageMaker일 경우 .result.content를,
 *      응답결과가 List일 경우 응답결과 자체를 화면표시 함수 successGetProfiles로 전달한다.
 */
function getProfiles(pageNum) {
	$.ajax({
		type: 'GET',
		url: '/profile/text/list/' + pageNum,
		success: function(profilePageMaker) {
			var profileList;
			
			if(typeof profilePageMaker.result === "undefined"){
				profileList = profilePageMaker;
			}else{
				profileList = profilePageMaker.result.content;
			}
			if(profileList.length == 0){
				$(".loading").hide();
				$(document).off("scroll", profileListScrollHandler);
			}else{
				//---------------------------
				successGetProfiles(profileList);
				//---------------------------
			}
		},
		error : function (xhr){
			$(".loading").hide();
			$(document).off("scroll", profileListScrollHandler);
		}
	});
}