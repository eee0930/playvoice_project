
var targetTextInput;

var alphabetKey = [['q','Q'], ['w','W'], ['e','E'], ['r','R'], ['t','T'],
	['y','Y'], ['u','U'], ['i','I'], ['o','O'], ['p','P'],
	['a','A'], ['s','S'], ['d','D'], ['f','F'], ['g','G'], ['h','H'],
	['j','J'], ['k','K'], ['l','L'],
	['z','Z'], ['x','X'], ['c','C'], ['v','V'], ['b','B'], ['n','N'], ['m','M']];	


/**
 * 대소문자 변환
 */
function changePlayKeyboardKeys(type, i) {
	var changedKey = null;
	if(type == 'up') {
		changedKey = alphabetKey[i][1];
	} else {
		changedKey = alphabetKey[i][0];
	}
	return changedKey;
}

/**
 * 입력한 키 코드 반환
 */
function inputKeyCodeToText(code) {
	var keyText = String.fromCharCode(code);
	return keyText;
}



