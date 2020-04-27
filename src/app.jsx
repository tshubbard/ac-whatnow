import React from 'react';
import Container from '@material-ui/core/Container';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';

import { List } from './components/list.jsx';
import { TIME_MAP, MONTH_MAP } from './constants.js';
import styles from './less/site.less';

export class App extends React.Component {
    constructor(props) {
        super(props);

        let date = new Date();
        let month = date.getMonth() + 1;

        this.state = {
            listData: {},
            dataType: localStorage.getItem('dataType') || 'bugs',
            hemi: localStorage.getItem('hemi') || 'N',
            selectedMonth: month,
            selectedTime: date.getHours()
        };

        this.timeMap = TIME_MAP;
        this.monthMap = MONTH_MAP;

        this.getData = this.getData.bind(this);
        this.onHemiChange = this.onHemiChange.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.onDataTypeChange = this.onDataTypeChange.bind(this);
        this.filterResults = this.filterResults.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);

        this.getData();
    }

    /**
     * Fetches the json data for the site
     */
    getData() {
        fetch('data.json')
            .then(r => r.json())
            .then((data) => {
                console.log('data: ', data);
                this.bugs = this.processData(data.bugs);
                this.fish = this.processData(data.fish);

                // set the initial listData
                this.setState({
                    listData: this.state.dataType === 'bugs' ? this.bugs : this.fish
                });

                this.filterResults();
            });
    }

    /**
     * Processes initial data load and adds time and month labels
     *
     * @param {Object} data The JSON data initially loaded
     * @return {*}
     */
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

    /**
     * Processes an individual data node to add the Time Label
     *
     * @param {Object} data The JSON data to process
     * @return {string}
     */
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

    /**
     * Processes an individual data node to add the Month Label
     *
     * @param {Object} data The JSON data to process
     * @param {string} hemi Which Hemisphere
     * @returns {string}
     */
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

    /**
     * Handles when the Hemisphere is changed
     *
     * @param evt
     * @param {string} hemi Which Hemisphere
     */
    onHemiChange(evt, hemi) {
        if (!hemi) {
            return;
        }

        // set the hemisphere on localstorage for the next page visit or refresh
        localStorage.setItem('hemi', hemi);
        this.setState({
            hemi: hemi
        }, () => {
            this.filterResults()
        });
    }

    /**
     * Handles when the DataType is changed - Bugs or Fish
     *
     * @param evt
     * @param {string} dataType If we're showing bugs or fish
     */
    onDataTypeChange(evt, dataType) {
        if (!dataType) {
            return;
        }

        // set the item on localstorage for the next page visit or refresh
        localStorage.setItem('dataType', dataType);
        this.setState({
            dataType: dataType,
            listData: dataType === 'bugs' ? this.bugs : this.fish
        }, () => {
            this.filterResults()
        });
    }

    /**
     * Handles when the Month is changed
     *
     * @param evt
     * @param {Number} date The Month number we changed to
     */
    onDateChange(evt, date) {
        this.setState({
            selectedMonth: date.props.value
        }, () => {
            this.filterResults()
        });
    }

    /**
     * Handles when the Time is changed
     *
     * @param evt
     * @param {Number} time The time user changed to
     */
    onTimeChange(evt, time) {
        this.setState({
            selectedTime: time.props.value
        }, () => {
            this.filterResults()
        });
    }

    /**
     * Filters all the results
     */
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
    }

    render() {
        return (
            <Container elevation={3}>
                <h1><img src={'logo.png'} alt={'AC-WhatNow.com Logo'}/></h1>
                <h3>Your source to find out what's available in Animal Crossing: New Horizons RIGHT NOW!</h3>
                <div>
                    <Grid className={styles.filterRow} container justify="space-around" component={Paper} elevation={3}>

                        <div className={styles.dataTypeControl}>
                            <div>Type</div>
                            <ToggleButtonGroup
                                value={this.state.dataType}
                                exclusive
                                onChange={this.onDataTypeChange}
                                aria-label="text alignment"
                            >
                                <ToggleButton value="bugs" aria-label="left aligned">Bugs</ToggleButton>
                                <ToggleButton value="fish" aria-label="centered">Fish</ToggleButton>
                            </ToggleButtonGroup>
                        </div>

                        <Select
                            labelId="select-month-label"
                            id="select-month"
                            value={this.state.selectedMonth}
                            onChange={this.onDateChange}
                        >
                            <MenuItem value={1}>Jan.</MenuItem>
                            <MenuItem value={2}>Feb.</MenuItem>
                            <MenuItem value={3}>Mar.</MenuItem>
                            <MenuItem value={4}>Apr.</MenuItem>
                            <MenuItem value={5}>May</MenuItem>
                            <MenuItem value={6}>June</MenuItem>
                            <MenuItem value={7}>July</MenuItem>
                            <MenuItem value={8}>Aug.</MenuItem>
                            <MenuItem value={9}>Sept.</MenuItem>
                            <MenuItem value={10}>Oct.</MenuItem>
                            <MenuItem value={11}>Nov.</MenuItem>
                            <MenuItem value={12}>Dec.</MenuItem>
                        </Select>

                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={this.state.selectedTime}
                            onChange={this.onTimeChange}
                        >
                            <MenuItem value={0}>12 am</MenuItem>
                            <MenuItem value={1}>1 am</MenuItem>
                            <MenuItem value={2}>2 am</MenuItem>
                            <MenuItem value={3}>3 am</MenuItem>
                            <MenuItem value={4}>4 am</MenuItem>
                            <MenuItem value={5}>5 am</MenuItem>
                            <MenuItem value={6}>6 am</MenuItem>
                            <MenuItem value={7}>7 am</MenuItem>
                            <MenuItem value={8}>8 am</MenuItem>
                            <MenuItem value={9}>9 am</MenuItem>
                            <MenuItem value={10}>10 am</MenuItem>
                            <MenuItem value={11}>11 am</MenuItem>
                            <MenuItem value={12}>12 pm</MenuItem>
                            <MenuItem value={13}>1 pm</MenuItem>
                            <MenuItem value={14}>2 pm</MenuItem>
                            <MenuItem value={15}>3 pm</MenuItem>
                            <MenuItem value={16}>4 pm</MenuItem>
                            <MenuItem value={17}>5 pm</MenuItem>
                            <MenuItem value={18}>6 pm</MenuItem>
                            <MenuItem value={19}>7 pm</MenuItem>
                            <MenuItem value={20}>8 pm</MenuItem>
                            <MenuItem value={21}>9 pm</MenuItem>
                            <MenuItem value={22}>10 pm</MenuItem>
                            <MenuItem value={23}>11 pm</MenuItem>
                        </Select>
                        <div className={styles.hemisphereControl}>
                            <div>Hemisphere</div>
                            <ToggleButtonGroup
                                value={this.state.hemi}
                                exclusive
                                onChange={this.onHemiChange}
                                aria-label="text alignment"
                            >
                                <ToggleButton value="N" aria-label="left aligned">
                                    Northern
                                </ToggleButton>
                                <ToggleButton value="S" aria-label="centered">
                                    Southern
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </div>
                    </Grid>

                </div>
                <div>
                    <List
                        listData={this.state.listData}
                        dataType={this.state.dataType}
                        hemi={this.state.hemi}
                    />
                </div>
                <footer>
                    <div className={styles.footerContainer}>
                        <div className={styles.footer}>
                            Any issues or requests can be filed:
                            <a href={'https://github.com/tshubbard/ac-whatnow/issues'} target={'_blank'}>
                                https://github.com/tshubbard/ac-whatnow/issues
                            </a>
                        </div>
                    </div>
                </footer>
            </Container>
        );
    }
}
