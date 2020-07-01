import React, { Component } from 'react';

import * as d3 from 'd3';

import "../css/Home.css";

class Home extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        // this.state = {
        //     sliderState: 0,
        //     currentSvg: 0
        // };

        this.onSvgClicked = this.onSvgClicked.bind(this);
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
        let sliderPrev;
        let sliderNext;

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
        
        // let slider2 = d3.select("#svg1")
        //     .append('rect')
        //     .attr('class', 'sliderRect')
        //     .attr('width', minimapWidth)
        //     .attr('height', sliderHeight)
        //     .attr('y', 0 - ((currentSvg + 1) * minimapHeight));
        
        // When slider is dragged, scroll the content
        let drag = d3.drag()
            .on('start drag', function() { 
                console.log("drag()\nd3 event coordinates: " + d3.event);
                // scrollContainer.scrollTop = d3.event.y * minimapK - scrollHeight / 2;

                if (d3.event.y > ((currentSvgIndex + 1) * MINIMAP_HEIGHT)) {
                    console.log("Can't drag out");
                } else {
                    scrollContainer.scrollTop = d3.event.y + (currentSvgIndex * MINIMAP_HEIGHT);
                }
                // scrollContainer.scrollTop = d3.event.y + (currentSvg * minimapHeight);
            });
        
        let allSvgs = d3.selectAll(".svgContainer > div > svg").nodes();
        let currentSvg =  d3.select(allSvgs[currentSvgIndex])
            .call(drag);

        // Call drag object/function on the minimap
        // let svg0 = d3.select('#svg0')
        //     .attr('preserveAspectRatio', 'xMidYMid meet')
        //     .attr('width', minimapWidth)
        //     .attr('height', minimapHeight)
        //     .call(drag);
        // let svg1 = d3.select('#svg1')
        //     .attr('preserveAspectRatio', 'xMidYMid meet')
        //     .attr('width', minimapWidth)
        //     .attr('height', minimapHeight)
        //     .call(drag);
        
        // When content is scrolled, scroll the slider
        let container = d3.select(scrollContainer)
            // .on('scroll', this.onContentScroll, false);
            .on('scroll', function(d) {
                // slider.attr('y', this.scrollTop - (currentSvg * minimapHeight));
                console.log("scrollTop = " + this.scrollTop);
                slider.attr('y', this.scrollTop - (currentSvgIndex * MINIMAP_HEIGHT));

                // Determine slider state
                if (currentSliderState == sliderState.BASE) {
                    if (this.scrollTop >= (currentSvgIndex + 1) * MINIMAP_HEIGHT - SLIDER_HEIGHT
                        && currentSvgIndex + 1 < maxNumSvgs) {
                            console.log("Entering transition next...");

                        
                    }

                    // Create new slider for next svg
                    sliderNext = d3.select(allSvgs[currentSvgIndex + 1])
                        .append('rect')
                        .attr('class', 'sliderRect')
                        .attr('width', MINIMAP_WIDTH)
                        .attr('height', SLIDER_HEIGHT)
                        .attr('y', this.scrollTop - ((currentSvgIndex + 1) * MINIMAP_HEIGHT));

                    // Update state
                    currentSliderState = sliderState.TRANSITION_NEXT;
                }

                if (currentSliderState == sliderState.TRANSITION_NEXT) {
                    sliderNext.attr('y', this.scrollTop - ((currentSvgIndex + 1) * MINIMAP_HEIGHT));

                    if (this.scrollTop >= (currentSvgIndex + 1) * MINIMAP_HEIGHT) {
                        console.log("Entering base...");

                        // Remove current slider and drag behavior
                        currentSvg.select('.sliderRect').remove();
                        d3.select(currentSvg).on('mousedown.drag', null);

                        // Update variables
                        currentSvgIndex += 1;
                        slider = d3.select(allSvgs[currentSvgIndex]).select('.sliderRect');
                        sliderNext = null;
                        currentSvg =  d3.select(allSvgs[currentSvgIndex]).call(drag);

                        // Update state
                        currentSliderState = sliderState.BASE;
                    }
                    // Exit transition next
                    if (this.scrollTop < (currentSvgIndex + 1) * MINIMAP_HEIGHT - SLIDER_HEIGHT) {
                        // Remove transition next slider
                        d3.select(allSvgs[currentSvgIndex + 1])
                            .select('.sliderRect').remove();
                        sliderNext = null;

                        // Update state
                        currentSliderState = sliderState.BASE;
                    }
                }



                // for (let s of slidersArr) {
                //     s.attr('y', this.scrollTop - ((currentSvg + 1) * minimapHeight));
                // }

                // Not transitioning
                // if (sliderState === 0) {
                //     // Point at which slider touches bottom
                //     if (this.scrollTop > ((currentSvg + 1) * minimapHeight) - sliderHeight) {
                //         // slider.attr('y', this.scrollTop - (currentSvg * minimapHeight));
                //         // slider.attr('y', minimapHeight - sliderHeight);
                //         console.log("Slider touched bottom, transition state...");
                //         sliderState = 1;

                //         // d3.select('#svg1')
                //         //     .append('rect')
                //         //     .attr('class', 'sliderRect')
                //         //     .attr('width', minimapWidth)
                //         //     .attr('height', sliderHeight)
                //         //     .attr('y', this.scrollTop - ((currentSvg + 1) * minimapHeight));
                //     }

                //     // Point at which slider is out of frame
                //     // if (this.scrollTop > minimapHeight) {
                //     //     console.log("Slider out of frame");
                //     // }

                //     slider.attr('y', this.scrollTop - (currentSvg * minimapHeight));
                // } 
                // // Transitioning
                // else if (sliderState === 1) {
                //     slider.attr('y', this.scrollTop - (currentSvg * minimapHeight));
                //     // slider2.attr('y', this.scrollTop - ((currentSvg + 1) * minimapHeight) - sliderHeight);
                //     d3.select('#svg1 .sliderRect')
                //         .attr('y', this.scrollTop - ((currentSvg + 1) * minimapHeight));
                // }
            });
    }

    onSvgClicked() {
        console.log("Test");
        // if (!event.target.closest('#svg0')) {
        //     return;
        // }

        // console.log("onSvgClicked()");

        // let svg = event.target.closest('#svg0');
        // var pt = svg.createSVGPoint();  // Created once for document

        // this.alertCoords(event, svg, pt);
    }

    // alertCoords(evt, svg, pt) {
    //     pt.x = evt.clientX;
    //     pt.y = evt.clientY;
    
    //     // The cursor point, translated into svg coordinates
    //     let cursorpt =  pt.matrixTransform(svg.getScreenCTM().inverse());
    //     console.log("(" + cursorpt.x + ", " + cursorpt.y + ")");

    //     let rect = svg.querySelector('rect');

    //     this.updateSlider(evt, rect, cursorpt);
    // }

    // updateSlider(evt, rect, cursorPoint) {
    //     const SLIDER_RECT_WIDTH = 96;
    //     const SLIDER_RECT_HEIGHT = 50;

    //     if (cursorPoint.y < SLIDER_RECT_HEIGHT) {
    //         rect.setAttribute('y', 0);
    //     } else if (cursorPoint.y > (256 -  SLIDER_RECT_HEIGHT)) {
    //         rect.setAttribute('y', 256 - SLIDER_RECT_HEIGHT);
    //     } else {
    //         rect.setAttribute('y', cursorPoint.y - Math.floor(SLIDER_RECT_HEIGHT / 2));
    //     }
    // }


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