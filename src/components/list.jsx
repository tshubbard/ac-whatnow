import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styles from '../less/site.less';

export class List extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listData: this.props.listData,
            hemi: this.props.hemi
        };
    }
    UNSAFE_componentWillUpdate(nextProps, nextState) {
        console.log('UNSAFE_componentWillUpdate nextProps: ', nextProps);
        console.log('UNSAFE_componentWillUpdate nextState: ', nextState);

    }
    render() {
        return (
            <TableContainer component={Paper}>
                <Table className={styles.dataTable} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Months</TableCell>
                            <TableCell>Location</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.props.listData.map && this.props.listData.map((row) => (
                            <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell>{row.price}</TableCell>
                                <TableCell>{row.time}</TableCell>
                                <TableCell>{this.props.hemi === 'N' ? row.monthsN : row.monthsS}</TableCell>
                                <TableCell>{row.location}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}
