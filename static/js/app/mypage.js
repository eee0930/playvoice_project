//------------------------------------------------------------------------------
//								index.html
//------------------------------------------------------------------------------
/**
 * 기능: 지정한 주소(페이지 번호 포함)로 알림 페이지를 조회
 */
function searchAlarms(href) {
	$.ajax({
		type: "get",
		url: href,
		success: function(pageMaker){
			//-----------------------
			displayAlarms(pageMaker);
			displayAlarmNavigation(pageMaker);
			//-----------------------
		},
		error: function(xhr){
			alert(xhr.responseJSON.message);
		}
	});
};

/**
 * 기능: 지정한 알림은 읽었음을 서버로 전달
 * 
 */
function alarmChecked(alarmId, anchor){
	$.ajax({
		type: "get",
		url: "/message/alarm/check/" + alarmId,
		success: function(result){
			// 페이지를 바로 이동하기 때문에 추가 동작은 넣지 않는다.
		},
		error: function(xhr){
		}
	})
}

//------------------------------------------------------------------------------
//							edit_basic_profile.html 
//------------------------------------------------------------------------------

/**
 * 기능: memberId를 통해 남은 별명 변경 횟수 조회
 */
function getAliasEditCount(mid) {
	$.ajax({
		type: "get",
		url: "/mypage/profile/alias/count/" + mid,
		success: function(count){
			//[edit_basic_profile.html]-------
			displayAliasEditCount(count);
			//------------------------------
		},
		error: function(xhr){
			alert(xhr.responseJSON.message);
		}
	});
}

/**
 * 기능:별명 입력값이 별명으로써 유효한 값인지 체크
 */
function aliasCheck(alias) {
	if(alias.startsWith(".") || alias.endsWith(".")){
		return false;
	}else if(alias.replace(/[^\u002E]/g, "").length > 1){
		return false;
	}else{
		var valid = (alias.match(/[(\u0026|\u0027|\u002B|\u002C|\u002D|\u003C|\u003D|\u003E|\u005F)]/gi)==null);
		return valid;
	}
}

/**
 * 기능: memberId64에 해당하는 회원의 별명을 alias값으로 수정하기
 * 
 * @param alias
 * @param mid64
 * @returns
 */
function changeAlias(alias, mid) {
	$.ajax({
		type: "post",
		url: "/mypage/profile/alias/edit/" + mid,
		data: alias,
		contentType: "application/json",
		success:function(result){
			//--------------------------------
			popModal("별명이 변경되었습니다.");
			successChangeAlias(alias, result);
			//--------------------------------
		},
		error:function(request){
			popModal(request.responseText);
		}
	});
}

/**
 * 기능: 프로필 이미지를 입력받은 이미지 파일로 변경
 * 
 * @param obj
 * @returns
 */
function changeProfilePicture(obj){
	$.ajax({
		type:"POST",
		url:"/mypage/profile/personacon/edit",
		data:obj,
		contentType:false,
		processData:false,
		success:function(result){
			//----------------------------------
			successChangeProfilePicture(result);
			//----------------------------------
		},
		error:function(xhr){
			
		}
	})
}

/**
 * 기능: 프로필 센텐스 수정
 * 
 * @param pid
 * @param obj
 * @returns
 */
function changeProfileSentence(pid, option, obj){
	$.ajax({
		type: "post",
		url: "/mypage/profile/text/edit/" + pid + option,
		data: JSON.stringify(obj),
		contentType: "application/json",
		success:function(result){
			//--------------------------------------
			successChangeProfileSentence(obj.text);
			//--------------------------------------
		},
		error:function(request){
			popModal(request.responseText);
		}
	});
}

/**
 * 프로필 센텐스 변경 성공 후 프로필 센텐스 입력란 리셋값 수정
 */
function successChangeProfileSentence(text) {
	popModal("변경되었습니다.");
	$("#introductionHolder").val(text);
	$("#cancelProfileText_btn").click();
}


