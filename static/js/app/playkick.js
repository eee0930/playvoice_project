/**-----------------------------------------------------------------------------
								Detective Julie
 -----------------------------------------------------------------------------*/
/**
 * @ author 송화연
 */
var detectiveJs = function(julieQ){
	
	var question = null;
	var answerNum = 0;
	var answerText = null;
	var engQuestion = null;
	var randomAnswer = [];
	var julieVoicePath = null;
	var wordView = null;
	var score = 4;
	
	class DetectiveController {
		constructor(julieQ){
			question = julieQ;
			if(question.jungleSentenceId != null && question.jungleSentenceId > 0) {
				julieVoicePath = question.jungleSentenceId;
				setVoiceHint(julieVoicePath);
			} else {
				setVoiceHint(null);
			}
		}
		// 한글 퀴즈 정답 확인
		checkDetectiveKorAnswer(questionNum, $selectedDiv) {
			answerNum = question.answerNum;
			engQuestion = question.blankEng;
			
			displayEngQuestion(engQuestion);
			
            displayKorCheck((answerNum == questionNum), answerNum, $selectedDiv);


		}
		
		// 영어 알파벳 퀴즈 정답 확인
		checkDetectiveEngAnswer(userAnswer) {
			answerText = question.answerText.toLowerCase();
			userAnswer = userAnswer.toLowerCase();
			if(userAnswer == answerText) {
				openKissAndCry(true);
			} else {
				openKissAndCry(false);
				displayWrongSpellCheck(answerText);//잘못적은 스펠링 체크 표시
			}
		}
		
		// 탐정 줄리 힌트 보여주기
		// 1. 알파벳 두 자 힌트 확인
		useAlphabetHint(blankNum) {
			score = 2;
			answerText = question.answerText;
			var hintText1 = answerText.substring(blankNum, blankNum + 1);
			var hintText2 = answerText.substring(blankNum + 1, blankNum + 2);
			displayTwoAlphabet([
				{index: blankNum, text: hintText1},
				{index: blankNum + 1, text: hintText2}
			]);
		}
		// 2. 랜덤 스펠링 힌트 보여주기
		useRandomSpellingHint() {
			score = 1;
			randomAnswer = question.randomAnswerText;
			displayRandomSpells(randomAnswer);
		}
		// 3. 음성 힌트 재생하고 획득 포인트 깎기
		useVoiceHint() {
			score = 0;
		}
		
		// 정답 단어와 문장 찾아서 키스 앤 크라이에 표시
		displayWordAndAnswer() {
			wordView = question.wordView;
			displayWordView(wordView);
			
			var answerTexts = question.answerText.split('');
			displayAnswer(answerTexts);
		}
		
		// 수갑 개수 전송 후 다음 문제 세팅
		submitHandcuff(cuffNum) {
			var playType = location.pathname.split('/').pop().substring(0,1);
			$.ajax({
				url: '/pictionary/kick/detective/play/' + playType + '/' + cuffNum,
				type: 'post',
				contentType: 'application/json;charset=UTF-8',
				success: function(nextQuestion) {            
					displayJulieQuestion(nextQuestion);
					question = nextQuestion;
					if(question.jungleSentenceId != null && question.jungleSentenceId > 0) {
						julieVoicePath = question.jungleSentenceId;
						setVoiceHint(julieVoicePath);
					} else {
						setVoiceHint(null);
					}
					score = 4;
				},
				error: function(xhr) {
					alert('현황을 저장하지 못 했습니다. 로그인을 확인하거나 잠시 뒤 재시도 해주세요.');
				}
			});
		}
		
		// 검거 결과 전송
		sendArrestResult(correct){
			var arrestResult = {
				psentenceId: question.jid,
				wordId: question.wordView.id,
				arrested: correct,
				rp: correct ? score : -2
			}
			$.ajax({
				url: '/pictionary/kick/detective/arrest',
				type: 'post',
				data: JSON.stringify(arrestResult),
				contentType: 'application/json;charset=UTF-8',
				success: function(){
					
				},
				error: function(xhr){
					alert('현황을 저장하지 못 했습니다. 로그인을 확인하거나 잠시 뒤 재시도 해주세요.');
				}
			})
		}
		
		// 퀴즈 도중 끝내기
		quitQuiz(){
			$.ajax({
				url: '/pictionary/kick/detective/escaped',
				type: 'post',
				contentType: 'application/json;charset=UTF-8',
				success: function(){
					
				},
				error: function(xhr){
					alert('현황을 저장하지 못 했습니다.');
				}
			});
			return true;
		}
		
		// 테스트를 종료하고 결과 화면으로 이동
		endDetective($form) {
			setJulieSessionStorage();
			$(window).off('beforeunload');
			$form.submit();
		}
	}
	
	
	
	return new DetectiveController(julieQ);
}











