$(() => {
    const sensorMeasurements = getSensorMeasurements(num_points, min_hdiff, max_hdiff, init_sval);
    drawChart(sensorMeasurements.xs, sensorMeasurements.ys);

    const calculations = calculate(sensorMeasurements.ys);
    console.log(calculations);
    fillTable(calculations, $('#tbody-pid'))

})

const num_points = 100; // Number of points.

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

const kp = 0.009;
const ki = 0.003;
const kd = 0.029;

let tot_pid = 0;

let error = 0;
let preverror = 0;
let prevtime = 0.6;

const setpoint = 60; // Wanted value.

// Get sensor measurements with number of points, min height difference & max height difference.
function getSensorMeasurements(npoints, minhdiff, maxhdiff, inithval) {
    const heightdifference = (min, max) => Math.random() * (max - min) + min;
    const xs = [];
    const ys = [];
    let sensorval = inithval;
    for (let i = 0; i < npoints; i++) {
        sensorval += heightdifference(minhdiff, maxhdiff);
        if (sensorval < min_sval) {
            sensorval = min_sval;
        } else if (sensorval > max_sval) {
            sensorval = max_sval;
        }
        xs.push(i);
        ys.push(sensorval);
    }
    return { xs, ys };
}


function calculate(height) {
    const calcs = [];
    for (let j = 0; j < height.length; j++) {
        error = setpoint - height[j];

        p = kp * error;

        integral = (prevtime * preverror) + (prevtime * ((error - preverror) / 2));
        i = ki * integral;

        derivative = (error - preverror) / prevtime;
        d = kd * derivative;

        tot_pid = p + i + d;
        calcs.push({
            num: j,
            height: height[j].toFixed(5),
            error: error.toFixed(5),
            preverror: preverror.toFixed(5),
            p: p.toFixed(5),
            i: i.toFixed(5),
            d: d.toFixed(5),
            totalcontrol: tot_pid.toFixed(5),
        });
        preverror = error;
    }
    return calcs;
}

function drawChart(xs, ys) {
    var ctx = document.getElementById('pid-chart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xs,
            datasets: [{
                label: 'Signal',
                data: ys,
                backgroundColor: [
                    'rgba(41, 241, 195, 1)',
                ],
                borderColor: [
                    'rgba(30, 130, 76, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        display: true,
                        beginAtZero: true,
                        min: min_sval,
                        max: max_sval
                    }
                }]
            }
        }
    });
}


function fillTable(data, table) {
    const td = (data) => `<td>${data}</td>`;
    const tr = (n, height, error, p, i, d, tot) => `<tr>${td(n) + td(height) + td(error) + td(p) + td(i) + td(d) + td(tot)}</tr>`;
    for (point of data) {
        table.append(tr(point.num, point.height, point.error, point.p, point.i, point.d, point.totalcontrol))
    }
}