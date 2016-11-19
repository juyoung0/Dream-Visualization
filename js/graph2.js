/**
 * Created by 오주영 on 2016-11-16.
 */
d3.csv("../dream.csv", function(error,dataSet) {
    //read data : frequency,memory,action,lucid,dejavu
    dataSet.forEach(function (d) {
        d.frequency = +d.frequency;
        d.memory = d.memory;
        d.action = d.action;
        d.lucid = +d.lucid;
        d.dejavu = +d.dejavu;
    });

    const maxVal = [4, 3, 3, 4, 3];
    var color1 = d3.scale.category20b();
    var color2 = d3.scale.category20c();
    var colNum = ["frequency", "memory", "action", "lucid", "dejavu"];
    var row = 0;
    var col = 1;

    function getNum(col, Data) {
        result = [];
        for (var j = 0; j < maxVal[col]; j++) {
            result[j] = 0;
        }

        var val;
        for (var i = 0; i < Data.length; i++) {
            if (col == 0) val = Data[i].frequency;
            else if (col == 1) val = Data[i].memory;
            else if (col == 2) val = Data[i].action;
            else if (col == 3) val = Data[i].lucid;
            else if (col == 4) val = Data[i].dejavu;

            result[val - 1]++;
        }
        return result;
    }

    function getText(col, d) {
        if (col == 0) {//freq
            if (d == 0) return "Almost Everyday";
            else if (d == 1) return "3~4 times / week";
            else if (d == 2) return "3~4 times / month";
            else if (d == 3) return "few times / year";
        }
        else if (col == 1) {//memory
            if (d == 0) return "Memorize vividly";
            else if (d == 1) return "Remember dimly";
            else if (d == 2) return "Forget all";
        }
        else if (col == 2) {//action
            if (d == 0) return "Memo it";
            else if (d == 1) return "Tell somebody";
            else if (d == 2) return "Nothing";
        }
        else if (col == 3) {//lucid
            if (d == 0) return "Control freely";
            else if (d == 1) return "Frequently";
            else if (d == 2) return "few times";
            else if (d == 3) return "Never";
        }
        else if (col == 4) {//dejavu
            if (d == 0) return "Frequently";
            else if (d == 1) return "several times";
            else if (d == 2) return "Never";
        }

    }

    function filtering(col, data, i) {
        if (col == 0)
            var st = data.filter(function (s) {
                return s.frequency - 1 == i;
            });
        else if (col == 1)
            var st = data.filter(function (s) {
                return s.memory - 1 == i;
            });
        else if (col == 2)
            var st = data.filter(function (s) {
                return s.action - 1 == i;
            });
        else if (col == 3)
            var st = data.filter(function (s) {
                return s.lucid - 1 == i;
            });
        else if (col == 4)
            var st = data.filter(function (s) {
                return s.dejavu - 1 == i;
            });

        return st;
    }

    function plot(row, col, div) {
        var pl = {}, pDim = {t: 100, r: 200, b: 100, l: 200};
        pDim.w = 1000 - pDim.l - pDim.r;
        pDim.h = 800 - pDim.t - pDim.b;

        var PLOTsvg = d3.select(div).append("svg")
            .attr("id", "plot")
            .attr("width", pDim.w + pDim.l + pDim.r)
            .attr("height", pDim.h + pDim.t + pDim.b)
            .append("g")
            .attr("transform", "translate(" + pDim.l + "," + pDim.t + ")");

        var xDomain = [];
        if (maxVal[row] == 3)  xDomain = [0, 1, 2];
        else xDomain = [0, 1, 2, 3];

        var yDomain = [];
        if (maxVal[col] == 3)  yDomain = [0, 1, 2];
        else yDomain = [0, 1, 2, 3];

        //made data array
        var plotArray = [];
        for (var i = 0; i < xDomain.length; i++) {
            var st = filtering(row, dataSet, i);
            for (var j = 0; j < yDomain.length; j++) {
                var st2 = filtering(col, st, j);
                plotArray[(yDomain.length) * i + j] = st2.length;
            }
        }

        var x = d3.scale.ordinal()
            .domain(xDomain)
            .rangeRoundBands([0, pDim.w], 0.1);

        var y = d3.scale.ordinal()
            .domain(yDomain)
            .rangeRoundBands([pDim.h, 0], 0.1);

        var r = d3.scale.linear().range([0, 5000])
            .domain([0, d3.max(plotArray)]);

        //X-axis
        PLOTsvg.append("g")
            .selectAll("text")
            .data(xDomain).enter()
            .append("text")
            .text(function (d, i) {
                return getText(row, maxVal[row] - 1 - i);
            })
            .attr("x", function (d, i) {
                return x(i) + pDim.l;
            })
            .attr("y", function (d, i) {
                return 0;
            })
            .attr("text-anchor", "middle")
            .style("fill", "black")
            .style("font-size", "13pt");

        //Y-axis
        PLOTsvg.append("g")
            .selectAll("text")
            .data(yDomain).enter()
            .append("text")
            .text(function (d, i) {
                return getText(col, maxVal[col] - 1 - i);
            })
            .attr("x", function (d, i) {
                return 0;
            })
            .attr("y", function (d, i) {
                return y(i) + pDim.b;
            })
            .attr("text-anchor", "middle")
            .style("fill", "black")
            .style("font-size", "13pt");

        //tool tip
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d, i) {
                return "<span style='color:red'>" + plotArray[i] + "</span> <strong>in 143</strong>";
            })
        PLOTsvg.call(tip);

        var dots = PLOTsvg.selectAll(".circle")
            .data(plotArray)
            .enter()
            .append("g")
            .attr("class", "circle");

        dots.append("circle")
            .attr("cx", function (d, i) {
                return x(xPoisition(plotArray.length, maxVal[row], i));
            })
            .attr("cy", function (d, i) {
                return y(maxVal[col] - 1 - i % (maxVal[col]));
            })
            .attr("r", function (d, i) {
                return Math.round(Math.sqrt(r(plotArray[i])));
            })
            .attr("transform", "translate(" + pDim.l + " , " + pDim.b + ")")
            //  .style("opacity", 0.5)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        dots.append("text")
            .text(function (d, i) {
                var percentage = d3.format("%")(plotArray[i] / d3.sum(plotArray.map(function (v) {
                        return v;
                    })));
                console.log(percentage);
                return percentage;
            })
            .attr("x", function (d, i) {
                return x(xPoisition(plotArray.length, maxVal[row], i));
            })
            .attr("y", function (d, i) {
                console.log(maxVal[col] - 1 - i % (maxVal[col]));
                return y(maxVal[col] - 1 - i % (maxVal[col]));
            })
            .attr("transform", "translate(" + pDim.l + " , " + pDim.b + ")")
            .transition().duration(500)
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "12pt");

        function xPoisition(length, rowNum, i) {
            var colNum = length / rowNum;
            var pos = 0;
            for (var j = 1; j <= rowNum; j++) {
                if (i < j * colNum) {
                    pos = rowNum - j;
                    j = 2 * rowNum;
                }
            }
            return pos;
        }

        window.rowFilter = function (type) {
            for (var i = 0; i < 5; i++) {
                if (type == colNum[i]){
                        console.log("row change");
                        row = i;
                    }
            }
            d3.select("#plot").remove();
            pl = plot(row, col, "#graph");
        };

        window.colFilter = function (type) {
            for (var i = 0; i < 5; i++) {
                if (type == colNum[i]){
                    console.log("col change");
                    col = i;
                }
            }
            d3.select("#plot").remove();
            pl = plot(row, col, "#graph");
        };

     return pl;
    }

    var pl = plot(row, col, "#graph");

});