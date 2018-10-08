import '../css/style.css';

class Events {
	constructor() {
		this._queue = []
	}

	on(key, callback) {
		this._queue[key] = this._queue[key] || []
		this._queue[key].push(callback)
		return this
	}

	off(key, callback) {
		if (this._queue[key]) {
			const index = typeof (callback) === 'undefined' ? -2 : this._queue[key].indexOf(callback)
			if (index === -2) {
				delete this._queue[key]
			} else if (index !== -1) {
				this._queue[key].splice(index, 1)
			}
			if (this._queue[key] && this._queue[key].length === 0) delete this._queue[key]
		}
		return this
	}

	has(key) {
		return !!this._queue[key]
	}

	trigger(key, ...args) {
		if (this._queue[key]) {
			this._queue[key].forEach((callback) => callback.apply(this, args))
		}
		return this
	}
}

const animationEvent = function () {
	const el = document.createElement('div')
	const animations = {
		'animation': 'animationend',
		'webkitAnimation': 'webkitAnimationEnd',
		'msAnimation': 'MSAnimationEnd',
		'oAnimation': 'oanimationend'
	}

	for (const t in animations) {
		if (el.style[t] !== undefined) {
			return animations[t]
		}
	}

	return null
}()

function animationEnd(el, callback, animateTime = 0) {
	function bind() {
		callback()
		el.removeEventListener(animationEvent, bind)
	}

	animationEvent ? el.addEventListener(animationEvent, bind) : setTimeout(() => callback(), animateTime)
}


class LotteryTigerRoller {
	constructor(elem) {
		this.elem = elem;
		this.items = elem.children;

		this.setting = {
			current: -1, //当前位置
			rolling: false, // 是否正在转动
			speed: 50,  // 转动速度
			cycle: 64,  // 至少转动多少圈
			times: 0,   // 已转动的次数
			prizeIndex: 0, // 中奖位置，默认中奖位置 为 0
			timer: null,   // 定时器
		}

		// 克隆第一个节点 用于制作无限滚动效果
		this.elem.appendChild(this.items[0].cloneNode(true))
	}

	resize() {
		this.height = this.items[0].clientHeight
		if (!this.elem.classList.contains('fx-roll') && this.index > 0) this.elem.style.marginTop = -this.index * this.height + 'px'
	}

	reset() {
		this.elem.classList.remove('fx-roll')
		this.elem.classList.remove('fx-bounce')
		this.elem.style.marginTop = 0
		this.state = 0
	}

	start(timeout = 0) {
		if (this.state === 1) return;
		this.state = 1;
		setTimeout(() => {
			if (this.state !== 1) return;
			this.elem.classList.add('fx-roll')
			this.elem.style.marginTop = 0
		}, timeout)
	}

	// 停止条件触发
	stop(index, callback, timeout = 0) {
		if (!this.height) this.height = this.items[0].clientHeight;
		setTimeout(() => {
			if (this.state !== 1) return;
			this.elem.classList.remove('fx-roll')
			this.elem.classList.add('fx-bounce')
			this.elem.style.marginTop = -index * this.height + 'px'
			animationEnd(this.elem, () => {
				this.state = 0
				this.elem.classList.remove('fx-bounce')
				if (callback) callback.call(this, index)
			})
		}, timeout)
	}
}

class LotteryTiger extends Events {
	constructor(toggle, rollers, options) {
		super()
		this.options = Object.assign({
			interval: 300, // 每个roller间动画间隔 【】
			aniMinTime: 3000, // 动画执行最少时间 【改动】
			resize: false // roller大小是否是可变的 【非必须】
		}, options)
		this.toggle = toggle;

		// 初始化滚轴
		this.rollerQueue = []
		for (let i = 0; i < rollers.length; i++) {
			this.rollerQueue.push(new LotteryTigerRoller(rollers[i]))
		}

		// 如果大小是可变的就绑定resize事件
		if (this.options.resize) {
			window.addEventListener('onorientationchange' in document ? 'orientationchange' : 'resize', () => {
				this.rollerQueue.forEach((roller) => roller.resize())
			})
		}
	}

	reset() {
		this.toggle.classList.remove('z-active')
		for (let i = 0, l = this.rollerQueue.length; i < l; i++) {
			this.rollerQueue[i].reset()
		}
		this.trigger('reset')
	}

