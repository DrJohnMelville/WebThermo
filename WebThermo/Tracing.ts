class Measurement
{
    tempInF: number;
    timeStamp: Date;
    constructor(tempInF: number, timeStamp: Date) {
        this.tempInF = tempInF;
        this.timeStamp = timeStamp;
    }
}

class AudioAlarm {
    overUnder: number = 1;

    checkTemp(temp: number, threshold: number) {
        if (((threshold - temp) * this.overUnder) > 0) return;
        this.overUnder *= -1;
        new Audio("alarm.mp3").play();
    }
}

class Tracing {
    side: string;
    output: any;
    data: Measurement[];
    baseTime: number;
    regressionColumn: number;
    regressionRow: number;
    max: number = -1;
    min: number = 1000;
    alarm: AudioAlarm = new AudioAlarm();

    constructor(side: string, regressionRow: number, regressionColumn: number) {
        this.side = side;
        this.output = $(side + ".numDisplay > span")[0];
        this.data = [];
        this.regressionRow = regressionRow;
        this.regressionColumn = regressionColumn;
        this.baseTime = new Date().getTime();
        this.selecctQuery().change(this.newSelection.bind(this));
        this.editQuery().change(this.editChanged.bind(this));

    }

    selecctQuery() {
        return $("select" + this.side);
    }
    editQuery() {
        return $("input" + this.side);
    }
    editChanged() {
        this.selecctQuery().val(-2);
    }

    newSelection() {
        this.editQuery().val(this.selecctQuery().val());
    }

    targetTemp() {
        return Number.parseFloat(this.editQuery().val().toString());
    }

    postTemperaturew(temp: number, timeStamp: Date, dataTable: any) {
        if (temp === null) {
            $(this.side).hide();
        } else {
            this.updateMaxMin(temp);
            $(this.side).show();
            this.output.innerText = Math.round(temp);
            this.output.innerText = Math.round(temp);
            this.rememberTemp(temp, timeStamp);
            this.addLine(dataTable, timeStamp, temp);
        }
    }

    updateMaxMin(temp: number) {
        this.min = temp > this.min ? this.min : temp;
        this.max = temp < this.max ? this.max : temp;
    }

    rememberTemp(temp: number, timeStamp: Date) {
        while (this.data.length > 599) {
            this.data.shift();
        }
        this.data.push(new Measurement(temp, timeStamp));
    }

    addLine(dataTable, timeStamp: Date, temp:number) {
        var reg = new Regression();
        for (let elt of this.data) {
            reg.addPoint(elt.timeStamp.getTime() - this.baseTime, elt.tempInF);
        }
        var line = reg.computeRegression();

        var target = this.targetTemp();
        var targetTime = line.xFromY(target);
        if (target < 0 || targetTime < 0) {
            this.eraseLine(dataTable);
            return;
        }

        this.alarm.checkTemp(temp, target);

        this.minPoint(dataTable, line);
        this.lineEndWithNumber(new Date(this.baseTime +line.xFromY(target)), target,
            1 + this.regressionRow,
            dataTable);
    }
    
    eraseLine(datagrid) {
        datagrid.setValue(this.regressionRow, this.regressionColumn, null);
        datagrid.setValue(this.regressionRow, this.regressionColumn+1, null);
        datagrid.setValue(this.regressionRow+1, this.regressionColumn, null);
        datagrid.setValue(this.regressionRow+1, this.regressionColumn+1, null);
    }

    minPoint(dataTable, line: LineEquation) {
        var beginTime = line.yFromX(0) < this.min ? line.xFromY(this.min) : 0;
        beginTime = line.yFromX(beginTime) > this.max ? line.xFromY(this.max) : beginTime;
        this.lineEnd(new Date(this.baseTime+beginTime), line.yFromX(beginTime), 0 + this.regressionRow, dataTable);

    }

    lineEndWithNumber(time: Date, temp: number, row: number, dataTable: any) {
        this.lineEnd(time, temp, row, dataTable);
        dataTable.setValue(row, this.regressionColumn + 1, time.toLocaleTimeString());
    }

    lineEnd(time: Date, temp: number, row: number, dataTable: any) {
        dataTable.setValue(row, 0, time);
        dataTable.setValue(row, this.regressionColumn, temp);
    }

}

class LineEquation {
    slope: number;
    intercept: number;
    constructor(slope: number, intercept: number) {
        this.slope = slope;
        this.intercept = intercept;
    }

    yFromX(x: number) {
        return (this.slope * x) + this.intercept;
    }

    xFromY(y: number) {
        return (y - this.intercept) / this.slope;
    }
}

class Regression {
    n: number = 0;
    sum_x: number = 0;
    sum_y: number = 0;
    sum_xy: number = 0;
    sum_xx: number = 0;
    sum_yy: number = 0;
    addPoint(x: number, y: number) {
        this.n++;
        this.sum_x += x;
        this.sum_y += y;
        this.sum_xx += x * x;
        this.sum_yy += y * y;
        this.sum_xy += x * y;
    }

    computeRegression(): LineEquation {
        let m = (this.n * this.sum_xy - this.sum_x * this.sum_y) /
            (this.n * this.sum_xx - this.sum_x * this.sum_x);
        return new LineEquation(m, (this.sum_y - m * this.sum_x) / this.n);
    }
}