$(() => {
    const sensorMeasurements = getSensorMeasurements(num_points, min_hdiff, max_hdiff, init_sval);
    const calculations = calculate(sensorMeasurements);

    drawChart(calculations.nums, calculations);

    console.log(calculations);
    fillTable(calculations.calculations, $('#tbody-pid'));

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
    return heights ;
}


function calculate(heights) {
    const calcs = [];
    const nums = [];
    const heights = [];
    const errors = [];
    const ps = [];
    const is = [];
    const ds = [];
    const tots = [];
    for (let j = 0; j < heights.length; j++) {
        error = setpoint - heights[j];

        p = kp * error;

        integral = (prevtime * preverror) + (prevtime * ((error - preverror) / 2));
        i = ki * integral;

        derivative = (error - preverror) / prevtime;
        d = kd * derivative;

        tot_pid = p + i + d;
        calcs.push({
            num: j,
            height: heights[j].toFixed(5),
            error: error.toFixed(5),
            preverror: preverror.toFixed(5),
            p: p.toFixed(5),
            i: i.toFixed(5),
            d: d.toFixed(5),
            totpid: tot_pid.toFixed(5),
        });
        nums.push(j);
        heights.push(heights[j]);
        errors.push(error);
        ps.push(p);
        is.push(i);
        ds.push(d);
        tots.push(tot_pid);

        preverror = error;
    }
    return {
        calculations: calcs,
        nums: nums,
        heights: heights,
        errors: errors,
        ps: ps,
        is: is,
        ds: ds,
        tots: tots,
    };
}

function drawChart(xs, data) {
    var heightschart = document.getElementById('heights-chart').getContext('2d');
    var hchart = new Chart(heightschart, {
        type: 'line',
        data: {
            labels: xs,
            datasets: [
                drawLine('Height', data.heights, '#19b5fe'),
                drawLine('Error', data.errors, '#f03434'),
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        display: true,
                        beginAtZero: true,
                        min: min_chartval,
                        max: max_chartval,
                    }
                }]
            }
        }
    });
    var pidchart = document.getElementById('pid-chart').getContext('2d');
    var pchart = new Chart(pidchart, {
        type: 'line',
        data: {
            labels: xs,
            datasets: [
                drawLine('P', data.ps, '#00e640'),
                drawLine('I', data.is, '#eeee00'),
                drawLine('D', data.ds, '#f9690e'),
                drawLine('total', data.tots, '#9a12b3'),
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        display: true,
                        beginAtZero: true,
                        
                    }
                }]
            }
        }
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


function fillTable(data, table) {
    const td = (x) => `<td>${x}</td>`;
    const tr = (n, height, error, p, i, d, tot) => `<tr>${td(n) + td(height) + td(error) + td(p) + td(i) + td(d) + td(tot)}</tr>`;
    for (let point of data) {
        table.append(tr(point.num, point.height, point.error, point.p, point.i, point.d, point.totpid));
    }
}