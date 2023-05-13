/** 
 * 검색폼을 통한 검색 전송시 ajax 를 통해 결과 목록을 PageMaker:json로 전달받는다.
 * 	전송방식은 세가지 사용자 인터페이스를 갖는다.
 * 	1. 검색버튼을 이용한 최초 전송과 그 이후 
 * 	2. 목록 페이지를 선택하여 전송
 * 	3. 테이블에서 컬럼 정렬을 선택하여 전송
*/
function searchSentence(searchType, page, suffix){
	//alert("searchSentence....in sentencebook.js");
	//alert("Search...\nsearchType1="+searchType+", searchType2="+$('#searchType').val()+", sortName="+$('#sortName').val()+", page="+page);
	//alert("suffix="+suffix);
	
	if(page==undefined){
		page = 1;
	}
	
	var sType = searchType;
	if(sType==undefined){
		sType=$('#searchFormHidden_'+suffix+' #searchType').val();
	}
	
	//alert("asc="+$('#searchFormHidden_'+suffix+' #asc').val());
	//alert("Search...\nsearchType1="+sType+", sortName="+$('#sortName').val()+ ", asc="+$('#asc').val()+", page="+page+", suffix="+suffix);
		
	$.getJSON({
		//type: "GET",
		url : '/admin/sentenceBook/search',
		data : {
			searchType : sType,
			keyword : $('#keyword').val().trim(),
			fromDate : $('#fromDate').val(),
			toDate : $('#toDate').val(),
			page : page,
			sortName : $('#searchFormHidden_'+suffix+' #sortName').val(),
			asc : $('#searchFormHidden_'+suffix+' #asc').val()
		},
		success : function(result){
			//resetDefault();
			
			var page = result.result;
			displaySentenceList(page.content, result.currentPageNum, page.totalElements, suffix);				
			displayPageNavigation(result, sType, suffix);

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			//기존 테이블 닫기
			$('#sentenceListDiv').css("display",'none');
			//신규 테이블 show
			$('#searchResult_'+suffix).css("display",'block');
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
	});
}


/**
 * 센텐스 목록에서 테이블 헤더를 통한 컬럼 정렬을 수행할 경우 ajax를 통해 전송받은
 * 센텐스 목록을 출력한다.
 * 
 * @param sentenceList
 * @param currentPageNum
 * @param total
 * @returns
 */
//ajax로 전송한 요청에 대한 결과셋 테이블 표시

function displaySentenceList(sentenceList, currentPageNum, total, suffix){
	
	$('#searchResultTable_'+suffix).children('tbody').children("tr").remove();
	//alert("suffix="+suffix);
	//alert("sentenceList="+sentenceList);
	//$('#searchResultTable_'+suffix).css('background', 'red');
	
	var page = $("#page").val();
	var output = ''
	var num=1;	
	var fetchSize = 20;//$('#h_size').val();
	$.each(sentenceList, function(index, sentence){
		num = (total-index)-(currentPageNum-1)*fetchSize;
		
		//index++;
		var regDate = new Date(sentence.regDate);
		output += '<tr>';
		/* output += '<td>'+parseInt(index+(currentPageNum-1)* 20)+'</td>'; */
		output += '<td>'+num+'</td>';
		output += '<td>'+sentence.sid+'</td>';
		output += '<td class="text-left"><a href="javascript:void(0)" class="sentenceDetail">'+sentence.eng+'</a>';
		output += '<input type="hidden" value="'+sentence.kor+'"/></td>';
		output += '<td class="text-left" style="display: none">'+sentence.kor+'</td>';
		output += '<td>'+sentence.voiceExist +'</td>';
		output += '<td>'+sentence.cateExist+'</td>';
		output += '<td class=\"t-reference\">'+sentence.source+'</td>';
		output += '<td>'+sentence.firstWriter+'</td>';
		output += '<td>'+regDate.getFullYear()+"-"+parseInt(regDate.getMonth() +1)+"-"+regDate.getDate()+'</td>';
		output += '</tr>';
		$('#searchResultTable_'+suffix+' > tbody:last').append(output)
		output =''; 
	});
}

/**
 * 목록의 네비게이션 바를 표시한다.
 * 
 * @param pageMaker
 * @returns
 */
function displayPageNavigation(pageMaker, sType, suffix){
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
		link.attr('onclick','searchSentence("'+sType+'",'+parseInt(prevPage.pageNumber+1)+',"'+suffix+'")');
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
		link.attr('onclick','searchSentence("'+sType+'",'+parseInt(page.pageNumber+1)+',"'+suffix+'")');
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
		link.attr('onclick','searchSentence("'+sType+'",'+parseInt(nextPage.pageNumber+1)+',"'+suffix+'")');
		
		link.appendTo(li);
		li.appendTo(ul);
	}
}




