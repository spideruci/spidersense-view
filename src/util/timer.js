class Timer {
    constructor() {
        this.startTime = 0;
        this.endTime = 0;
    }

    start() {
        this.startTime = performance.now();
    };

    end() {
        this.endTime = performance.now();
    }

    getTimeDiff() {
        let timeDiff = this.endTime - this.startTime; //in ms 
        // strip the ms 
        // timeDiff /= 1000; 
        
        // get seconds 
        let seconds = Math.round(timeDiff);
        // console.log(seconds + " seconds");
        return seconds;
    }

    getStartTime() {
        return this.startTime;
    }

    getEndTime() {
        return this.endTime;
    }
}

export default Timer;