//----------------------------------
//		view_article.html
//----------------------------------

/**
 * 게시글에 대한 '좋아요'처리
 */
function handleLike(obj){
	$.ajax({
		type:'post',
		url: '/board/article/like/'+ obj.contentId,	//articleId
		data:JSON.stringify(obj), 
		dataType:'json',
		contentType: "application/json",
		success: function(result){
			successHandleLike(result);
		},
		error: function(e){
			alert("처리중 에러가 발생하였습니다.\n"+JSON.stringify(e));
			console.log("ERROR : ", e);
			return;
		}
	});
}

/**
 * 게시글 '삭제' 처리
 */
function deleteArticle(obj){
	$.ajax({
		type:'post',
		url: '/board/article/del/'+ obj.articleId,
		data:JSON.stringify(obj), 
		dataType: 'text',
		contentType: "application/json",
		success:function(){
			successDeleteArticle(obj.boardAlias);
		},
		error: function(e){
			alert("처리 중 에러가 발생하였습니다.\n"+JSON.stringify(e));
		}
	});
}



//----------------------------------
//		list_replies.html
//----------------------------------

/**
 * 댓글 입력 처리
 * @param replyResource
 * @returns
 */
function addComment(replyResource){
	$.ajax({
		type:'post',
		url: '/reply/board/add/'+ replyResource.articleId,
		data:JSON.stringify(replyResource), 
		dataType:'json',
		contentType: "application/json",
		success:function(result){
			successAddComment(replyResource.articleId);
		}
	});
}


/**
 * 대댓글 입력 처리
 * @param replyResource
 * @returns
 */
function addReComment(replyResource){
	$.ajax({
		type:'post',
		url: '/reply/board/add/'+ replyResource.articleId,
		data:JSON.stringify(replyResource), 
		dataType:'json',
		contentType: "application/json",
		success:function(result){
			successAddReComment(replyResource.articleId);
		}
	});
}


/**
 * 댓글 및 대댓글에 대한 '좋아요'처리
 */
function handleCommentLike(obj, thisObj){
	$.ajax({
		type:'post',
		url: '/reply/board/like/'+ obj.contentId,	//reply.rid
		data:JSON.stringify(obj), 
		dataType:'json',
		contentType: "application/json",
		success: function(result){
			successHandleCommentLike(result, thisObj);
		},
		error: function(e){
			alert("처리중 에러가 발생하였습니다.\n"+JSON.stringify(e));
			console.log("ERROR : ", e);
			return;
		}
	});
}


/**
 * 댓글 및 대댓글에 대한 '싫어요'처리
 */
function handleCommentDislike(obj, thisObj){
	$.ajax({
		type:'post',
		url: '/reply/board/dislike/'+ obj.contentId,	//reply.rid
		data:JSON.stringify(obj), 
		dataType:'json',
		contentType: "application/json",
		success: function(result){
			successHandleCommentLike(result, thisObj);
		},
		error: function(e){
			alert("처리중 에러가 발생하였습니다.\n"+JSON.stringify(e));
			console.log("ERROR : ", e);
			return;
		}
	});
}

/**
 * 댓글 및 대댓글에 대한 '삭제'처리
 */
function handleCommentDelete(rid){
	$.ajax({
		type:'post',
		url: '/reply/board/del/'+ rid,	//reply.rid
		success: function(result){
			successHandleCommentDelete(rid);
		},
		error: function(xhr){
			alert("처리중 에러가 발생하였습니다.\n" + xhr.responseText);
		}
	});
}