//논리적 위치 : src=/resource/voicebook/2018/10/10/xxx.mp3


var audio;
function playVoice(vpath, play){
	play.style.display='none';
	var stop = play.nextElementSibling;
	stop.style.display='inline';

	try {
		audio = new Audio(vpath);
		var i=3;
		var timeout;
		audio.addEventListener('ended',function(){
			//audio.currentTime=0;
			clearTimeout(timeout);
			timeout=setTimeout(function() {
				if(i > 1){
					i--;
					audio.play();
					if(i==1){
						play.style.display='inline';
						stop.style.display='none';
					}
				}			
			}, 20)
			
		});
		
		audio.play();
	} catch (e) {
		// TODO: handle exception
		alert('파일을 찾을 수 없습니다.');
	}
	
};

function stopVoice(stop){
	stop.style.display='none';
	stop.previousElementSibling.style.display='inline';
	
	if(audio!=null){  //audio 변수에 음성 객체가 있다면
		if(!audio.paused){  //멈춤 상태가 아닐 시 
			audio.pause();  //재생을 정지.
		}
		audio = null;
	}
}


/**
 * 페이지 내 이동
 * 
 * ex) window.scroll(0, getOffsetTop(document.getElementById("editSentenceForm")));
 * @param el
 * @returns
 */
function getOffsetTop(el) { 
	var top = 0; 
	if (el.offsetParent) { 
		do { 
			top += el.offsetTop; 
		} while (el = el.offsetParent); 
		return [top]; 
	} 
}

//----------------------------------------
//	list_sentences.html & 
//	search_sentences_page.html
//----------------------------------------

/**
 * 검색된 목록의 내용(eng 부분)을 클릭했을 때 상세보기 폼으로 복사
 */
function pickUpSentenceInfo(obj){
	var sentenceTr = obj.parent().parent();
	var sentenceNo = sentenceTr.children().first();
	var sid = sentenceNo.next();
	var eng = sid.next();
	//var kor = eng.children().eq(1);
	//alert("kor="+kor.val());
	var kor = eng.next();
	var voiceExist = kor.next();
	var cateExist = voiceExist.next();
	var source = cateExist.next();
	var firstWriter = source.next();
	var regDate = firstWriter.next();
	
	$('#sid').val(sid.text());	
	$('#eng').val(eng.text().trim());
	$('#kor').val(kor.text().trim());
	$('#voiceExist').val(voiceExist.text());
	$('#cateExist').val(cateExist.text());
	$('#source').val(source.text());
	$('#firstWriter').val(firstWriter.text());
	$('#regDate').text(regDate.text());
}

function pickUpSentenceInfoFromVoiceInfo(obj){
	var sentenceTr = obj.parent().parent();
	var sentenceNo = sentenceTr.children().first();
	var vid = sentenceNo.next();
	var eng = vid.next();	
	var kor = eng.next();
	var voiceExist = kor.next();
	var cateExist = voiceExist.next();
	var source = cateExist.next();
	var firstWriter = source.next();
	var regDate = firstWriter.next();
	
	$('#sid').val(vid.text().substring(0, vid.text().indexOf("_")));
	$('#eng').val(eng.text().trim());
	$('#kor').val(kor.text().trim());
	$('#voiceExist').val(voiceExist.text());
	$('#cateExist').val(cateExist.text());
	$('#source').val(source.text());
	$('#firstWriter').val(firstWriter.text());
	$('#regDate').text(regDate.text());
}

/**
 * 해당 예문의 보이스 목록 출력
 */