/**-----------------------------------------------------------------------------
							Egg Shot
 -----------------------------------------------------------------------------*/
var eggShotJs = function(arg1, arg2) {

	var sound_shoot = new Audio();
	//=================================================== 
	var sound_cooking = new Audio();	//한 단어 성공 
	var sound_crack = new Audio();		//한 단어 실패 
	var sound_clap = new Audio();		//한 문장 생명 1개로 성공 
	var sound_trumpet = new Audio();	//한 문장 생명 2개로 성공 
	var sound_yeah = new Audio();		//한 문장 생명 3개로 성공 
	var sound_hing = new Audio();		//한 문장 실패 
	var sound_playing = new Audio();			// 재생 중인 소리
	//===================================================
	var questions = [];
	var question = null, tokens = [], strike = 0, correctNum;
	var rightNum = 0, wrongNum = 0;
	var sentenceSwResultList = [];
	var currentRound = null;
	class EggShotController {
		constructor(arg1, arg2) {
			questions = arg1 || questions;
			this.leftCount = questions.length;
			currentRound = arg2;
			if (arg2 != null) {
				delete currentRound.regDate;
				delete currentRound.updateDate;
				currentRound.roundRp = 0;
			}
		}
		// 퀴즈 시작 세팅. 효과음 로드
		start() {
			sound_shoot.src = '/sounds/shoot.mp3';
			sound_shoot.load();
			//===================================================
			sound_cooking.src = '/sounds/cooking.mp3';
			sound_cooking.load();
			sound_crack.src = '/sounds/egg_crack.mp3';
			sound_crack.load();
			sound_clap.src = '/sounds/clap.mp3';
			sound_clap.load();
			sound_trumpet.src = '/sounds/trumpet.mp3';
			sound_trumpet.load();
			sound_yeah.src = '/sounds/yeah.mp3';
			sound_yeah.load();
			sound_hing.src = '/sounds/hing.mp3';
			sound_hing.load();
			//===================================================
			this.setQuiz();
		}
		// 퀴즈 문제배열에서 한 문제를 가져와서 화면 셋팅 퀴즈 문제 배열은 크기가 1 줄어든다.
		setQuiz() {
			question = questions.shift();
			this.leftCount--;
			correctNum = 0;
			//------------------------------------------------------
			setQuizDisplay({
				tokens: Array.from(question.randomTokens, function(elt) {
					return elt.name;
				}),
				kor: question.kor,
				time: (1.3 * question.randomTokens.length
					+ 0.85 * Math.pow(question.randomTokens.length, 2)).toFixed(2)
			});
			//------------------------------------------------------
			tokens = Array.from(Array.from(question.randomTokens)
				.sort(function(a, b) { return a.index - b.index; }), function(elt) {
					return elt.name;
				});
		}
		// 에그샷의 사운드 리소스 재생
		playSound(name) {
			if (sound_playing.duration > 0 && !sound_playing.paused) {
				sound_playing.pause();
				sound_playing.currentTime = 0;
			}
			switch (name) {
				case 'shoot':
					sound_playing = sound_shoot;
					break;
				//===================================================
				case 'hit':
					sound_playing = sound_cooking;
					break;
				case 'miss':
					sound_playing = sound_crack;
					break;
				case 'success0':
					sound_playing = sound_yeah;
					break;
				case 'success1':
					sound_playing = sound_trumpet;
					break;
				case 'success2':
					sound_playing = sound_clap;
					break;
				case 'fail':
					sound_playing = sound_hing;
					break;
				//===================================================
				default:
					break;
			}
			sound_playing.play();
		}
        /**
         * 선택한 단어와 정답 비교.
         * choice: 선택한 단어 인덱스
         * target: 대상 빈칸 인덱스
         *
         * return 'complete'=모두 정답, 'fail'=기회 모두 소진, 'correct'=맞춤, 'incorrect'=틀림
         * */
		compareAnswer(choice, target) {
			var correct = tokens[target] == question.randomTokens[choice].name;
			if (correct) {
				correctNum++;
			}
			else {
				strike++;
			}
			// 모두 맞추거나 기회를 모두 소진
			if (correctNum == tokens.length) {
				this.calcProtein();
				return 'complete';
			}
			else if (strike == 3) {
				this.calcProtein();
				return 'fail';
			}
			else {
				return correct ? 'correct' : 'incorrect';
			}
		}
		// 한 문장의 점수 계산
		calcProtein() {
			switch (strike) {
				case 0:
					currentRound.roundRp += 2;
					rightNum++;
					sentenceSwResultList.push({
						sentenceId: question.sentenceId
					});
					break;
				case 1:
					currentRound.roundRp += 1;
					sentenceSwResultList.push({
						sentenceId: question.sentenceId
					});
					rightNum++;
					break;
				case 2:
					currentRound.roundRp += 0;
					rightNum++;
					sentenceSwResultList.push({
						sentenceId: question.sentenceId
					});
					break;
				case 3:
					currentRound.roundRp -= 5;
					wrongNum++;
					sentenceSwResultList.push({
						sentenceId: question.sentenceId,
						wrongSpeak: true
					});
					break;
			}
		}
		// 강제로 문제 틀림 처리
		forceFail() {
			strike = 3;
			this.calcProtein();
			this.showResult(false);
		}
		// 결과 화면 표시
		showResult(success) {
			var successHTML;
			if (success) {
				switch (strike) {
					case 0:
						//============================
						//this.playSound('success0');
						//============================
						successHTML = 'Awesome !! <i class="far fa-grin-stars"></i>';
						break;
					case 1:
						//============================
						//this.playSound('success1');
						//============================
						successHTML = 'Great ! <i class="far fa-laugh-squint"></i>';
						break;
					case 2:
						//============================
						//this.playSound('success2');
						//============================
						successHTML = 'Cool ! <i class="far fa-grin-alt"></i>';
						break;
					default:
						//============================
						//this.playSound('fail');
						//============================
						successHTML = 'Fail <i class="far fa-sad-cry"></i>';
						break;
				}
			}
			else {
				//============================
				//this.playSound('fail');
				//============================
				successHTML = 'Fail <i class="far fa-sad-cry"></i>';
			}
			strike = 0;
			var resultContent = {
				roundEnd: questions.length == 0,
				sentence: {
					sentenceId: question.sentenceId,
					eng: question.eng,
					emLoc: question.emLoc
				},
				rightNum: rightNum,
				wrongNum: wrongNum,
				resultClass: success ? 'right' : 'wrong',
				successHTML: successHTML,
				totalRp: currentRound.totalRp
			};
			$.ajax({
				type: 'get',
				url: '/sentenceBook/level/' + question.sentenceId,
				success: function(sentenceLevel) {
					resultContent.sentenceLevel = sentenceLevel;
				},
				error: function(xhr) {
				},
				complete: function() {
					if (sound_playing.duration > 0 && !sound_playing.paused) {
						sound_playing.pause();
						sound_playing.currentTime = 0;
					}
					showResultDisplay(resultContent);
				}
			});
		}
        /**
         * 테스트 도중 진행 상황을 서버로 전송한다.
         */
		submitInProgress() {
			currentRound.totalRp += currentRound.roundRp;
			currentRound.sentenceSwResultList = sentenceSwResultList;
			$.ajax({
				url: '/playvoiceBook/kick/egg/escaped',
				type: 'post',
				data: JSON.stringify(currentRound),
				contentType: 'application/json;charset=UTF-8',
				success: function() {
					alert('현재까지의 프로틴지수를 저장했습니다.');
				},
				error: function(xhr) {
					alert('현황을 저장하지 못 했습니다. 로그인을 확인하거나 잠시 뒤 재시도 해주세요.');
				}
			});
			return true;
		}
        /**
             * 테스트를 종료하고 결과 화면으로 이동한다.
             */
		submitResult($form) {
			currentRound.totalRp += currentRound.roundRp;
			currentRound.sentenceSwResultList = sentenceSwResultList;
			
			sessionStorage.setItem('eggShotRightCount', rightNum);
			sessionStorage.setItem('eggShotWrongCount', wrongNum);
			sessionStorage.setItem('eggShotProtein', currentRound.roundRp);
			
			appendData($form[0], currentRound);
			$(window).off('beforeunload');
			$form.submit();
		}
	}

	return new EggShotController(arg1, arg2);
}



