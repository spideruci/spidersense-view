/**
 * Timer
 * Helper class for benchmarking. Returns the amount of time that has passed in
 * seconds from startTime to endTime.
 */
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

        // Uncomment to strip the ms 
        // timeDiff /= 1000; 
        
        // Get seconds and return
        let seconds = Math.round(timeDiff);
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