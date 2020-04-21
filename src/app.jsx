import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';




import { List } from './components/list.jsx';
import styles from './less/site.less';


export class App extends React.Component {
    constructor(props) {
        super(props);

        let date = new Date();
        let month = date.getMonth() + 1;

        console.log('date.getHours():  ', date.getHours());

        this.state = {
            listData: {},
            dataType: localStorage.getItem('dataType') || 'bugs',
            hemi: localStorage.getItem('hemi') || 'N',
            selectedMonth: month,
            selectedDate: date,
            selectedTime: date.getHours()
        };

        this.timeMap = {
            1: '1am',
            2: '2am',
            3: '3am',
            4: '4am',
            5: '5am',
            6: '6am',
            7: '7am',
            8: '8am',
            9: '9am',
            10: '10am',
            11: '11am',
            12: '12pm',
            13: '1pm',
            14: '2pm',
            15: '3pm',
            16: '4pm',
            17: '5pm',
            18: '6pm',
            19: '7pm',
            20: '8pm',
            21: '9pm',
            22: '10pm',
            23: '11pm'
        };
        this.monthMap = {
            1: 'Jan.',
            2: 'Feb.',
            3: 'Mar.',
            4: 'Apr.',
            5: 'May',
            6: 'June',
            7: 'July',
            8: 'Aug.',
            9: 'Sept.',
            10: 'Oct.',
            11: 'Nov.',
            12: 'Dec.'
        };

        this.getData = this.getData.bind(this);
        this.onHemiChange = this.onHemiChange.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.onDataTypeChange = this.onDataTypeChange.bind(this);
        this.filterResults = this.filterResults.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);