/**
 * 프로필의 별명, 사진, 텍스트를 제외한 정보를 수정한다.
 * @param jqForm
 * @returns
 */
function changeProfileEtc(jqForm){
	$.ajax({
		type: 'post',
		url: '/mypage/profile/etc/edit',
		data: $(jqForm).serialize(),
		success: function(result){
			popModal("변경되었습니다.");
		},
		error: function(xhr){
			popModal(request.responseText);
		}
	})
}

/*------------------------------------------------------------------------------
 *							view_profile.html
------------------------------------------------------------------------------*/
/**
 * 특정 주제의 사진 리스트를 가져옴
 */
function getPictures(introType, profileId) {
	$.ajax({
		url : "/mypage/profile/favorite/list/" + profileId + "/" + introType,
		type : "get",
		success : function(pictures) {
			//----------------------------
			displayGetPictures(pictures);
			//----------------------------
		},
		error : function(xhr){
			popModal(xhr.responseText);
		}
	});
};
/**
 * 프로필 주제별 사진 변경
 */
function uploadProfilePicture(file, introType, picIndex, profileId) {
	var obj = new FormData();
	obj.append("pictureFile", file);
	obj.append("picIndex", picIndex);
	obj.append("introType", introType);
	if($("#id_" + introType + picIndex).val() != undefined && $("#id_" + introType + picIndex).val().length>0){
		obj.append("pid",$("#id_" + introType + picIndex).val());
	}else{
		obj.append("pid",0);
	}
	obj.append("profileId",profileId);
	
	$.ajax({
		url : "/mypage/profile/favorite/edit",
		type : "post",
		data : obj,
		contentType : false,
		processData : false,
		success : function(picture){
			//-------------------------------------------------------
			displayUploadProfilePicture(introType, picIndex, picture);
			popModal("수정에 성공하였습니다.");
			//-------------------------------------------------------
		},
		error : function(xhr){
			popModal(xhr.responseText);
		}
	});
	
};
/**
 * 프로필 주제별 사진 삭제
 */
function deleteProfilePicture(introType, picIndex, profileId, picPath) {
	$.ajax({
		url : "/mypage/profile/favorite/del/" + profileId + "/" + introType + "/" + picIndex,
		type : "post",
		data: picPath,
		contentType: 'application/json',
		success : function(){
			//-----------------------------------------------
			successDeleteProfilePicture(introType, picIndex);
			popModal("성공적으로 삭제하였습니다.");
			//-----------------------------------------------
		},
		error : function(xhr){
			popModal(xhr.responseText);
		}
	});
};

/*------------------------------------------------------------------------------
 * 							edit_personal_info.html
 -----------------------------------------------------------------------------*/

/**
 * 입력한 비밀번호가 올바른 양식인지 검사.
 */
function isValidPassword(password) {
	return (/[0-9]/g.test(password) + /[A-z]/g.test(password)
			+ /[^A-z0-9-+*&]/g.test(password)) > 1;
}

/**
 * 비밀번호 변경 요청
 */
function changePassword(newPasswd, oldPasswd, mid) {
	$.ajax({
		type: "post",
		url: "/mypage/member/password/edit",
		data: {
			memberId: mid,
			oldPW: oldPasswd,
			newPW: newPasswd
		},
		success: function(){
			alert("비밀번호를 성공적으로 변경하였습니다.");
			//--------------------
			successChangePassword();
			//--------------------
		},
		error: function(){
			alert("비밀번호를 변경하지 못했습니다.");
		}
	});		
}
/**
 * 입력한 이메일 주소가 올바른 양식인지 검사.
 */
function isValidEmail(emailAddr) {
	return (/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/).test(emailAddr);
}

/**
 * 이메일 변경 요청
 */
function changeEmail(email, mid) {
	$.ajax({
		type: "post",
		url: "/mypage/member/email/edit",
		data: {
			email: email,
			memberId: mid
		},
		success: function(){
			alert("이메일을 성공적으로 변경하였습니다.");
			//-------------------
			successChangeEmail();
			//-------------------
		},
		error: function(){
			alert("이메일을 변경하지 못했습니다.");
		}
	});
}

