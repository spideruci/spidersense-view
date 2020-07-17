import React, { Component } from 'react';

import * as d3 from 'd3';

// import "./Home.css";

class Home extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);
    } 

    componentDidMount() {
        // Define states for slider
        const sliderState = {
            BASE: "base",
            TRANSITION_NEXT: "next",
            TRANSITION_BACK: "back"
        };

        let currentSliderState = sliderState.BASE;

        // Define constants
        const MINIMAP_WIDTH = 96;
        const MINIMAP_HEIGHT = 256;
        const SLIDER_HEIGHT = 50;

        // Define variables
        let maxNumSvgs= 2;
        let currentSvgIndex = 0;
        let slider;
        let transitionSlider;

        // Get handle on the scroll container
        let scrollContainer = document.getElementById('scrollContainer');
        console.log("scrollContainer height: " + scrollContainer.scrollHeight);

        // Initialize first slider
        slider = d3.select(".svgContainer > div:nth-of-type(1) > svg")
            .append('rect')
            .attr('class', 'sliderRect')
            .attr('width', MINIMAP_WIDTH)
            .attr('height', SLIDER_HEIGHT)
            .attr('y', 0);
        
        // When slider is dragged, scroll the content
        let drag = d3.drag()
            .on('start drag', function(d, i) { 
                console.log("on drag => d3 event coordinates: ");
                console.log(d3.event);
                console.log("index is " + i);

                if (d3.event.y > ((currentSvgIndex + 1) * MINIMAP_HEIGHT)) {
                    console.log("Can't drag out");
                } else {
                    scrollContainer.scrollTop = d3.event.y + (currentSvgIndex * MINIMAP_HEIGHT);
                }
            });
    
        
        let allSvgs = d3.selectAll(".svgContainer > div > svg")
            .on("mousedown", (d, i, nodes) => {
                if (i === currentSvgIndex) {
                    console.log("Clicked svg container of the same index: " + i);
                    return;
                }
                console.log("Clicked svg container of a different index " + i);

                // Remove any sliders that are in the transition state
                if (currentSliderState == sliderState.TRANSITION_BACK) {
                    d3.select(nodes[currentSvgIndex - 1])
                        .select('.sliderRect').remove();
                }
                else if (currentSliderState == sliderState.TRANSITION_NEXT) {
                    d3.select(nodes[currentSvgIndex + 1])
                        .select('.sliderRect').remove();
                }

                let node = nodes[i];
                let pt = node.createSVGPoint();  // Created once for document
                pt.x = d3.event.clientX;
                pt.y = d3.event.clientY;
        
                // The cursor point, translated into svg coordinates
                var cursorpt =  pt.matrixTransform(node.getScreenCTM().inverse());
                console.log("Svg coordinates: (" + cursorpt.x + ", " + cursorpt.y + ")");

                // Remove current slider and drag behavior
                currentSvg.select('.sliderRect').remove();
                d3.select(currentSvg).on('mousedown.drag', null);

                // Update variables
                currentSvgIndex = i;
                slider = d3.select(allSvgs[currentSvgIndex])
                    .append('rect')
                    .attr('class', 'sliderRect')
                    .attr('width', MINIMAP_WIDTH)
                    .attr('height', SLIDER_HEIGHT)
                    .attr('y', cursorpt.y);
                transitionSlider = null;
                currentSvg = d3.select(allSvgs[currentSvgIndex]).call(drag);

                // Update state
                currentSliderState = sliderState.BASE;

                scrollContainer.scrollTop = cursorpt.y + (currentSvgIndex * MINIMAP_HEIGHT);
            })
            .nodes();
        let currentSvg =  d3.select(allSvgs[currentSvgIndex])
            .call(drag);
        
        // When content is scrolled, scroll the slider
        let container = d3.select(scrollContainer)
            .on('scroll', function(d) {
                console.log("scrollTop = " + this.scrollTop);
                slider.attr('y', this.scrollTop - (currentSvgIndex * MINIMAP_HEIGHT));

                // Determine slider state
                if (currentSliderState == sliderState.BASE) {
                    if ( (this.scrollTop >= (currentSvgIndex + 1) * MINIMAP_HEIGHT - SLIDER_HEIGHT
                        && currentSvgIndex + 1 < maxNumSvgs)
                        || (this.scrollTop < currentSvgIndex * MINIMAP_HEIGHT
                        && currentSvgIndex - 1 >= 0) ) {
                        console.log("Entering a transition...");

                        let transitionIndex = currentSvgIndex;
                        let transitionSliderPosY;

                        // Transition next
                        if (this.scrollTop >= (currentSvgIndex + 1) * MINIMAP_HEIGHT - SLIDER_HEIGHT) {
                            console.log("Transition next");
                            transitionIndex += 1;
                            currentSliderState = sliderState.TRANSITION_NEXT;
                        } else {
                            console.log("Transition back");
                            transitionIndex -= 1;
                            currentSliderState = sliderState.TRANSITION_BACK;
                        }

                        transitionSliderPosY = this.scrollTop - (transitionIndex * MINIMAP_HEIGHT);

                        // Create new slider for next svg
                        transitionSlider = d3.select(allSvgs[transitionIndex])
                            .append('rect')
                            .attr('class', 'sliderRect')
                            .attr('width', MINIMAP_WIDTH)
                            .attr('height', SLIDER_HEIGHT)
                            .attr('y', transitionSliderPosY);
                    }
                }
                else {
                    console.log("transitioning...");
                    if (currentSliderState == sliderState.TRANSITION_NEXT) {
                        transitionSlider.attr('y', this.scrollTop - ((currentSvgIndex + 1) * MINIMAP_HEIGHT));

                        // If transitioning next but return
                        if (this.scrollTop < (currentSvgIndex + 1) * MINIMAP_HEIGHT - SLIDER_HEIGHT) {
                            // Remove transition next slider
                            d3.select(allSvgs[currentSvgIndex + 1])
                                .select('.sliderRect').remove();
                            transitionSlider = null;
    
                            // Update state
                            currentSliderState = sliderState.BASE;
                        }                        
                    } 
                    else if (currentSliderState == sliderState.TRANSITION_BACK) {
                        transitionSlider.attr('y', this.scrollTop - ((currentSvgIndex - 1) * MINIMAP_HEIGHT));

                        // If transitioning back but return
                        if (this.scrollTop >= (currentSvgIndex * MINIMAP_HEIGHT)) {
                            // Remove transition previous slider
                            d3.select(allSvgs[currentSvgIndex - 1])
                                .select('.sliderRect').remove();
                            transitionSlider = null;
    
                            // Update state
                            currentSliderState = sliderState.BASE;
                        }
                    }

                    // If successfully transitioned
                    if (this.scrollTop >= (currentSvgIndex + 1) * MINIMAP_HEIGHT
                        || this.scrollTop < (currentSvgIndex * MINIMAP_HEIGHT) - SLIDER_HEIGHT) {
                        console.log("Entered transitioned svg");

                        // Remove current slider and drag behavior
                        currentSvg.select('.sliderRect').remove();
                        d3.select(currentSvg).on('mousedown.drag', null);

                        if (this.scrollTop >= (currentSvgIndex + 1) * MINIMAP_HEIGHT) {
                            currentSvgIndex += 1;
                        } else {
                            currentSvgIndex -= 1;
                        }

                        // Update variables
                        slider = d3.select(allSvgs[currentSvgIndex]).select('.sliderRect');
                        transitionSlider = null;
                        currentSvg = d3.select(allSvgs[currentSvgIndex]).call(drag);

                        // Update state
                        currentSliderState = sliderState.BASE;
                    }
                }

            });
    }


    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
         return (
            <div className="home">
                <div id="horizontalScrollView">

                    <div className="fileContainer">
                        <div>
                            <p>somefile1.txt</p>
                        </div>
                        <div className="svgContainer">
                            <div>
                                <svg width="96" height="256" preserveAspectRatio="xMidYMid meet">

                                    <text y="10" style={{fontSize: "2px"}}>
                                        <tspan x="10" y="0">/*</tspan>
                                        <tspan x="10" y="4"> * The following is a class for hello world but contains</tspan>
                                        <tspan x="10" y="8"> * functions for basic arithmetic operations.</tspan>
                                        <tspan x="10" y="12"> */</tspan>
                                        <tspan x="10" y="16"></tspan>
                                        <tspan x="10" y="20">public class Main {"{"}</tspan>
                                        <tspan x="10" y="24">    public static void main(String[] args) {"{"}</tspan>
                                        <tspan x="10" y="28">        System.out.println("Hello World!");</tspan>
                                        <tspan x="10" y="32">        test();</tspan>
                                        <tspan x="10" y="36">    {"}"}</tspan>
                                        <tspan x="10" y="40"></tspan>
                                        <tspan x="10" y="44">    public static void add(int a, int b) {"{"}</tspan>
                                        <tspan x="10" y="48">        return a + b;</tspan>
                                        <tspan x="10" y="52">    {"}"}</tspan>
                                        <tspan x="10" y="56"></tspan>
                                        <tspan x="10" y="60">    public static void subtract(int a, int b) {"{"}</tspan>
                                        <tspan x="10" y="64">        return a - b;</tspan>
                                        <tspan x="10" y="68">    {"}"}</tspan>
                                        <tspan x="10" y="72"></tspan>
                                        <tspan x="10" y="76">    public static void multiply(int a, int b) {"{"}</tspan>
                                        <tspan x="10" y="80">        return a * b;</tspan>
                                        <tspan x="10" y="84">    {"}"}</tspan>
                                        <tspan x="10" y="88"></tspan>
                                        <tspan x="10" y="92">    public static void divide(int a, int b) {"{"}</tspan>
                                        <tspan x="10" y="96">        return a / b;</tspan>
                                        <tspan x="10" y="100">    {"}"}</tspan>
                                        <tspan x="10" y="104"></tspan>
                                        <tspan x="10" y="108">    public static void mod(int a, int b) {"{"}</tspan>
                                        <tspan x="10" y="112">        return a % b;</tspan>
                                        <tspan x="10" y="116">    {"}"}</tspan>
                                        <tspan x="10" y="120"></tspan>
                                        <tspan x="10" y="124">    public static void power(int a, int b) {"{"}</tspan>
                                        <tspan x="10" y="128">        int result = a;</tspan>
                                        <tspan x="10" y="132">        for (int i = 0; i &lt; b - 1; i++) {"{"}</tspan>
                                        <tspan x="10" y="136">            result *= a;</tspan>
                                        <tspan x="10" y="140">        {"}"}</tspan>
                                        <tspan x="10" y="144">        return result;</tspan>
                                        <tspan x="10" y="148">    {"}"}</tspan>
                                        <tspan x="10" y="152"></tspan>
                                        <tspan x="10" y="156">    public static void test() {"{"}</tspan>
                                        <tspan x="10" y="160">        // Test all the functions</tspan>
                                        <tspan x="10" y="164">        int a = 20;</tspan>
                                        <tspan x="10" y="168">        int b = 5;</tspan>
                                        <tspan x="10" y="172"></tspan>
                                        <tspan x="10" y="176">        int resultAdd = add(a, b);</tspan>
                                        <tspan x="10" y="180">        int resultSubtract = subtract(a, b);</tspan>
                                        <tspan x="10" y="184">        int resultMultiply = multiply(a, b);</tspan>
                                        <tspan x="10" y="188">        int resultDivide = divide(a, b);</tspan>
                                        <tspan x="10" y="192">        int resultMod = mod(a, b);</tspan>
                                        <tspan x="10" y="196">        int resultPower = power(a, b);</tspan>
                                        <tspan x="10" y="200"></tspan>
                                        <tspan x="10" y="204">        System.out.println("Result of add was " + resultAdd.toString());</tspan>
                                        <tspan x="10" y="208">        System.out.println("Result of subtract was " + resultSubtract.toString());</tspan>
                                        <tspan x="10" y="212">        System.out.println("Result of multiply was " + resultMultiply.toString());</tspan>
                                        <tspan x="10" y="216">        System.out.println("Result of divide was " + resultDivide.toString());</tspan>
                                        <tspan x="10" y="220">        System.out.println("Result of mod was " + resultMod.toString());</tspan>
                                        <tspan x="10" y="224">        System.out.println("Result of power was " + resultPower.toString());</tspan>
                                        <tspan x="10" y="228">    {"}"}</tspan>
                                        <tspan x="10" y="232">{"}"}</tspan>
                                    </text>
                                </svg>
                            </div>
                            <div>
                                <svg width="96" height="256" preserveAspectRatio="xMidYMid meet">

                                    <text y="10" style={{fontSize: "2px"}}>
                                        <tspan x="10" dy="0">/*</tspan>
                                        <tspan x="10" dy="4"> * The following is a class for hello world but contains</tspan>
                                        <tspan x="10" dy="4"> * functions for basic arithmetic operations.</tspan>
                                        <tspan x="10" dy="4"> */</tspan>
                                        <tspan x="10" dy="4"></tspan>
                                        <tspan x="10" dy="4">public class Main {"{"}</tspan>
                                        <tspan x="10" dy="4">    public static void main(String[] args) {"{"}</tspan>
                                        <tspan x="10" dy="4">        System.out.println("Hello World!");</tspan>
                                        <tspan x="10" dy="4">        test();</tspan>
                                        <tspan x="10" dy="4">    {"}"}</tspan>
                                        <tspan x="10" dy="4"></tspan>
                                        <tspan x="10" dy="4">    public static void add(int a, int b) {"{"}</tspan>
                                        <tspan x="10" dy="4">        return a + b;</tspan>
                                        <tspan x="10" dy="4">    {"}"}</tspan>
                                        <tspan x="10" dy="4"></tspan>
                                        <tspan x="10" dy="4">    public static void subtract(int a, int b) {"{"}</tspan>
                                        <tspan x="10" dy="4">        return a - b;</tspan>
                                        <tspan x="10" dy="4">    {"}"}</tspan>
                                        <tspan x="10" dy="4"></tspan>
                                        <tspan x="10" dy="4">    public static void multiply(int a, int b) {"{"}</tspan>
                                        <tspan x="10" dy="4">        return a * b;</tspan>
                                        <tspan x="10" dy="4">    {"}"}</tspan>
                                        <tspan x="10" dy="4"></tspan>
                                        <tspan x="10" dy="4">    public static void divide(int a, int b) {"{"}</tspan>
                                        <tspan x="10" dy="4">        return a / b;</tspan>
                                        <tspan x="10" dy="4">    {"}"}</tspan>
                                        <tspan x="10" dy="4"></tspan>
                                        <tspan x="10" dy="4">    public static void mod(int a, int b) {"{"}</tspan>
                                        <tspan x="10" dy="4">        return a % b;</tspan>
                                        <tspan x="10" dy="4">    {"}"}</tspan>
                                        <tspan x="10" dy="4"></tspan>
                                        <tspan x="10" dy="4">    public static void power(int a, int b) {"{"}</tspan>
                                        <tspan x="10" dy="4">        int result = a;</tspan>
                                        <tspan x="10" dy="4">        for (int i = 0; i &lt; b - 1; i++) {"{"}</tspan>
                                        <tspan x="10" dy="4">            result *= a;</tspan>
                                        <tspan x="10" dy="4">        {"}"}</tspan>
                                        <tspan x="10" dy="4">        return result;</tspan>
                                        <tspan x="10" dy="4">    {"}"}</tspan>
                                        <tspan x="10" dy="4"></tspan>
                                        <tspan x="10" dy="4">    public static void test() {"{"}</tspan>
                                        <tspan x="10" dy="4">        // Test all the functions</tspan>
                                        <tspan x="10" dy="4">        int a = 20;</tspan>
                                        <tspan x="10" dy="4">        int b = 5;</tspan>
                                        <tspan x="10" dy="4"></tspan>
                                        <tspan x="10" dy="4">        int resultAdd = add(a, b);</tspan>
                                        <tspan x="10" dy="4">        int resultSubtract = subtract(a, b);</tspan>
                                        <tspan x="10" dy="4">        int resultMultiply = multiply(a, b);</tspan>
                                        <tspan x="10" dy="4">        int resultDivide = divide(a, b);</tspan>
                                        <tspan x="10" dy="4">        int resultMod = mod(a, b);</tspan>
                                        <tspan x="10" dy="4">        int resultPower = power(a, b);</tspan>
                                        <tspan x="10" dy="4"></tspan>
                                        <tspan x="10" dy="4">        System.out.println("Result of add was " + resultAdd.toString());</tspan>
                                        <tspan x="10" dy="4">        System.out.println("Result of subtract was " + resultSubtract.toString());</tspan>
                                        <tspan x="10" dy="4">        System.out.println("Result of multiply was " + resultMultiply.toString());</tspan>
                                        <tspan x="10" dy="4">        System.out.println("Result of divide was " + resultDivide.toString());</tspan>
                                        <tspan x="10" dy="4">        System.out.println("Result of mod was " + resultMod.toString());</tspan>
                                        <tspan x="10" dy="4">        System.out.println("Result of power was " + resultPower.toString());</tspan>
                                        <tspan x="10" dy="4">    {"}"}</tspan>
                                        <tspan x="10" dy="4">{"}"}</tspan>
                                    </text>
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>

                <div id="scrollContainer">
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <br></br>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </div>
            </div>
         );
     }
}

export default Home;