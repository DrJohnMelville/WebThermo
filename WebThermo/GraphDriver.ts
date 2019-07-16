declare var google: any;
class GraphDriver {
    data: any;
    greenTracing: Tracing;
    redTracing: Tracing;
    chart: any;
    options: any;
    constructor(greenTracing: Tracing, redTracing: Tracing) {
        this.greenTracing = greenTracing;
        this.redTracing = redTracing;
        this.loadChartApi();
    }

    loadChartApi() {
        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(this.setupChart.bind(this));

    }

    setupChart() {
        this.createChart();
        this.setupDataTable();
        this.addPrefixLines();

    }

    createChart() {
        this.options = {
            chartArea: { left: 50, right: 30, top: 10, bottom: 30 },
            colors: ["teal", "teal", "red", "red"],
            vAxis: {viewWindowMode: 'pretty'}
        };
        this.chart = new google.visualization.LineChart($('.graph')[0]);
    }

    setupDataTable() {
        this.data = new google.visualization.DataTable();
        this.data.addColumn('date', 'time');
        this.data.addColumn('number', 'greenTemp');
        this.data.addColumn({ type:'string', role:'annotation' }, 'greenTempText');
        this.data.addColumn('number', 'greenLine`');
        this.data.addColumn({ type:'string', role:'annotation' }, 'greenText');
        this.data.addColumn('number', 'redTemp');
        this.data.addColumn({ type:'string', role:'annotation' }, 'retTempText');
        this.data.addColumn('number', 'redLine`');
        this.data.addColumn({ type:'string', role:'annotation' }, 'redText');
    }

    addPrefixLines() {
        for (let i = 0; i < 4; i++) {
            this.data.addRows([[null, null, null, null, null, null, null, null, null]]);
        }
    }

    addTemp(timeStamp: Date, greenTemp: number, redTemp: number) {
        greenTemp = this.isvalidTemp(greenTemp) ? greenTemp : null;
        redTemp = this.isvalidTemp(redTemp) ? redTemp : null;
        if (redTemp === null && greenTemp == null) return;
        this.addVerifiedTemp(timeStamp, greenTemp, redTemp);
    }

    isvalidTemp(temp: number) { return temp <= 626; }

    addVerifiedTemp(timeStamp: Date, greenTemp: number, redTemp: number) {
        greenTemp = this.greenTracing.postTemperature(greenTemp, timeStamp, this.data);
        redTemp = this.redTracing.postTemperature(redTemp, timeStamp, this.data);
        if (this.data === undefined) return;
        this.deletePriorTemps();
        this.data.addRows([[timeStamp, greenTemp, this.tempString(greenTemp), null, null,
                                       redTemp, this.tempString(redTemp), null, null]]);
        this.chart.draw(this.data, this.options);
    }

    deletePriorTemps() {
        let row = this.data.getNumberOfRows() - 1;
        this.data.setValue(row, 2, null);
        this.data.setValue(row, 6, null);
    }

    tempString(temp: number) {
        return `${Math.round(temp)} °F`;
    }

    reset() {
        this.setupDataTable();
    }
}