        this.getData();
    }

    getData() {
        fetch('data.json')
            .then(r => r.json())
            .then((data) => {
                console.log('data: ', data);
                this.bugs = this.processData(data.bugs);
                this.fish = this.processData(data.fish);
                console.log('this.bugs: ', this.bugs);

                this.setState({
                    listData: this.state.dataType === 'bugs' ? this.bugs : this.fish
                });

                this.filterResults();
            });
    }

    processData(data) {
        let timeLabel;
        let monthLabel;

        data.map(d => {
            timeLabel = this.processTimeLabel(d);
            d.time = timeLabel;
            monthLabel = this.processMonthLabel(d, 'N');
            d.monthsN = monthLabel;
            monthLabel = this.processMonthLabel(d, 'S');
            d.monthsS = monthLabel;
        });

        return data;
    }

    processTimeLabel(data) {
        let label = '';
        if (data.timeStart === -1) {
            label = 'All Day';
        } else {
            label += this.timeMap[data.timeStart] + ' - ' + this.timeMap[data.timeEnd];

            if (data.timeStart2) {
                label += ' / ' + this.timeMap[data.timeStart2] + ' - ' + this.timeMap[data.timeEnd2];
            }
        }

        return label;
    }

    processMonthLabel(data, hemi) {
        let label = '';

        if (data['monthStart' + hemi] === -1) {
            label = 'All Year';
        } else {
            label += this.monthMap[data['monthStart' + hemi]];

            if (data['monthEnd' + hemi] !== -1) {
                label += ' - ' + this.monthMap[data['monthEnd' + hemi]]
            }
            if (data['monthStart' + hemi + '2']) {
                label += ' / ' + this.monthMap[data['monthStart' + hemi + '2']] + ' - ' + this.monthMap[data['monthEnd' + hemi + '2']];
            }
        }

        return label;
    }

    onHemiChange(evt, hemi) {
        console.log('hemi change ', hemi);
        localStorage.setItem('hemi', hemi);
        this.setState({
            hemi: hemi
        }, () => {
            this.filterResults()
        });
    }

    onDataTypeChange(evt, dataType) {
        console.log('onDataTypeChange change ', dataType);
        localStorage.setItem('dataType', dataType);
        this.setState({
            dataType: dataType,
            listData: dataType === 'bugs' ? this.bugs : this.fish
        }, () => {
            this.filterResults()
        });
    }

    onDateChange(evt, date) {
        console.log('onDateChange change ', date);
        date = +date.split('/')[0];
        this.setState({
            selectedDate: date
        }, () => {
            this.filterResults()
        });
    }
    onTimeChange(evt, time) {
        console.log('onTimeChange change ', time);
        time = +time.split(':')[0];
        this.setState({
            selectedTime: time
        }, () => {
            this.filterResults()
        });
    }

    filterResults() {
        let dt = this.state.dataType;
        let data = this[dt];
        let time = this.state.selectedTime;
        let month = this.state.selectedMonth;
        let hemi = this.state.hemi;
        let inTime;
        let inMonth;
        let overnight;
        let overyear;
        let hemiKeyStart;
        let hemiKeyEnd;
        console.log('filterResults "time" ', time);
        console.log('filterResults "hemi" ', hemi);

        data = data.filter(d => {
            inTime = false;
            inMonth = false;
            overnight = d.timeStart > d.timeEnd;
            hemiKeyStart = 'monthStart' + hemi;
            hemiKeyEnd = 'monthEnd' + hemi;
            overyear = d[hemiKeyStart] > d[hemiKeyEnd];

            if (d.timeStart === -1) {
                inTime = true;
            } else {
                if (overnight) {
                    inTime = ((time >= d.timeStart && time < 24) || (time >= 0 && time < d.timeEnd));

                    if (!inTime && d.timeStart2) {
                        // see if there is a timeStart2
                        inTime = ((time >= d.timeStart2 && time < 24) || (time >= 0 && time < d.timeEnd2));
                    }
                } else {
                    inTime = time >= d.timeStart && time < d.timeEnd;

                    if (!inTime && d.timeStart2) {
                        inTime = time >= d.timeStart2 && time < d.timeEnd2;
                    }
                }
            }

            if (d[hemiKeyStart] === -1) {
                inMonth = true;
            } else {
                if (overyear) {
                    inMonth = ((month >= d[hemiKeyStart] && month <= 12) || (month >= 1 && month <= d[hemiKeyEnd]));

                    if (!inMonth && d[hemiKeyStart + '2']) {
                        inMonth = (
                            (month >= d[hemiKeyStart + '2'] && month <= 12) ||
                            (month >= 1 && month <= d[hemiKeyEnd + '2'])
                        );
                    }
                } else {
                    inMonth = month >= d[hemiKeyStart] && month <= d[hemiKeyEnd];

                    if (!inMonth && d[hemiKeyStart + '2']) {
                        inMonth = month >= d[hemiKeyStart + '2'] && month <= d[hemiKeyEnd + '2'];
                    }
                }
            }

            return inTime && inMonth
        });

        this.setState({
            listData: data
        });
        console.log('filterResults DATA: ', data);

    }

    render() {
        console.log('this.bugs: ', this.bugs);

        return (
            <div>
                <div className={styles.filterRow}>
                    <Grid container justify="space-around">
                        <div className={styles.dataTypeControl}>
                            <FormControl component="fieldset">
                                <RadioGroup row
                                            aria-label="position"
                                            name="dataType"
                                            defaultValue={this.state.dataType}
                                            onChange={this.onDataTypeChange}>
                                    <FormControlLabel
                                        value="bugs"
                                        control={<Radio color="primary" />}
                                        label="Bugs"
                                        labelPlacement="top"
                                    />
                                    <FormControlLabel
                                        value="fish"
                                        control={<Radio color="primary" />}
                                        label="Fish"
                                        labelPlacement="top"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </div>

                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="MM/dd/yyyy"
                                margin="normal"
                                id="date-picker-inline"
                                label="Date"
                                value={this.state.selectedDate}
                                onChange={this.onDateChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                            <KeyboardTimePicker
                                margin="normal"
                                id="time-picker"
                                label="Time"
                                value={this.state.selectedDate}
                                onChange={this.onTimeChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change time',
                                }}
                            />
                        </MuiPickersUtilsProvider>

                        <div className={styles.hemisphereControl}>
                            <FormControl component="fieldset">
                                <RadioGroup row
                                            aria-label="position"
                                            name="hemisphere"
                                            defaultValue={this.state.hemi}
                                            onChange={this.onHemiChange}>
                                    <FormControlLabel
                                        value="N"
                                        control={<Radio color="primary" />}
                                        label="Northern"
                                        labelPlacement="top"
                                    />
                                    <FormControlLabel
                                        value="S"
                                        control={<Radio color="primary" />}
                                        label="Southern"
                                        labelPlacement="top"
                                    />

                                </RadioGroup>
                            </FormControl>
                        </div>
                    </Grid>

                </div>
                <div>
                    <List
                        listData={this.state.listData}
                        hemi={this.state.hemi}
                    />
                </div>
            </div>
        );
    }
}
