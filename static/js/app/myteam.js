/**
 * 마이팀 페이지에서 쓰는 함수들의 집합으로, 친구 추가/삭제 등의 함수가 포함된다.
 */

//------------------------------------------------------------------------------
//							add_trunk.html
//----------------------------------------------------------------------------//

/**
 * 해당하는 회원을 나의 리프로써 트렁크에 추가한다.
 */
function addMyTrunk(leafId, alias, element) {
	$.ajax({
		url: "/myteam/trunk/add/" + leafId,
		type: "POST",
		success: function(){
			alert("\"" + alias + "\"님을 친구로 추가했습니다.");
			//-------------------------
			if(typeof successAddMyTrunk == 'function'){
				successAddMyTrunk(element);
			}
			//-------------------------
		},
		error: function(xhr){
			alert(xhr.responseText);
		}
	})
}

//------------------------------------------------------------------------------
//							index.html
//----------------------------------------------------------------------------//

/**
 * 해당하는 회원을 나의 트렁크에서 삭제한다.
 * 삭제가 완료되면 목록에서도 표시하지 않도록 한다.
 */
function deleteMyTrunk(leafId, alias, element) {
	$.ajax({
		type: "POST",
		url: "/myteam/trunk/del/" + leafId,
		success: function(){
			alert("\"" + alias + "\"님을 트렁크 목록에서 지웠습니다.\n" 
					+ "\"" + alias + "\"님의 트렁크 목록에는 여전히 "
					+ "당신이 표시될 수 있습니다.");
			$(element).fadeOut(1000, function(){$(element).remove()});
		},
		error: function(xhr){
			alert("트렁크에서 삭제하지 못했습니다.");
		}
	})
}