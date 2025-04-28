type TimerEvent = 'pause' | 'resume';

export class Timer {
	protected time_remaining: number;
	protected initial_time: number;
	protected running: boolean;
	protected callback: Function;
	protected onPause?: Function;
	protected paused: boolean;
	protected onResume?: Function;
	protected last_start: number;
	protected timeout: number;
	protected keyword: string;
	constructor (time: number, callback: Function) {
		this.time_remaining = time;
		this.initial_time = time;
		this.running = false;
		this.paused = false;
		this.callback = callback;
		this.last_start = 0;
		this.timeout = 0;
		this.keyword = 'Timer';
	}
	start () {
		if (this.running) {
			console.error(this.keyword + ' is already running');
			return;
		}
		if (this.getTimeRemaining() >= 0) {
			this.onResume && this.onResume();
		}
		this.running = true;
		this.last_start = Date.now();
		this.timeout = setTimeout(() => {
			this.running = false;
			this.callback();
		}
		, this.time_remaining);
	}
	pause () {
		if (!this.running && this.getTimeRemaining() != this.initial_time) {
			console.error(this.keyword + ' is not running');
			return;
		}
		this.running = false;
		this.paused = true;
		clearTimeout(this.timeout);
		this.time_remaining -= Date.now() - this.last_start;
		this.onPause && this.onPause();
	}
	resume () {
		if (this.running) {
			console.error(this.keyword + ' is already running');
			return;
		}
		if (this.time_remaining <= 0) {
			console.error(this.keyword + ' has already finished');
			return;
		}
		if (!this.paused) {
			console.error(this.keyword + ' has not been started yet');
			return;
		}
		this.start();
	}
	reset () {
		if (this.running) {
			console.error(this.keyword + ' is running');
			return;
		}
		this.time_remaining = this.initial_time;
		this.running = false;
		clearTimeout(this.timeout);
	}
	setInitialTime (time: number) {
		this.initial_time = time;
	}
	setTime (time: number) {
		let isRunning = this.running;
		if (isRunning) this.pause()
		this.time_remaining = time;
		if (isRunning) this.resume();
	}
	subtractTime (time: number) {
		this.setTime(Math.max(0, this.getTimeRemaining() - time));
	}
	addTime (time: number) {
		this.setTime(this.getTimeRemaining() + time);
	}
	getTimeRemaining () {
		if (this.running) {
			return this.time_remaining - (Date.now() - this.last_start);
		}
		return this.time_remaining;
	}
	getInitialTime () {
		return this.initial_time
	}
	isRunning () {
		return this.running;
	}
	setName (name: string) {
		this.keyword = name;
	}
	on(event: TimerEvent, callback: Function) {
		if (event === 'pause') {
			this.onPause = callback;
		}
		if (event === 'resume') {
			this.onResume = callback;
		}
	}
	static Timers: Timer[] = [];
	static GetTimersByName (name: string) {
		let timers = this.Timers.filter(timer => timer.keyword === name);
		if (timers.length === 0) {
			console.error('No ' + name + ' found');
			return;
		}
		if (timers.length === 1) {
			return timers[0];
		}
		return timers;
	}
}

export class Interval extends Timer {
	protected intervalPaused = false;
	protected onIntervalDelay = false;
	protected intervalDelay;
	constructor (time: number, callback: Function, delay = 0) {
		super(time, callback);
		this.keyword = 'Interval';
		this.intervalDelay = delay;
	}
	start () {
		if (this.running) {
			console.error(this.keyword + ' is already running');
			return;
		}
		if (this.onIntervalDelay) {
			console.warn(this.keyword + ' is paused for the minimum interval delay of ' + this.intervalDelay + 'ms');
			this.intervalPaused = false;
			return;
		}
		this.intervalPaused = false;
		this.running = true;
		this.last_start = Date.now();
		this.timeout = setTimeout(
			() => {
				this.running = false;
				this.onIntervalDelay = true;
				this.callback();
				setTimeout(() => {
					this.onIntervalDelay = false;
					if (!this.intervalPaused) {
						this.time_remaining = this.initial_time;
						this.start();
					}
				}, this.intervalDelay);
			}, this.time_remaining);
	}
	pause() {
		if (this.onIntervalDelay) {
			this.intervalPaused = true;
			return;
		}
		super.pause();
	}
	resume() {
		this.intervalPaused = false;
		super.resume();
	}
	setDelay (delay: number) {
		this.intervalDelay = delay;
	}
}