/* -----------------------------------------------------------------------------
 * 							mypoint.html
 -----------------------------------------------------------------------------*/
/**
 * 주어진 좌표 배열들을 지도 상에 표시하고 선으로 잇는다.
 * 마지막 좌표를 지도의 중심으로 하고 flash point로 지정한다.
 * 
 * id: 지도가 그려질 div id값
 * coordinatesArr: [경도,위도]의 집합
 */
function drawRouteOnMap(id, coordinatesArr){
	if(!document.getElementById("olCss")){
		$("head:eq(0)").append('<link id="olCss" rel="stylesheet" href="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.0.1/css/ol.css" type="text/css">');
	}
	$.getScript("https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.0.1/build/ol.js",function(){
		var locLength = coordinatesArr.length;
		// 각 지점의 좌표들(연결선 표시용)
		var projectedCoordinates = [];
		for(var i = 0;i < locLength;i++){
			projectedCoordinates.push(ol.proj.fromLonLat(coordinatesArr[i]));
		}
		// 연결선 스타일
		var lineStyle = [
			new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#b01a2c',
					width: 2,
					lineDash:[5,5]
				})
			})
		];
		// 연결선 그리기 레이어
		var lineLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
				wrapX: false,
				features: [new ol.Feature({
					geometry: new ol.geom.LineString(projectedCoordinates),
					name: 'Line'
				})]
			}),
			style: lineStyle
		});
		// 각 지점의 좌표들(동그라미 표시용)
		var pointFeatures = [];
		for(var i = 0; i < locLength; i++){
			pointFeatures.push(new ol.Feature(
		    	new ol.geom.Point(ol.proj.transform(coordinatesArr[i], 'EPSG:4326', 'EPSG:3857'))
		    ));
	    }
	    // 좌표 동그라미 스타일
	    var circleStyle = new ol.style.Style({
	        fill: new ol.style.Fill({
	            color: '#b01a2c'
	        }),
	        stroke: new ol.style.Stroke({
	            width: 1,
	            color: '#b01a2c'
	        }),
	        image: new ol.style.Circle({
	            fill: new ol.style.Fill({
	                color: '#b01a2c'
	            }),
	            stroke: new ol.style.Stroke({
	                width: 1,
	                color: '#b01a2c'
	            }),
	            radius: 5
	        }),
	    });
	    // 동그라미 그리기 레이어
	    var circleLayer = new ol.layer.Vector({
	        source: new ol.source.Vector({
	        	wrapX: false,
	            projection: 'EPSG:4326',
	            features: pointFeatures
	        }),
	        style: circleStyle
	    });
	    // 위에서 정의한 레이어(지점, 경로)에 타일형 지도 레이어까지 더하여 화면에 표시
		var map = new ol.Map({
			target: id,
			layers: [
				new ol.layer.Tile({
					source: new ol.source.Stamen({
						wrapX: false,
						layer: 'watercolor'
					})
				}),
				new ol.layer.Tile({
					source: new ol.source.Stamen({
						wrapX: false,
						layer: 'terrain-labels'
					})
				}),
				lineLayer,
				circleLayer
			],
			view: new ol.View({
				// 지정한 좌표범위 밖으로는 지도를 움직이지 않는다.
				center: ol.proj.fromLonLat(coordinatesArr[locLength - 1]),
				extent: ol.proj.transformExtent([-180,-70,180,90],'EPSG:4326', 'EPSG:3857'),
				zoom: 5.5
			})
		});
		
		// 플래쉬 포인트 소스: 반복x
		var flashPointSource = new ol.source.Vector({
			wrapX: false
		});
		// 플래쉬 포인트 레이어
		var flashPointLayer = new ol.layer.Vector({
			source: flashPointSource,
			style: circleStyle
		});
		map.addLayer(flashPointLayer);
		var geom = new ol.geom.Point(projectedCoordinates[locLength - 1]);
		function flashPoint() {
			var feature = new ol.Feature(geom);
			flashPointSource.addFeature(feature);
		}

		var duration = 1000;
		function flash(feature) {
			var start = new Date().getTime();
			var listenerKey = circleLayer.on('postrender', animate);

			function animate(event) {
				var vectorContext = ol.render.getVectorContext(event);
				var frameState = event.frameState;
				var flashGeom = feature.getGeometry().clone();
				var elapsed = frameState.time - start;
				var elapsedRatio = elapsed / duration;
				// radius will be 5 at start and 30 at end.
				var radius = ol.easing.easeOut(elapsedRatio) * 15 + 3;
				var opacity = ol.easing.easeOut(1 - elapsedRatio);

				var style = new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: '#FF0000',
						width: 0.25 + opacity
					}),
					image: new ol.style.Circle({
						radius: radius,
						stroke: new ol.style.Stroke({
							color: 'rgba(255, 0, 0, ' + opacity + ')',
							width: 0.25 + opacity
						})
					})
				});

				vectorContext.setStyle(style);
				vectorContext.drawGeometry(flashGeom);
				if (elapsed > duration) {
					flashPointSource.clear();
					ol.Observable.unByKey(listenerKey);
					return;
				}
				// tell OpenLayers to continue postrender animation
				map.render();
			}
		}

		flashPointSource.on('addfeature', function(e) {
			flash(e.feature);
		});
		
		// 현재 탭을 사용자가 보고 있지 않을 때엔 깜빡임을 멈춘다.
		var hidden, visibilityChange; 
		if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
		  hidden = "hidden";
		  visibilityChange = "visibilitychange";
		} else if (typeof document.msHidden !== "undefined") {
		  hidden = "msHidden";
		  visibilityChange = "msvisibilitychange";
		} else if (typeof document.webkitHidden !== "undefined") {
		  hidden = "webkitHidden";
		  visibilityChange = "webkitvisibilitychange";
		}
		
		var flashPointTimer;
		if(typeof document.addEventListener != "undefined" && hidden != undefined){
			document.addEventListener(visibilityChange, handleVisibilityChange, false);
		}
		flashPointTimer = window.setInterval(flashPoint, 1000);
		function handleVisibilityChange() {
			if(document[hidden]){
				clearInterval(flashPointTimer);
			}else{
				flashPointTimer = window.setInterval(flashPoint, 1000);
			}
		}
	});
	
}