/* ----------------------------------------------------------------------------
 * 				kick/toiletto/start.html
 * ---------------------------------------------------------------------------*/

function checkToiletto(userTicket) {

	$.ajax({
		url: '/kick/toiletto/check',
		type: 'post',
		data: JSON.stringify(userTicket),
		dataType: 'json',
		contentType: 'application/json;charset=UTF-8',
		success: function(serverLotto) {
			if (serverLotto.lottoNums != null && serverLotto.lottoNums.length > 0) {
				successCheckToiletto(serverLotto);
			}
		},
		error: function(xhr) {
			alert('토일레또 시스템에 오류가 발생했습니다.');
		}
	})
}

/**-----------------------------------------------------------------------------
								Johnny Deck
 -----------------------------------------------------------------------------*/
var deckJs = function(testDeck, discardDeck, currentRecord, deckRound0, roundSizeConstant, firstCardDiv) {
	// [효과음 세팅]----------------------------------------------------------------
	var beep_pass = new Audio();		// card discard 효과음
	var beep_remind = new Audio();		// card keep 효과음
	var flip_card = new Audio();		// card 뒤집기 효과음
	var click_word = new Audio();		// 리뷰테스트에서 단어 클릭 효과음 
	var collect_deckcon = new Audio();	// 덱콘 획득 효과음 
	var complete_bingo = new Audio();	// 빙고 완성 효과음 
	var sound_playing = new Audio();			// 재생 중인 소리
	// -------------------------------------------------------------------------
	
    var roundSize;
    const deckconCandidates = makeArray(0, 13, 1).concat(makeArray(20,12,1))
    						 .concat(makeArray(40,11,1)).concat(makeArray(60,10,1))
    						 .concat(makeArray(80,7,1));
    const bingoBackgrounds = '#ff6060,#ffdc46,#66ff59,#5f85ff,#d53eff'.split(',');
    var cards, cardIndex = 0;	// 현재 덱 문제들과 카드 인덱스번호
    var discardQuizDeck; // discardQuiz 문제 풀
    var question;	// discardQuiz 현재 문제
    var rightTokens = [];	// 한 문제의 정답 배열
    var choices = []	// 한 문제에서 내가 고른 단어 배열
   	var verifiedList = [];	// discardQuiz를 통과한 plvoCardId 리스트
   	var sentenceSwResultList = [];

    var cardTotalNum;	// 현제 덱 문제 양
    var deckRound;		// 현재의 덱라운드

    var deckconNums = []; // [빙고 배치번호,덱콘번호]
    var rooms = Array(25).fill(-1); // 빙고판의 각 칸마다 저장된 덱콘 번호들
    var bingoRooms = [];	// 빙고가 완성된 칸들 인덱스 번호
	var earnedChipCount = 0;	// 도중에 빙고가 완성되더라도 유지되는, 이번 게임에서 얻은 디스카드 수
	var roundCompleted = false; // 게임을 진행하며 라운드가 완성된 적이 있는지 여부

	// [퀴즈 세팅/ 시작]------------------------------------------------------------
	var discardCardIdList = [], playDeckRecord;	// 이번 덱에서 discard한 아이디 리스트, 나의 덱 진행 정보
	
	class JohnnyDeckController {
		constructor(testDeck, discardDeck, currentRecord, deckRound0, roundSizeConstant, firstCardDiv){
			cards = testDeck || [];
			cardTotalNum = cards != null? cards.length : 0;
			discardQuizDeck = discardDeck || [];
			discardQuizDeck.sort(function(){return Math.random() - 0.5});
			deckRound = deckRound0 || null;
		    if(deckRound != null){
			    delete deckRound.regDate;
			    delete deckRound.updateDate;
			    delete deckRound.bingo;
		    }
			roundSize = roundSizeConstant || 0;
			playDeckRecord = currentRecord || null;
			if(playDeckRecord != null){
				delete playDeckRecord.regDate;
				delete playDeckRecord.updateDate;
				playDeckRecord.discardRp = 0;	// 이번 덱에서 획득한 RP량
			}
			if(cardTotalNum > 0){
				fillNextCard(firstCardDiv, cards[0]);
			}
		}
		
		start(deckconNumList){
			var _this = this;
			flip_card.src = '/sounds/flip_card.mp3';
			flip_card.load();
			beep_remind.src = '/sounds/flee.mp3';
			beep_remind.load();
			beep_pass.src = '/sounds/coin.mp3';
			beep_pass.load();
			
			click_word.src = '/sounds/click_word.mp3';
			click_word.load();
			collect_deckcon.src = '/sounds/collect_deckcon.mp3';
			collect_deckcon.load();
			complete_bingo.src = '/sounds/complete_bingo.mp3';
			complete_bingo.load();
			
			deckconNums = deckconNumList;
		    deckconNums.forEach(function(elt) {
				rooms[Number(elt[0])] = Number(elt[1]);
			});		
			_this.findBingoes(true);
		}
		
		// 누적 discard 수를 반환
		totalDiscardCount() {
			return playDeckRecord.discardCount;
		}
		
		// 입력받은 이름에 해당하는 효과음을 재생한다.
		playSound(soundName) {
			this.stopSound();
			switch (soundName) {
				case 'flip':
					sound_playing = flip_card;
					break;
				case 'discard':
					sound_playing = beep_pass;
					break;
				case 'keep':
					sound_playing = beep_remind;
					break;
				case 'clickWord':
					sound_playing = click_word;
					break;
				case 'collectDeckcon':
					sound_playing = collect_deckcon;
					break;
				case 'completeBingo':
					sound_playing = complete_bingo;
					break;
				default:
					break;
			}
			sound_playing.play();
		}
		
		// 현재 재생 중인 소리(효과음, 문장 음성)을 중지
		stopSound() {
			if (sound_playing.duration > 0 && !sound_playing.paused) {
				sound_playing.pause();
				sound_playing.currentTime = 0;
			}
		}
		
		// 카드를 keep 한다. (=우리말을 영어로 말할 수 없다.)
		keep($cardDiv) {
			var cardsNumLeft = cardTotalNum - cardIndex - 1;
			cardIndex++;
			if(discardQuizDeck.length >= 10){
				var dumpConNum = deckconCandidates[Math.floor(Math.random()*deckconCandidates.length)];
				//---------------------
				dropDeckcon(dumpConNum);
				//---------------------
			}else {
				discardProgress(false);
			}
			//-------------------------------------------------
			setCards(cardsNumLeft, $cardDiv, cards[cardIndex]);
			//-------------------------------------------------
		}
		
		// 카드를 discard 한다. (=우리말을 영어로 말할 수 있다.)
		discard($cardDiv) {
			earnedChipCount++;
			var cardsNumLeft = cardTotalNum - cardIndex - 1;
			discardCardIdList.push(cards[cardIndex].plvoCardId);
			playDeckRecord.discardRp += 3;
			playDeckRecord.discardCount++;
			if(playDeckRecord.keepCount > 0){
				playDeckRecord.keepCount--;
			}
			cardIndex++;
			//-------------------------------------------------
			setCards(cardsNumLeft, $cardDiv, cards[cardIndex]);
			//-------------------------------------------------
		}
		
  		/**
  		 * 암기 확인 퀴즈 출제
  		 * cardIndex가 증가된 후 호출되는 것으로 가정
  		 */
  		startDiscardQuiz(){
			discardQuizDeck.push(cards[cardIndex-1]);
 			if(discardQuizDeck.length < 10){
				// 1-a. 리뷰테스트할 문제가 10문제 미만이면 퀴즈는 넘어간다. 빙고 역시 주어지지 않는다.
				addBlurClass(false);
				return;
			}else{
				var foundIndex = -1;
  				// 1-b. 퀴즈 통과로 암기 확인이 된 문제를 뺀다. 
  				if(!discardQuizDeck.every(function(plvoCard, i) {
  						if(verifiedList.indexOf(plvoCard.plvoCardId) > -1) foundIndex = i;
						return verifiedList.indexOf(plvoCard.plvoCardId) == -1;
  						})){
  					if(foundIndex > -1){
	  					discardQuizDeck.splice(foundIndex, 1);
  					}
  				}
				// 2. 문제 셋팅
	  			question = discardQuizDeck[Math.floor(Math.random() * (discardQuizDeck.length - 1))];
	  			// 3. 문제 난이도 정보 조회하여 표시
	  			$.ajax({
	  				type: 'get',
	  				url: '/sentenceBook/level/' + question.sentenceId,
	  				success: function(sentenceLevel){
						//----------------------------------------------------------
	  					sentenceLevelRate(sentenceLevel.totalSpeak, sentenceLevel.wrongSpeak);
						//----------------------------------------------------------
	  				},
	  				error: function(xhr){
	  					
	  				}
	  			})
				// 4. 정답 단어 배열 생성
	  			rightTokens = Array.from(Array.from(question.randomTokens).sort(function(a, b) {
	  				return a.index - b.index;
	  			}), function(elt){return elt.name});
	  			
	
	  		   	// 5. 선택지 단어 배열 생성(소문자로)
	  		   	var wordTokens = [];
	  		   	Array.from(rightTokens, function(elt){return elt.toLowerCase()})
					.forEach(function(elt) {
	  		   			if(wordTokens.indexOf(elt) == -1){
	  		   				wordTokens.push(elt);
	  		   			}
	  		   		});
	  		   	for(var i = 0; i < discardQuizDeck.length; i++){
	  		   		var tokens = discardQuizDeck[i].randomTokens;
	  		   		for(var j = 0; j < tokens.length; j++){
	  		   			// 보기 단어 개수를 최대 12개로 조정
	  			   		if(wordTokens.length < 12 && wordTokens.indexOf(tokens[j].name.toLowerCase()) == -1){
	  			   			wordTokens.push(tokens[j].name.toLowerCase());
	  			   		}
	  		   		}
	  		   	}
	  		   	wordTokens.sort(); // 알파벳 순 정렬
				// 6. 퀴즈 표시
				//-----------------------------------------------------
				showDiscardQuiz(question.kor, rightTokens, wordTokens);
				//-----------------------------------------------------
 			}
  		}
		
		/**
		 * 선택한 단어와 정답 단어를 미리 비교하여 대소문자를 맞추고, 내가 고른 단어 배열로 추가한다.
		 * selfInput: 직접입력모드 (true/false)
		 * inputIndex: 비교할 정답단어의 인덱스
		 * token: 선택한 단어(소문자)
		 */
		checkAndPushToken(selfInput, inputIndex, token) {
			var chosedToken = token;
			if(rightTokens[inputIndex].toLowerCase() == chosedToken){
				chosedToken = rightTokens[inputIndex];
			}
			choices[inputIndex] = chosedToken;
			//--------------------------------------------
			fillBlankAndNext(selfInput, inputIndex, chosedToken);
			//--------------------------------------------
		}
		
		/**
		 * 퀴즈 문제를 채점하고 새로운 덱콘을 획득하여 Kiss And Cry 화면을 표시.
		 */
		checkQuizAnswer() {
			var _this = this;	// ajax 코드 내에서 this를 사용하기 위함
			var sentenceSwResult = {sentenceId: question.sentenceId};
			var confirmMsg;
			var correct = choices.length > 0 && choices.every(function(chosedToken, i) {
								return chosedToken == rightTokens[i];}
							);
			// 문제를 맞춤
			if(correct){
				// 통과 목록에 문제를 등록
				verifiedList.push(question.plvoCardId);
				
				confirmMsg = "훌륭해요! <i class=\"far fa-laugh-squint fa-lg\"></i>"
					+ "<br>정확히 말할 수 있는 문장이군요.";
			}else{
			// 문제를 틀림
				sentenceSwResult.wrongSpeak = true;
	  			playDeckRecord.discardRp -= 10;
				
				confirmMsg = "틀렸습니다 <i class=\"far fa-sad-tear fa-lg\"></i>"
					+ "<br>정확히 말할 수 있는 문장이 아니군요.";
				// 문제 정답 확인 메세지 및 정답 표시.
				openConfirmDiv(confirmMsg, correct, question.eng);
				$('#viewBingoBtn').one('click', function(){
					$('#viewBingoBtn').hide();
					$('#discardQuizDiv .eng-text').hide();
					getDeckconAndConfirm();
				});
			}
			sentenceSwResultList.push(sentenceSwResult);
			choices = [];
			
			// 정답 음성 재생
			this.stopSound();
			sound_playing = new Audio('/playvoiceBook/kick/deck/sentence/' + question.sentenceId);
			sound_playing.load();
			sound_playing.addEventListener('error', function playFailed(){
				sound_playing.removeEventListener('error', playFailed);
				getDeckconAndConfirm();
			})
			sound_playing.addEventListener('canplaythrough', function playAnswer(){
				
				// 정답 음성을 2회 재생. 맞춘 경우 그다음 빙고 화면으로
				sound_playing.play();
				var answerAudioRepeat = 2;
				sound_playing.addEventListener('ended', function answerPlayed(){
					if(answerAudioRepeat > 1) {
						answerAudioRepeat--;
						setTimeout(function(){
							sound_playing.play();
						}, 300);
					}else if(correct) {
						openConfirmDiv(confirmMsg, correct, null);
						getDeckconAndConfirm();
						sound_playing.removeEventListener('ended', answerPlayed);
					}
				})
				sound_playing.removeEventListener('canplaythrough', playAnswer);
			})
			
			function getDeckconAndConfirm(){
				// disable된 단어 선택지 영역을 다시 enable 시킴
				$("#discardQuizDiv").removeClass("confirm");
			
				// 덱콘을 획득하고 빙고판 표시
				$.ajax({
					type: 'get',
					url: '/kick/bingo/deckcon/' + deckconNums.length,
					success: function(deckcon){
						deckconNums.push([deckcon.index, deckcon.iconNum]);
						rooms[deckcon.index] = deckcon.iconNum;
						var color = bingoBackgrounds[Math.floor(deckcon.iconNum / 20)]
						//-------------
						_this.findBingoes(false);
						//-------------
						if(deckconNums.length == roundSize){
							// 덱라운드 완성
							//----------------------
							_this.submitInProgress(false);
							//----------------------
						}									
						//------------------
						getDeckconSuccess(deckcon, color, bingoRooms);
						//------------------
					},
					error: function(xhr){
						alert("비정상적 접근이거나 서버 내부 오류로 인해 덱콘을 가져오지 못 했습니다. 재로그인 하시기 바랍니다.");
					}
				});
				
			}
		}
		
		/**
		 * 마지막 카드까지 넘겼는지 확인.
		 * return true/false
		 */	
		allCardConsumed() {
			return cardIndex == cardTotalNum;
		}
		
		/**
		 * 테스트 도중 비동기적으로 퀴즈 결과를 서버로 전송한다.
		 * escape: 임의로 페이지를 벗어나는 경우인지(true), 라운드 완성으로 인한 호출인지(false)
		 */
		submitInProgress(escaped) {
			var action = '/playvoiceBook/kick/deck/round/escaped';
			if(!escaped){
				// 라운드 완성
				deckRound.completed = true;
				roundCompleted = true;
				action = '/playvoiceBook/kick/deck/round/completed';
			}
			var deckResult = {playDeckRecord, deckRound,
							discardCardIdList, sentenceSwResultList};
			$.ajax({
				url: action,
				type: 'post',
				data: JSON.stringify(deckResult),
				dataType:'json',
				contentType: 'application/json;charset=UTF-8',
				success: function(newRound){
					if(!escaped){
						deckRound = newRound;
					    delete deckRound.regDate;
					    delete deckRound.updateDate;
					    delete deckRound.bingo;
						discardCardIdList = [];
						deckconNums = [];
						rooms = Array(25).fill(-1);
						bingoRooms = [];
						//---------------------------
						restRound(deckRound.roundNum);
						//---------------------------
					}
				},
				error: function(xhr){
					alert('현황을 저장하지 못 했습니다. 로그인을 확인하거나 잠시 뒤 재시도 해주세요.');
				}
			})
		}
		
		/**
		 * 테스트 결과를 서버로 전송한다.
		 */
		submitResult($frm){
			sessionStorage.setItem('johnnyDeckChipCount', earnedChipCount);
			sessionStorage.setItem('johnnyDeckCompleteRound', roundCompleted);
			sessionStorage.setItem('johnnyDeckRoundNumber', deckRound.roundNum);
			sessionStorage.setItem('johnnyDeckconsToBingo', (25 - deckconNums.length));
			sessionStorage.setItem('johnnyDeckRankingPoint', playDeckRecord.discardRp);
			
			var deckResult = {playDeckRecord, deckRound,
							discardCardIdList, sentenceSwResultList};
			appendData($frm[0], deckResult);
			$frm.submit();
		}		
		/**
		 * 빙고 달성여부를 검사한다.
		 * isInit: 초기 빙고 검사인지 여부
		 */
		findBingoes(isInit) {
			var newBingo = 0;
			deckconNums.forEach(function(elt) {
				rooms[Number(elt[0])] = Number(elt[1]);
			})
			// 각 방향별로 한 줄씩 빙고검사(checkBingo)
			// rightDiagonals: ↙, leftDiagonals: ↘, cols: ↓, rows: →
			var rightDiagonals = [], leftDiagonals = [];
			for(var row = 0; row < 5; row++){
				var cols = [], rows = [];
				for(var col = 0; col < 5; col++){
					cols.push([row * 5 + col, rooms[row * 5 + col]]);
					rows.push([col * 5 + row, rooms[col * 5 + row]]);
				}
				newBingo += this.checkBingo(cols);
				newBingo += this.checkBingo(rows);
				
				rightDiagonals.push([row * 4 + 4, rooms[row * 4 + 4]]);
				leftDiagonals.push([row * 6, rooms[row * 6]]);
			}
			newBingo += this.checkBingo(rightDiagonals);
			newBingo += this.checkBingo(leftDiagonals);
			if(!isInit && newBingo > 0){
				this.playSound('completeBingo');
			}else if(!isInit){
				this.playSound('collectDeckcon');
			}
		}
		checkBingo(array){
			var newBingo = 0
			var sameDeckconClass = array.every(function(el){ 
						return Math.floor(el[1]/20) === Math.floor(array[0][1]/20)});
			if(array[0][1] > -1 && sameDeckconClass){
				array.forEach(function(elt) {
					if(bingoRooms.indexOf(elt[0]) == -1){
						bingoRooms.push(elt[0]);
						newBingo = 1;
					}
				});
			}
			return newBingo;
		}
	}
	
	
	return new JohnnyDeckController(testDeck, discardDeck, currentRecord, deckRound0, roundSizeConstant, firstCardDiv);
}