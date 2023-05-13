/*------------------------------------------------------------------------------
 *								index.html
 *----------------------------------------------------------------------------*/

/**
 * 기능:페이지 번호(1부터 시작)에 해당하는 프로필페이지를 불러온다.
 */
function getProfiles(pageNum) {
	$.ajax({
		type : 'GET',
		url : '/profile/text/list/' + pageNum,
		success : function(profilePageMaker) {
			if (profilePageMaker.result.empty) {
				$(".loading").hide();
				$(document).off("scroll", profileListScrollHandler);
			} else {
				// ---------------------------
				successGetProfiles(profilePageMaker.result.content);
				// ---------------------------
			}
		},
		error : function(xhr) {
			$(".loading").hide();
			$(document).off("scroll", profileListScrollHandler);
		}
	});
}