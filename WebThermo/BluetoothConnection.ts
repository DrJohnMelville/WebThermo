


class BluetoothConnection {
// I do not use it but the characteristic that the thermometer listens on is:
//  6e400001-b5a3-f393-e0a9-e50e24dcca9e -- advertised service for the bluetooth thermometer
//  6e400002-b5a3-f393-e0a9-e50e24dcca9e -- computer --> thermometer channel
//  6e400003-b5a3-f393-e0a9-e50e24dcca9e -- thermometer --> computer channel

    ui: UiViewModel;
    constructor(ui: UiViewModel) {
        this.ui = ui;
    }

    connect() {
        //the following request is more specific, but gives me less info about whaat is going on.
//        navigator.bluetooth.requestDevice({ filters: [{services:['6e400001-b5a3-f393-e0a9-e50e24dcca9e']}]})

        navigator.bluetooth
            .requestDevice({ acceptAllDevices: true, optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] })
            .then(i => i.gatt.connect())
            .then(i => i.getPrimaryServices())
            .then(i => i[0].getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e'))
            .then(i => i.startNotifications())
            .then(i => {
                i.addEventListener('characteristicvaluechanged', this.thermometerEvent.bind(this));
                this.ui.connected();
            })
            .catch(error => console.log(error));
    }

    thermometerEvent(event) {
        let value = event.target.value;
        let message = value.buffer ? value : new DataView(value);
        switch (message.getUint8(0)) {
        case 84: // T -- new temp data
            this.ui.tempArrived(this.convertToTemp(message.getUint16(1)), 
                this.convertToTemp(message.getUint16(3)), 
                new Date());
        case 65: // alert sounding
            // send a 1 byte array -- 97 to silence the alarm
            break;
        case 66: // B -- button pressed
            this.ui.thermoButtonPressed();
        }
    }

    convertToTemp(value) {
        let tempInC = (value) / 100.0;
        let tempInF = (tempInC * 9 / 5) + 32;
        return tempInF;
    }
}