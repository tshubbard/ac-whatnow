import React from 'react';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import styles from '../less/site.less';

export class SideInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newThisMonth: this.props.newThisMonth,
            leavingThisMonth: this.props.leavingThisMonth,
        };
        console.log('this.props: ', this.props);
    }

    render() {
        const newThisMonthListItems = this.props.newThisMonth.map(i =>
            <li key={i.name}>
                {i.name} <span className={styles.listTimeLabel}>({i.time})</span>
            </li>
        );
        const leavingThisMonthListItems = this.props.leavingThisMonth.map(i =>
            <li key={i.name}>
                {i.name} <span className={styles.listTimeLabel}>({i.time})</span>
            </li>
        );
        return (
            <div>
                <Card className={styles.sideBarCard} variant="outlined">
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            New This Month:
                        </Typography>
                        <ul className={styles.newMonthList}>
                            {newThisMonthListItems}
                        </ul>
                    </CardContent>
                </Card>

                <Card className={styles.sideBarCard} variant="outlined">
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Leaving This Month:
                        </Typography>
                        <ul className={styles.newMonthList}>
                            {leavingThisMonthListItems}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        );
    }
}
