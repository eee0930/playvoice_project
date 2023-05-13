
// 계속적으로 음성의 파형을 분석하여 화면의 캔버스에 표시하기 위해 쓰이는 전역 변수. 지역변수로 전달하여 사용하지 못함.
var wf_canvas, wf_ctx, wf_analyser;

/**
 * 페이지에서 재생될 Audio 객체를 받아서 
 * 재생상태에 반응하는 파형 그래프를 화면에 표시한다.
 * 
 * 사용: initAudioVisualizer(Audio a, Canvas b);
 * 		함수 호출 후 a를 재생하면 파형이 그려진다.
 */
function initAudioVisualizer(audioObj, canvasObj){
	var context = new AudioContext(); // AudioContext object instance
	wf_analyser = context.createAnalyser(); // AnalyserNode method
	wf_analyser.fftSize = 32;	// must be power of 2; 32~32768(default:2048)
	wf_analyser.maxDecibels = -1;
	wf_analyser.minDecibels = -130;
	wf_analyser.smoothingTimeConstant = 0.5;
	wf_canvas = canvasObj;
	wf_ctx = wf_canvas.getContext('2d');
	
	var source = context.createMediaElementSource(audioObj); 
	source.connect(wf_analyser);
	wf_analyser.connect(context.destination);
	frameLooper(wf_canvas);
}

// 브라우저가 지원하는 화면 주사율(대개 60프레임/초)마다 캔버스에 오디오 파형을 그림
function frameLooper(canvas){
	window.requestAnimationFrame(frameLooper);
	var fbc_array = new Uint8Array(wf_analyser.frequencyBinCount);	
	wf_analyser.getByteFrequencyData(fbc_array);	// 음폭 데이터;max 255
	wf_ctx.clearRect(0, 0, wf_canvas.width, wf_canvas.height); // 캔버스 비우기
	wf_ctx.fillStyle = '#00CCFF'; // 막대 색깔
	fbc_size = fbc_array.length / 16.0;	
	for (var i = 0; i < 16; i++) {
		var bar_x = i * wf_canvas.width/32.0;	// x offset
		var bar_width = (wf_canvas.width/32.0/4);	// y offset
		var bar_height = -(fbc_array[fbc_size * i] * wf_canvas.height / 510.0);
		//  fillRect( x, y, width, height ) 
		wf_ctx.fillRect(wf_canvas.width/2 + bar_x, wf_canvas.height/2, bar_width, bar_height);	// 1사분면
		wf_ctx.fillRect(wf_canvas.width/2 + bar_x, wf_canvas.height/2, bar_width, -bar_height);	// 2사분면
		wf_ctx.fillRect(wf_canvas.width/2 - bar_x + bar_width - wf_canvas.width/32.0, wf_canvas.height/2, -bar_width, bar_height);	// 3사분면
		wf_ctx.fillRect(wf_canvas.width/2 - bar_x + bar_width - wf_canvas.width/32.0, wf_canvas.height/2, -bar_width, -bar_height);	// 4사분면
	}
}