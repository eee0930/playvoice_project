//----------------------------------------
//	admin/stamp/list_stamp.html
//----------------------------------------

/**
 * 이미지 미리보기 
 */
function handleImagefile(e){
   var files = e.target.files;
      var fileArr = Array.prototype.slice.call(files);
      var prevProfImage = $(".imageDiv");
      
      fileArr.forEach(function(f){
         var reader = new FileReader();
         reader.onload = function(e) {
            prevProfImage.css("background", "url(" + e.target.result + ") no-repeat")
                      .css("background-size", "cover")
                      .css("background-position", "center");
         }
         reader.readAsDataURL(f);
      }); 
};

function listStamp(select){
	
	$.ajax({
		type: "GET", 
		url : '/admin/stamp/list',
		success : function(page){
			console.log('success');

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			
			select.html($(page).find('#stampListDiv'));
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
	});
}

/**
 * 검색된 목록의 내용(image 부분)을 클릭했을 때 상세보기 폼으로 복사
 * 
 * @param obj 스탬프 목록 테이블에서 한 td
 * @returns
 */
function pickUpStampInfo(obj) {
	var stampTr = obj.parent().parent();
	var stampNo = stampTr.children().first();
	var sid = stampNo.next();
	var title = sid.next();
	var imagePathTd = title.next(); 
	var imagePath = imagePathTd.children().children().attr("src");
	var stampValue = imagePathTd.next();
	var stampType = stampValue.next();
	var description = stampType.next();
	var regDate = description.next();
	
	$('#editStampForm #sid').val(sid.text());
	$('#editStampForm #title').val(title.text());
	
	$('#editStampForm .imageDiv')
		.css("background", "url(" + imagePath + ") no-repeat")
	    .css("background-size", "cover")
	    .css("background-position", "center")
	    
	$('#editStampForm #stampValue').val(stampValue.text());
	$('#editStampForm #description').val(description.text());
	$('#editStampForm #regDate').text(regDate.text());
	
	//select박스의 stampType선택하기
	$('#editStampForm #stampType').find("option").each(function(i,opt){
		if($(opt).text() == stampType.text()){
			$(opt).prop("selected", true);
		}else{
			$(opt).prop("selected", false);
		}
	});
	
	//이미지 수정폼에도 hidden으로 sid값 넣어주기. 이미지 수정과 기타 정보 수정 form이 다름
	$('#editStampImageForm #sid').val(sid.text());
}

/**
 * 이미지를 제외한 Stamp정보를 수정하는 경우
 * 	admin/stamp/list_stamps.html의 $('#editStampBtn').click()안에서 호출
 * 
 * editStampForm안에 있는 sid, title, stampType, description 정보를 전송
 * 
 * @returns
 */
function updateStamp(){
	var data = $('#editStampForm').serialize();
	
	$.ajax({
		type: "POST", 
		url : '/admin/stamp/edit',
		data : data, 
		success : function(pageMaker){
			console.log('success');

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			
			$('#eidtStampFormContainer .successBtn').show();
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
	});
}

/**
 * 기타 Stamp정보를 제외하고 이미지파일만 수정하는 경우
 * 	admin/stamp/list_stamps.html의 $('#editStampImageBtn').click()안에서 호출
 *
 * editStampImageForm안에 있는 sid와 이미지파일 정보를 전송
 * 
 * @returns
 */
function updateStampImage(){
	var form = $('#editStampImageForm')[0];
	var data = new FormData(form);
	
	$.ajax({
		type: "POST", 
		url : '/admin/stamp/image/edit',
		enctype: 'multipart/form-data', 
		data : data, 
		cache: false,
        processData: false,
        contentType: false, 
		success : function(pageMaker){
			console.log('success');

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			
			$('#eidtStampFormContainer .successBtn').show();
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
	});
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