export class Timer {
	protected time_remaining: number;
	protected initial_time: number;
	protected running: boolean;
	protected callback: Function;
	protected last_start: number;
	protected timeout: number;
	protected keyword: string;
	constructor (time: number, callback: Function) {
		this.time_remaining = time;
		this.initial_time = time;
		this.running = false;
		this.callback = callback;
		this.last_start = 0;
		this.timeout = 0;
		this.keyword = 'Timer';
	}
	start () {
		if (this.running) {
			console.warn(this.keyword + ' is already running');
			return;
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
		if (!this.running) {
			console.warn(this.keyword + ' is not running');
			return;
		}
		this.running = false;
		clearTimeout(this.timeout);
		this.time_remaining -= Date.now() - this.last_start;
	}
	resume () {
		if (this.running) {
			console.warn(this.keyword + ' is already running');
			return;
		}
		if (this.time_remaining <= 0) {
			console.warn(this.keyword + ' has already finished');
			return;
		}
		if (this.time_remaining === this.initial_time) {
			console.warn(this.keyword + ' has not been started yet');
			return
		}
		this.start();
	}
	reset () {
		if (this.running) {
			console.warn(this.keyword + ' is running');
			return;
		}
		this.time_remaining = this.initial_time;
		this.running = false;
		clearTimeout(this.timeout);
	}
	setTime (time: number) {
		this.time_remaining = time;
		this.initial_time = time;
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
	static Timers: Timer[] = [];
	static GetTimersByName (name: string) {
		let timers = this.Timers.filter(timer => timer.keyword === name);
		if (timers.length === 0) {
			console.warn('No ' + name + ' found');
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
	protected intervalDelay;
	constructor (time: number, callback: Function, delay = 0) {
		super(time, callback);
		this.keyword = 'Interval';
		this.intervalDelay = delay;
	}
	start () {
		if (this.running) {
			console.warn(this.keyword + ' is already running');
			return;
		}
		this.intervalPaused = false;
		this.running = true;
		this.last_start = Date.now();
		this.timeout = setTimeout(
			() => {
				this.running = false;
				this.callback();
				setTimeout(() => {
					if (!this.intervalPaused) {
						this.start();
					}
				}, this.intervalDelay);
			}, this.time_remaining);
	}
	pause() {
		if (!this.running && this.getTimeRemaining() != this.initial_time) {
			console.warn(this.keyword + ' is not running');
			return;
		}
		if (!this.running) {
			this.intervalPaused = true;
			return;
		}
		this.running = false;
		clearTimeout(this.timeout);
		this.time_remaining -= Date.now() - this.last_start;
	}
	setDelay (delay: number) {
		this.intervalDelay = delay;
	}
}