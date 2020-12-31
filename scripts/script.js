$(() => {
    // Get measurements and calculations.
    const sensorMeasurements = getSensorMeasurements(num_points, min_hdiff, max_hdiff, init_sval);
    const calculations = calculate(sensorMeasurements);

    // Reformat (for chart values).
    const reformattedCalculations = reformatCalculations(calculations);

    // Lines.
    const heightLine = drawLine('Height', reformattedCalculations.heights, '#19b5fe');
    const errorLine = drawLine('Error', reformattedCalculations.errors, '#f03434');
    const pLine = drawLine('P', reformattedCalculations.ps, '#00e640');
    const iLine = drawLine('I', reformattedCalculations.is, '#eeee00');
    const dLine = drawLine('D', reformattedCalculations.ds, '#f9690e');
    const totalLine = drawLine('total', reformattedCalculations.totals, '#9a12b3');

    // Options for heights chart.
    const heightsOptions = setChartOptions(min_chartval, max_chartval);

    // Draw charts.
    drawChart($('#heights-chart'), reformattedCalculations.nums, [heightLine, errorLine], heightsOptions);
    drawChart($('#pid-chart'), reformattedCalculations.nums, [pLine, iLine, dLine, totalLine,]); // With default responsive options.

    // Fill up table.
    fillTable(calculations, $('#tbody-pid'));
})

const num_points = 20; // Number of points.

// Sensor.
const init_sval = 50; // Initial sensorval.
const min_sval = 0; // Min and max sensorval.
const max_sval = 100;
const min_hdiff = -4; // Min and max height difference for next measurement.
const max_hdiff = 4;

// PID.
let p = 0;
let i = 0;
let d = 0;

let integral = 0;
let derivative = 0;

const kp = 0.01;
const ki = 0.004;
const kd = 0.005;

let tot_pid = 0;

let error = 0;
let preverror = 0;
let prevtime = 0.6;

const setpoint = 60; // Wanted value.

// Chart.
const min_chartval = -20;
const max_chartval = max_sval;

// Get sensor measurements with number of points, min height difference & max height difference.
function getSensorMeasurements(npoints, minhdiff, maxhdiff, inithval) {
    const heightdifference = (min, max) => Math.random() * (max - min) + min;
    const heights = [];
    let sensorval = inithval;
    for (let i = 0; i < npoints; i++) {
        sensorval += heightdifference(minhdiff, maxhdiff);
        if (sensorval < min_sval) {
            sensorval = min_sval;
        } else if (sensorval > max_sval) {
            sensorval = max_sval;
        }
        heights.push(sensorval);
    }
    return heights;
}


function calculate(heights) {
    const calcs = [];
    for (let j = 0; j < heights.length; j++) {
        error = setpoint - heights[j];

        p = kp * error;

        integral = (prevtime * preverror) + (prevtime * ((error - preverror) / 2));
        i = ki * integral;

        derivative = (error - preverror) / prevtime;
        d = kd * derivative;

        tot_pid = p + i + d;

        // Push values.
        calcs.push({
            num: j,
            height: heights[j].toFixed(5),
            error: error.toFixed(5),
            preverror: preverror.toFixed(5),
            p: p.toFixed(5),
            i: i.toFixed(5),
            d: d.toFixed(5),
            total: tot_pid.toFixed(5),
        });

        preverror = error;
    }
    return calcs;
}

function reformatCalculations(calculations) {
    const calcFormat = {
        nums: [],
        heights: [],
        errors: [],
        ps: [],
        is: [],
        ds: [],
        totals: [],
    }

    for (let calculation of calculations) {
        calcFormat.nums.push(calculation.num);
        calcFormat.heights.push(calculation.height);
        calcFormat.errors.push(calculation.error);
        calcFormat.ps.push(calculation.p);
        calcFormat.is.push(calculation.i);
        calcFormat.ds.push(calculation.d);
        calcFormat.totals.push(calculation.total);
    }

    return calcFormat;
}

function drawChart(chartlocation, xs, lines, chartoptions = {}) {
    const ch = new Chart(chartlocation, {
        type: 'line',
        data: {
            labels: xs,
            datasets: lines,
        },
        options: chartoptions,
    });
}

function drawLine(label, yvals, bordercol) {
    return {
        label: label,
        data: yvals,
        borderColor: [
            bordercol,
        ],
        borderWidth: 1
    }
}

function setChartOptions(minval, maxval) {
    return {
        scales: {
            yAxes: [{
                ticks: {
                    display: true,
                    beginAtZero: true,
                    min: minval,
                    max: maxval,
                }
            }]
        }
    }
}

function fillTable(data, table) {
    const td = (x) => `<td>${x}</td>`;
    const tr = (n, height, error, p, i, d, tot) => `<tr>${td(n) + td(height) + td(error) + td(p) + td(i) + td(d) + td(tot)}</tr>`;
    for (let point of data) {
        table.append(tr(point.num, point.height, point.error, point.p, point.i, point.d, point.totpid));
    }
}