function displayVoiceList(sentenceId){
	$.getJSON("/admin/voiceBook/list/"+sentenceId, function(result){
		//var voiceResourcePath=[[@{/resource/voice/}]];
		var voiceResourcePath="/resource/voice/";
		
		//console.log("result="+JSON.stringify(result));
		$('#voiceList').empty();
		
		result.forEach(function(voice, index) {
			var tr = document.createElement("tr");
			tr.className = "contents";
			
			var demo="";
			if(voice.demo ==true){
				demo='<i class="fas fa-check"></i>';
			}
			
			tr.innerHTML +=
			"<td>"+voice.vid+"</td>"
			+"<td>"+demo+"</td>"
			+"<td>"+voice.voiceType+"</td>"
			+"<td>"+voice.voiceRate+"</td>"
			+"<td>"+voice.voiceSex+"</td>"
			+"<td>"+voice.accent+"</td>"
			+"<td>"+voice.source+"</td>"
			+"<td><i class='fas fa-volume-up' onclick='playVoice(\""+voiceResourcePath+voice.path+"\", this)'>"
			+"</i><i class=\'fas fa-stop\' onclick=\'stopVoice(this)\' style=\'display:none\'></i></td>"
			+"<td>"+voice.regDate+"</td>"
			+"<td><i class=\"fas fa-edit\" onclick=\"showVoiceForm(this)\"></i> " 
			+"<i class=\"fas fa-file-excel\" onclick=\"changeVoiceFile('"+voice.vid+"')\"></i> "
			+"<i class=\"fas fa-trash-alt\" onclick=\"deleteVoiceFile('"+voice.vid+"')\"></i>"
			+"<i class=\"fas fa-plus\" data-action=\"add\" onclick=\"addNewVoiceFile('"+sentenceId+"')\"></i></td>"
			+"<td style='display:none'>"+voice.description+"</td>"
			$('#voiceList').append(tr);
		});
		$('[data-toggle="tooltip"]').tooltip();
	});
}


//----------------------------------------
//			list_sentences.html
//----------------------------------------

function clearWhiteElement(elem){
    elem = elem || document;
   
    alert("elem="+elem);
    
    var childs = elem;//elem.childNodes;
    var length = childs.length;
    alert("length="+length);
    
    for (var i = 0; i < length; i++){
        var child = childs[i];
        if (child) {
        	 alert("child="+child);
            if (child.nodeType === 3 && !/\S/.test(child.nodeValue)){
                elem.removeChild(child);
            }
            else if(child.nodeType === 1) {
                clearWhiteElement(child);
            }
        }
        else{
            var n = next(elem);
            if (n) clearWhiteElement(n);
        }
    }
}

function next(elem){
    do{
        elem = elem.nextSibling;
    }
    while(elem && elem.nodeType !== 1)
    return elem;
}

var removeWhiteSpaceNodes = function ( parent ) {
	var nodes = parent.childNodes;
	console.log("target parent="+parent+ ", test nodes="+nodes+", lengh="+nodes.length);

    for( var i =0, l = nodes.length; i < l; i++ ){
      if( nodes[i] && nodes[i].nodeType == 3 && !/\S/.test( nodes[i].nodeValue ) ){
        parent.replaceChild( document.createTextNode(''), nodes[i]  );
      }else if( nodes[i] ){
        removeWhiteSpaceNodes( nodes[i] );
      }
    }
    return parent;
  }


jQuery.fn.htmlClean = function() {
    this.contents().filter(function() {
        if (this.nodeType != 3) {
            $(this).htmlClean();
            return false;
        }
        else {
            this.textContent = $.trim(this.textContent);
            return !/\S/.test(this.nodeValue);
        }
    }).remove();
    return this;
}


/**
 * 보이스 수정폼 출력
 */