/* -----------------------------------------------------------------------------
 *								passport.html
 -----------------------------------------------------------------------------*/

/**
 * 특정 페이지의 스탬프들을 조회
 */
function getStampPage(memberId, pageNum) {
	$.ajax({
		type: "get",
		url: "/mypage/passport/" + memberId,
		data: {pageNum: pageNum},
		success: function(pageMaker){
			//----------------------------------
			displayPassportStampPage(pageMaker);
			//----------------------------------
		}
	})
};

/* -----------------------------------------------------------------------------
 *								comment_diary.html
 -----------------------------------------------------------------------------*/
/**
 * 특정 페이지의 나의 댓글들을 조회
 */
function getReplyPage(memberId, pageNum, viewSideNum) {
	$.ajax({
		type: "get",
		url: "/mypage/journey/log/" + memberId,
		data: {pageNum: pageNum},
		success: function(pageMaker){
			//--------------------------
			displayReplyPage(pageMaker, viewSideNum);
			//--------------------------
		}
	})
}
/* -----------------------------------------------------------------------------
 *								journey.html
 -----------------------------------------------------------------------------*/
/**
 * 지정한 한 달 간의 학습내역 조회
 * startDateNum: 조회할 달의 첫날(yyyyMMdd)
 */
function getJourneyInMonth(startDateNum){
	$.ajax({
		type: 'get',
		url: '/mypage/journey/study/' + startDateNum,
		success: function(monthlyStudies){
			//-----------------------------
			displayCalendar(monthlyStudies);
			//-----------------------------
		},
		error: function(xhr){
			alert('학습내역을 불러오지 못했습니다.')
		}
	})
}