	setResult(ret) {
		// 保证动画执行时间
		const endTime = (new Date()).getTime()
		setTimeout(() => {
			for (let i = 0, l = this.rollerQueue.length; i < l; i++) {
				this.rollerQueue[i].stop(ret[i], (i === l - 1 ? () => {
					this.toggle.classList.remove('z-active')
					this.trigger('end', ret)
				} : null), i * this.options.interval)
			}
		}, endTime - this._startTime > this.options.aniMinTime ? 0 : this.options.aniMinTime - (endTime - this._startTime));
	}

	draw() {
		if(YLMF.isLogin()) {
			if (this.toggle.classList.contains('z-active')) { return};
			if (this.has('start')) { this.trigger('start') };
			this._startTime = (new Date()).getTime();

			this.toggle.classList.add('z-active');
			for (let i = 0, l = this.rollerQueue.length; i < l; i++) {
				this.rollerQueue[i].start(i * this.options.interval)
			}
		} else {
			if (window.Js114la && Js114la.handle114laClientLogin) {// app
                window.Js114la.handle114laClientLogin();
                // return;
            } else {
            	alert('请在114啦App内部使用该功能。')
            	// return;
            }
		}
	}
}


var lottery = new LotteryTiger(document.getElementById('J_toggle'), document.querySelectorAll('.roller')) // eslint-disable-line

var saveDataBase = function(count, cb, err) {
 	var type = YLMF.isiOS() ? 'ios' : 'android';
    if (YLMF.getRequest(YLMF.setAppUserInfo()).authkey) {
        var url = '/v/api/3.6/'+type+'/3.6/slotMachine?authkey='+YLMF.getRequest(YLMF.setAppUserInfo()).authkey+'&client='+YLMF.getRequest(YLMF.setAppUserInfo()).client+'&token='+YLMF.getRequest(YLMF.setAppUserInfo()).token;
    } else {
        var url = '/v/api/3.6/'+type+'/3.6/slotMachine';
    }
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        data: {
        	integral: count
        },
        success: function (json) {
        	if (json.state == 1) {
        		setTimeout(function() {
        			cb && cb(json);

        			if($('.lottery-popup').length) { $('.m-ui-tiger').remove() };
				}, 1500);
        	} else {
        		alert(json.message);
        	}
        },
        error: function(e) {
            err && err(e);
        }
    })
}

// 获奖提示
var lotteryAlert = function(level) {
	var tpl = document.createElement('div');
		tpl.setAttribute('class', 'lottery-popup');
		tpl.classList.add(level);

		$(tpl).html('<div id="J_close-btn" class="lottery-close-btn"></div>');

	document.body.appendChild(tpl);
};

lottery.on('start', function () {
	setTimeout(function () {
		var ret = [Math.round(Math.random() * 4), Math.round(Math.random() * 4), Math.round(Math.random() * 4)];
		// 结束条件 这个结果需要服务端通过概率计算之后给出
		lottery.setResult(ret)
	}, 1000)
})

lottery.on('end', function (opt) {
	var r_Arr = [];
	console.log(opt);
	for (var i = 0; i < opt.length;) {
		var count = 0;
		for (var j = i; j < opt.length; j++) {
		  if (opt[i] === opt[j]) {
		    count++;
		  }
		}
		r_Arr.push({
		  item: opt[i],
		  count: count
		})
		i += count;
	}

	$('#J_rocker').removeClass('active');
	$('#J_toggle').removeClass('active');

	if (r_Arr.length === 1) {
		if(r_Arr[0].item === 2) { // 三个'啦'
			saveDataBase(500, function() {
				lotteryAlert('fourth');
				// alert('暴击啦，获得500积分。');
			});
			return;
		}
		saveDataBase(300, function() {
			lotteryAlert('third');
			// alert('暴击啦，获得300积分。');
		});
	} else if(r_Arr.length === 2) {
		saveDataBase(300, function() {
			lotteryAlert('second');
			// alert('恭喜获得100积分，运气不错哇。');
		});
	} else {
		saveDataBase(50, function() {
			lotteryAlert('first');
			// alert('恭喜获得50积分，积少成多，聚沙成塔。');
		});
	}
})

;(function() {
	var $startBtn = $('#J_toggle'),
		$rocker = $('#J_rocker');

	// 触发开始按钮
	$startBtn.on('click', function() {
		lottery.draw();
		$startBtn.addClass('active');
	})

	// 触发摇杆按钮
	$rocker.on('click', function() {
		var $self = $(this);
		lottery.draw();
		$self.addClass('active');
	})

	$('body').on('click', '.lottery-close-btn', function() {
		if(window.Js114la && Js114la.homeadClose) {
			window.Js114la.homeadClose();
		}
	})
})();