function showVoiceForm(obj){
	var index = obj.getAttribute('data-index');
	//$('#editVoiceForm').css('display', 'block');
	$('#editVoiceForm_'+index).css('display', 'block');
	
	
	//var children = obj.parentNode.parentNode.childNodes;//tr
	var children = obj.parentElement.parentElement.children
	var val='';
	for(var i = 0 ; i < children.length ; i++){
		val += i+"="+children[i].innerHTML+"\n";
	}
	
	//document.getElementsByName('vid')[0].value = children[0].innerHTML;
	$('#editVoiceForm_'+index+' [name="vid"]').val(children[0].innerHTML);
	
	
	if(children[1].innerHTML != ''){
		//document.getElementsByName('demo')[0].checked=true;
		$('#editVoiceForm_'+index+' [name="demo"]').attr('checked',true);
	}else{
		$('#editVoiceForm_'+index+' [name="demo"]').attr('checked',false);
	}
	
	//var radioBtns = document.getElementsByName("voiceType");
	var radioBtns = $('#editVoiceForm_'+index+' [name="voiceType"]');
	for(var i=0; i < radioBtns.length; i++){
		if(radioBtns[i].value == children[2].innerHTML){
			radioBtns[i].checked = true;
		}
	}
	
	//radioBtns = document.getElementsByName("voiceRate");
	radioBtns = $('#editVoiceForm_'+index+' [name="voiceRate"]');
	for(var i=0; i < radioBtns.length; i++){
		if(radioBtns[i].value == children[3].innerHTML){
			radioBtns[i].checked = true;
		}
	}
	
	//radioBtns = document.getElementsByName("voiceSex");
	radioBtns = $('#editVoiceForm_'+index+' [name="voiceSex"]');
	for(var i=0; i < radioBtns.length; i++){
		if(radioBtns[i].value == children[4].innerHTML){
			radioBtns[i].checked = true;
		}
	}
	
	//radioBtns = document.getElementsByName("accent");
	radioBtns = $('#editVoiceForm_'+index+' [name="accent"]');
	for(var i=0; i < radioBtns.length; i++){
		if(radioBtns[i].value == children[5].innerHTML){
			radioBtns[i].checked = true;
		}
	}
	
	//document.getElementsByName('source')[1].value = children[6].innerHTML;
	$('#editVoiceForm_'+index+' [name="source"]').val(children[6].innerHTML);
	
	//document.getElementsByName('description')[0].value = children[10].innerHTML;
	$('#editVoiceForm_'+index+' [name="description"]').val(children[10].innerHTML);
}

/**
 * 보이스 정보 수정하기
 */
function updateVoice(vid){
	var params = $("#editVoiceForm").serialize();
	//alert(params);
	//var csrf = JSON.parse('[[${_csrf}]]');
	$.ajax({
		type: 'POST',
		url: '/admin/voiceBook/edit/'+vid,
		data:params,
		/*beforeSend : function(xhr){
			xhr.setRequestHeader(csrf.headerName, csrf.token);
		},*/
		success: function (sid) {
			alert(sid+" changed.");
			
			//업데이트된 voice를 voice목록에서 재확인할 수 있도록 한다.
			displayVoiceList(sid);
			$('#editVoiceForm').css('display', 'none');
		}
	});
}

/**
 * 기존 보이스 파일 변경하기
 */
function changeVoiceFile(vid){
	window.open("/admin/voiceBook/changeFile/"+vid, "changeVoiceWindow", 
		"width=700, height=500, toolbar=no, menubar=no, scrollbars=no, resizable=yes" );  

}

/**
 * 기존 보이스 파일 삭제하기
 */
function deleteVoiceFile(vid){
	var result = Boolean(confirm("삭제할까요"));	
	if(result){
		//var csrf = JSON.parse('[[${_csrf}]]');
		var obj = {
			vid:vid, 
			//csrf:csrf
		};
		
		$.ajax({
			type: 'POST',
			url: '/admin/voiceBook/delete/'+vid,
			data:JSON.stringify(obj),
			/*beforeSend : function(xhr){
				xhr.setRequestHeader(csrf.headerName, csrf.token);
			},*/
			success: function (sid) {
				alert(sid+" changed.");
				
				//업데이트된 voice를 voice목록에서 재확인할 수 있도록 한다.
				displayVoiceList(sid);
				$('#editVoiceForm').css('display', 'none');
			}
		});
	}
	
}

function addNewVoiceFile(sentenceId){
	window.open("/admin/voiceBook/add/"+sentenceId, "addVoiceWindow", 
	"width=700, height=700, toolbar=no, menubar=no, scrollbars=no, resizable=yes" );  
}




