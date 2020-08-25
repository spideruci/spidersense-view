class Suspiciousness{
    constructor(input){
        this.sampleInput = input;
        this.totalnumberofFail = 0;
        this.totalnumberofPass = 0;
        this.passlineMap = {};
        this.faillineMap = {};
        this.sourcetolinemap = {};
        this.final_respone = {};
        this.final_output = [];
    }
    map_populating()
    {
        for(const i in this.sampleInput)
        {
            let arr = this.sampleInput[i].testcases[0].coverage
            let s_name = this.sampleInput[i].testcases[0].sourceName 
            if(s_name in this.sourcetolinemap){}
            else{
                this.sourcetolinemap[s_name] = new Set()
            }
            if(this.sampleInput[i].testcases[0].passed==true)
            {
                this.totalnumberofPass++;
                for(let j in arr)
                {
                    // console.log(j,arr[j]["line"].linenumber);
                    let cur_line = arr[j]["line"].linenumber;
                    //populating source map for output population
                    this.sourcetolinemap[s_name].add(cur_line)
                    
                    if(cur_line in this.passlineMap){
                        this.passlineMap[cur_line]++;
                    }
                    else
                    {
                        this.passlineMap[cur_line]=1
                    }
                }
            }
            else
            {
                this.totalnumberofFail++;
                for(let j in arr)
                {
                    // console.log(j,arr[j]["line"].linenumber);
                    let cur_line = arr[j]["line"].linenumber;
                    //populating source map for output population
                    this.sourcetolinemap[s_name].add(cur_line)
                    if(cur_line in this.faillineMap)
                    {
                        this.faillineMap[cur_line]++;
                    }
                    else
                    {
                        this.faillineMap[cur_line]=1
                    }
                }
            }
        }
    }
    //function to calculate the hue value with 100% saturation and 50% lightness
    //the value 0 and 120 represent the start and end of the spectrum
    //percentage: a value between 0 and 1
    //hue0: the hue value of the color you want to get when the percentage is 0, taken to be 0(red)
    //hue1: the hue value of the color you want to get when the percentage is 1, taken to be 120(green)
    percentageToHsl(percentage,i) {
        var hue = (percentage * (120-0)) + 0
        return 'hsl(' + hue + ', 100%, '+ Math.max((this.faillineMap[i]/this.totalnumberofFail),(this.passlineMap[i]/this.totalnumberofPass))*100+'%)';
    }
    //default value function when there are no failing cases
    no_fail_percentageToHsl(percentage) {
        var hue = (percentage * (120-0)) + 0
        return 'hsl(' + hue + ', 100%, 50%)'
    }
    roundToTwo(num) {    
        return +(Math.round(num + "e+2")  + "e-2")
    }

    cal_suspiciousness(i)
    {
        // map_populating();
        let sus = (this.faillineMap[i]/this.totalnumberofFail)/((this.faillineMap[i]/this.totalnumberofFail)+(this.passlineMap[i]/this.totalnumberofPass))
        return sus
        // console.log(this.passlineMap,this.faillineMap,this.totalnumberofFail,this.totalnumberofPass)
    }
    populating_with_pass_cases()
    {
        for(let i in this.passlineMap)
        {
            // var suspiciousness_value = 0;
            //checking if line is hit by both pass and fail test_cases
            if(i in this.faillineMap)
            {
                // let suspiciousness_value = this.roundToTwo(this.cal_suspiciousness(this.faillineMap,this.passlineMap,this.totalnumberofFail,this.totalnumberofPass,i))
                var suspiciousness_value= this.roundToTwo(this.cal_suspiciousness(i))
                // console.log(suspiciousness_value)
                //populating final response with value
                this.final_respone[i] = 
                {
                    suspiciousness : suspiciousness_value,
                    hsl : this.percentageToHsl(1-suspiciousness_value,i)
                }
            }
            //if there are not fail cases then the suspiciousness becomes 0
            else
            {
                //populating final response with value
                this.final_respone[i] = 
                {
                    suspiciousness : 0,
                    hsl : this.no_fail_percentageToHsl(1-suspiciousness_value,i)
                }
            }
        }        
    }
    populating_with_fail_cases()
    {
        for(let i in this.faillineMap)
        {
            var suspiciousness_value = 0;
            //checking if line is hit by both pass and fail test_cases, since this case is covered before so continuing
            if(i in this.passlineMap){}
            //since there are no pass cases the suspiciousness becomes 1
            else
            {
                // console.log(i,1)
                //populating final response with value
                this.final_respone[i] = 
                {
                    suspiciousness : 1,
                    hsl : this.no_fail_percentageToHsl(1-suspiciousness_value,i)
                }
            }
        }
    }

    populating_final_response(){
        for(let i in this.sourcetolinemap)
        {
            let val = new Object()
            val.source = i
            val.lines = [] 
            let curlinearr = this.sourcetolinemap[i]
            for(let j of curlinearr)
            {
                let cur_obj = this.final_respone[j];
                cur_obj.linenumber = j;
                val.lines.push(this.final_respone[j])
                // console.dir(val)
            }
            console.log((val))
            this.final_output.push((val)) 
        }
        return this.final_output
    }
    suspiciousness(){
        this.map_populating()
        console.log(this.totalnumberofPass,this.totalnumberofFail,'pass1')
        this.populating_with_pass_cases()
        console.log('pass2')
        this.populating_with_fail_cases()
        console.log('pass3')
        let output = this.populating_final_response()
        return output
    
    }
    //l value has to be max of %fail/pass
    //calculating the suspiciousness and hsl values
}
export default Suspiciousness;
// module.exports = {
//     tarantula:Tarantula
// }
// obj1 = new Tarantula(sampleInput)
// let output = obj1.suspiciousness()
// console.log(output)