//----------------------------------------
//			add_member.html 
//----------------------------------------

/**
 * 입력 아이디 중복여부 체크.
 * 서버에서 중복된 아이디가 있으면 true를 반환.
 */ 
function isDuplicatedId(id) {
	$.ajax({
		type: 'GET',
		url: '/member/registration/checkId/' + id,
		success: function(result) {
			displayCheckId(result);
		}
	}); //end ajax   
};

/**
 * 이메일 주소 중복여부 체크.
 * 서버에서 동일 이메일 주소로 가입된 회원이 있으면 true를 반환.
 */
function isDuplicatedEmail(email) {
	$.ajax({
		type: 'GET',
		url: '/member/registration/checkEmail/' + email,
		success: function(result) {
			displayCheckEmail(result);
		}
	});  
};

/**
 * 비밀번호 유효성 검사.
 * 영문 대소문자, 숫자, 특수문자 중 2가지 이상의 조합으로 이루어졌으면 true를 반환.
 */
function isValidPassword(passwd) {
	return ((
			  /[0-9]/g.test(passwd)
			+ /[A-z]/g.test(passwd)
			+ /[^A-z0-9-+*&]/g.test(passwd)
			) > 1);
}

//----------------------------------------
//	list_members.html & 
//	search_members_page.html
//----------------------------------------

/** 
 * searchType : 검색 타입
 * page : 페이지 번호
 * 검색폼을 통한 검색 전송시 ajax 를 통해 결과 목록을 PageMaker:json로 전달받는다.
 * 	전송방식은 세가지 사용자 인터페이스를 갖는다.
 * 	1. 검색버튼을 이용한 최초 전송과 그 이후 
 * 	2. 목록 페이지를 선택하여 전송
 * 	3. 테이블에서 컬럼 정렬을 선택하여 전송
*/
function searchMember(searchRequest){
	$.getJSON({
		//type: "GET",
		url : '/admin/member/search',
		data : searchRequest,
		success : function(pageMaker){
			//resetDefault();
			
			var page = pageMaker.result;
			displayMemberList(page, pageMaker.currentPageNum);				
			displayPageNavigation(pageMaker);

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			//기존 테이블 닫기
			$('#memberListDiv').css("display",'none');
			//신규 테이블 show
			$('#searchResult').css("display",'block');
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
	});
}




/**
 * 목록의 네비게이션 바를 표시한다.
 * 
 * @param pageMaker
 * @returns
 */
/*function displayPageNavigation(pageMaker, sType, suffix){
	//console.log("pageMaker="+JSON.stringify(pageMaker));
	
	var prevPage = pageMaker.prevPage;
	var nextPage = pageMaker.nextPage;
	var currentPage = pageMaker.currentPage;
	var pageList = pageMaker.pageList;
	var currentPageNum = parseInt(pageMaker.currentPageNum);
	
	var ul = $('#searchResultPageNavi ul');
	ul.empty();
	
	if(prevPage != null){
		//ul.add('li').addClass('page-item');
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
			html('PREV'+parseInt(prevPage.pageNumber+1));
		link.attr('onclick','searchMember("'+sType+'",'+parseInt(prevPage.pageNumber+1)+',"'+suffix+'")');
		link.appendTo(li);
		li.appendTo(ul);
		
	}
	
	$.each(pageList, function(index, page){
		var li = $('<li class="page-item"></li>');
		if(parseInt(page.pageNumber) == (currentPageNum-1)){
			li.addClass("active");
		}
		var link = $('<a class="page-link"></a>');
		link.attr('href', 'javascript:void(0)');
		link.attr('onclick','searchMember("'+sType+'",'+parseInt(page.pageNumber+1)+',"'+suffix+'")');
		link.html(parseInt(page.pageNumber + 1));
		
		li.append(link);
		li.appendTo(ul);
	});
	
	if(nextPage != null){
		//ul.add('li').addClass('page-item');
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt(nextPage.pageNumber+1));
		link.attr('onclick','searchMember("'+sType+'",'+parseInt(nextPage.pageNumber+1)+',"'+suffix+'")');
		
		link.appendTo(li);
		li.appendTo(ul);
	}
}*/




