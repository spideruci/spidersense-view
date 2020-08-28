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
            // let s_name = this.sampleInput[i].testcases[0].sourceName 
            // if(s_name in this.sourcetolinemap){}
            // else{
            //     this.sourcetolinemap[s_name] = new Set()
            // }
            if(this.sampleInput[i].testcases[0].passed==true)
            {
                this.totalnumberofPass++;
                for(let j in arr)
                {
                    // console.log(j,arr[j]["line"].linenumber);
                    let cur_line = arr[j]["line"].lineNumber;
                    let s_name = arr[j]["line"].sourceName;
            		if(s_name in this.sourcetolinemap)
            		{
                        this.sourcetolinemap[s_name].add(cur_line)
                    }
                    else
                    {
                        this.sourcetolinemap[s_name] = new Set()
                        this.sourcetolinemap[s_name].add(cur_line)
                    }
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
                    let cur_line = arr[j]["line"].lineNumber;
                    let s_name = arr[j]["line"].sourceName;
                    if(s_name in this.sourcetolinemap){
                        this.sourcetolinemap[s_name].add(cur_line)
                    }
                    else{
                        this.sourcetolinemap[s_name] = new Set()
                        this.sourcetolinemap[s_name].add(cur_line)
                    }
                    // console.log(arr[j]["line"].sourceName)
                    //populating source map for output population
                    // this.sourcetolinemap[s_name].add(cur_line)
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
        return 'hsl(' + hue + ', 100%, '+ Math.max((this.faillineMap[i]/this.totalnumberofFail),(this.passlineMap[i]/this.totalnumberofPass))*50+'%)';
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
            let suspiciousness_value = 0;
            //checking if line is hit by both pass and fail test_cases
            if(i in this.faillineMap)
            {
                // let suspiciousness_value = this.roundToTwo(this.cal_suspiciousness(this.faillineMap,this.passlineMap,this.totalnumberofFail,this.totalnumberofPass,i))
                suspiciousness_value= this.roundToTwo(this.cal_suspiciousness(i))
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
            let suspiciousness_value = 1;
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
        if(this.totalnumberofFail==0){
            this.populating_with_pass_cases()
        }
        else{
            this.populating_with_pass_cases()
            this.populating_with_fail_cases()
        }
                let output = this.populating_final_response()
        return output
    
    }
    //l value has to be max of %fail/pass
    //calculating the suspiciousness and hsl values
}
const sampleInput = [
    {
      "testcases": [
        {
          "signature": "[test:expectThereToBeNoFailingTestsInData_When_ZeroTestsAndStmts(org.spideruci.tarantula.TestDataBuilder)]",
          "sourceName": "[runner:org.spideruci.tarantula.TestDataBuilder]",
          "passed": 1,
          "coverage": [
            {
              "line": {
                "lineId": "71555",
                "lineNumber": 8,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71556",
                "lineNumber": 10,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71557",
                "lineNumber": 11,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71558",
                "lineNumber": 13,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71559",
                "lineNumber": 14,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71560",
                "lineNumber": 16,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71561",
                "lineNumber": 17,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71562",
                "lineNumber": 19,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71563",
                "lineNumber": 23,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71564",
                "lineNumber": 24,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71566",
                "lineNumber": 28,
                "sourceName": "org.spideruci.tarantula.TarantulaDataBuilder.java"
              }
            },
            {
              "line": {
                "lineId": "71660",
                "lineNumber": 147,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71661",
                "lineNumber": 148,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71662",
                "lineNumber": 150,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71663",
                "lineNumber": 151,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71664",
                "lineNumber": 154,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71665",
                "lineNumber": 155,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71667",
                "lineNumber": 159,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71670",
                "lineNumber": 166,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71671",
                "lineNumber": 167,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71672",
                "lineNumber": 170,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71673",
                "lineNumber": 171,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            },
            {
              "line": {
                "lineId": "71686",
                "lineNumber": 208,
                "sourceName": "org.spideruci.tarantula.TarantulaData.java"
              }
            }
          ]
        }
      ]
    },
    {
        "testcases": [
          {
            "signature": "[test:expect_AllPassOnStmts_Equals_TestCount_When_AllPassingTests_AllTestsLiveGood_AllStmtsCovered(org.spideruci.tarantula.TestCalculatePassOnStmtAndFailOnStmt)]",
            "sourceName": "[runner:org.spideruci.tarantula.TestCalculatePassOnStmtAndFailOnStmt]",
            "passed": 0,
            "coverage": [
              {
                "line": {
                  "lineId": "71567",
                  "lineNumber": 3,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71612",
                  "lineNumber": 92,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71613",
                  "lineNumber": 93,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71614",
                  "lineNumber": 96,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71615",
                  "lineNumber": 97,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71616",
                  "lineNumber": 98,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71617",
                  "lineNumber": 99,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71618",
                  "lineNumber": 100,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71619",
                  "lineNumber": 101,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71620",
                  "lineNumber": 102,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71622",
                  "lineNumber": 105,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71623",
                  "lineNumber": 109,
                  "sourceName": "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
                }
              },
              {
                "line": {
                  "lineId": "71652",
                  "lineNumber": 8,
                  "sourceName": "org.spideruci.tarantula.PassFailPair.java"
                }
              },
              {
                "line": {
                  "lineId": "71653",
                  "lineNumber": 9,
                  "sourceName": "org.spideruci.tarantula.PassFailPair.java"
                }
              },
              {
                "line": {
                  "lineId": "71654",
                  "lineNumber": 10,
                  "sourceName": "org.spideruci.tarantula.PassFailPair.java"
                }
              },
              {
                "line": {
                  "lineId": "71655",
                  "lineNumber": 11,
                  "sourceName": "org.spideruci.tarantula.PassFailPair.java"
                }
              },
              {
                "line": {
                  "lineId": "71657",
                  "lineNumber": 18,
                  "sourceName": "org.spideruci.tarantula.PassFailPair.java"
                }
              }
            ]
          }
        ]
      }
  ]
export default Suspiciousness;
// module.exports = {
//     tarantula:Tarantula
// }
// var obj1 = new Suspiciousness(sampleInput)
// let output = obj1.suspiciousness()
// console.log(output)
