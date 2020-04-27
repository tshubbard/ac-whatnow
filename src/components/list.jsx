import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import styles from '../less/site.less';
import orderBy from 'lodash/orderBy';

export class List extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            listData: this.props.listData,
            hemi: this.props.hemi,
            dataType: this.props.dataType,
            orderBy: 'price',
            order: 'desc'
        };

        this.tHeadersFish = [{
            id: 'name',
            label: 'Name'
        }, {
            id: 'price',
            label: 'Price'
        }, {
            id: 'months',
            label: 'Months'
        }, {
            id: 'time',
            label: 'Time'
        }, {
            id: 'location',
            label: 'Location'
        }, {
            id: 'shadowSize',
            label: 'Shadow Size'
        }];

        this.tHeadersBugs = [{
            id: 'name',
            label: 'Name'
        }, {
            id: 'price',
            label: 'Price'
        }, {
            id: 'months',
            label: 'Months'
        }, {
            id: 'time',
            label: 'Time'
        }, {
            id: 'location',
            label: 'Location'
        }];
    }

    /**
     * Handles setting the order - asc desc
     *
     * @param {string} order The direction to order the column by
     */
    setOrder(order) {
        this.setState({
            order: order
        });
    }

    /**
     * Handles setting the Order By column
     *
     * @param {string} orderBy The ID of the column to order by
     */
    setOrderBy(orderBy) {
        this.setState({
            orderBy: orderBy
        });
    }

    render() {
        let headCells = this.props.dataType === 'bugs' ? this.tHeadersBugs : this.tHeadersFish;
        const onRequestSort = (event, property) => {
            console.log('onRequestSort ', property);

            const isAsc = this.state.orderBy === property && this.state.order === 'asc';
            console.log('onRequestSort isAsc ', isAsc);
            this.setOrder(isAsc ? 'desc' : 'asc');
            this.setOrderBy(property);
        };
        const createSortHandler = (property) => (event) => {
            onRequestSort(event, property);
        };
        let listData = orderBy(this.props.listData, this.state.orderBy, this.state.order);

        return (
            <TableContainer component={Paper} elevation={3}>
                <Table className={styles.dataTable} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    sortDirection={this.state.orderBy === headCell.id ? this.state.order : false}
                                >
                                    <TableSortLabel
                                        key={headCell.id + '_label'}
                                        active={this.state.orderBy === headCell.id}
                                        direction={this.state.orderBy === headCell.id ? this.state.order : 'asc'}
                                        onClick={createSortHandler(headCell.id)}
                                    >
                                        {headCell.label}
                                        {this.state.orderBy === headCell.id ? (
                                            <span className={styles.visuallyHidden}>
                                                {this.state.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                            </span>
                                        ) : null}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listData.map && listData.map((row) => (
                            <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell>{row.price}</TableCell>
                                <TableCell>{this.props.hemi === 'N' ? row.monthsN : row.monthsS}</TableCell>
                                <TableCell>{row.time}</TableCell>
                                <TableCell>{row.location}</TableCell>
                                {this.props.dataType === 'fish' ? (
                                    <TableCell>{row.shadowSize}</TableCell>
                                ) : null}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}
