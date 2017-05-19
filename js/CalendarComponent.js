import Expo from 'expo';
import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { range } from 'lodash';
import moment from 'moment';

export default class CalendarComponet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: moment(this.props.date)
    };
    const currentDate = this.state.currentDate;
    // 先月の最終日
    const lastDate = parseInt(
      moment(this.props.date).subtract(1, 'month').endOf('month').format('D'),
      10
    );

    // 今月1日目の週番号
    const startWeekday = parseInt(
      currentDate.clone().startOf('month').format('d'),
      10
    );
    const endWeekday = parseInt(
      currentDate.clone().endOf('month').format('d'),
      10
    );

    // 今月カレンダーに表示される先月分
    const pastMonthDays = range(lastDate - startWeekday + 1, lastDate + 1);
    // 今月のはじめから終わり
    const thisMonthDays = range(
      1,
      parseInt(currentDate.clone().endOf('month').format('D'), 10) + 1
    );
    // 来月カレンダーに表示される来月分
    const nextMonthDays = range(1, 6 - endWeekday + 1);
    this.state.pastMonthDays = pastMonthDays;
    this.state.thisMonthDays = thisMonthDays;
    this.state.nextMonthDays = nextMonthDays;
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.date) {
      this.setState(this.convertState(nextProps.date));
    }
  }
  convertState(date) {
    const currentDate = moment(date);
    // 先月の最終日
    const lastDate = parseInt(
      moment(date).subtract(1, 'month').endOf('month').format('D'),
      10
    );

    // 今月1日目の週番号
    const startWeekday = parseInt(
      currentDate.clone().startOf('month').format('d'),
      10
    );
    const endWeekday = parseInt(
      currentDate.clone().endOf('month').format('d'),
      10
    );

    // 今月カレンダーに表示される先月分
    const pastMonthDays = range(lastDate - startWeekday + 1, lastDate + 1);
    // 今月のはじめから終わり
    const thisMonthDays = range(
      1,
      parseInt(currentDate.clone().endOf('month').format('D'), 10) + 1
    );
    // 来月カレンダーに表示される来月分
    const nextMonthDays = range(1, 6 - endWeekday + 1);

    return {
      currentDate: currentDate,
      pastMonthDays: pastMonthDays,
      thisMonthDays: thisMonthDays,
      nextMonthDays: nextMonthDays
    };
  }
  componentDidMount() {}
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <View style={styles.weekDays}>
          {this.renderWeekDays()}
        </View>
        <View style={styles.days}>
          {this.renderWeeks()}
        </View>
      </View>
    );
  }
  renderWeekDays() {
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return weekdays.map(day => {
      return (
        <Text key={day} style={styles.weekdaysText}>
          {day.toUpperCase()}
        </Text>
      );
    });
  }

  getWeeksArray(days) {
    let weeks = [];
    let sevenDays = [];
    let count = 0;
    days.forEach(day => {
      count += 1;
      sevenDays.push(day);
      if (count === 7) {
        weeks.push(sevenDays);
        count = 0;
        sevenDays = [];
      }
    });
    if (sevenDays.length > 0) {
      weeks.push(sevenDays);
    }
    return weeks;
  }
  renderWeeks() {
    const { pastMonthDays, thisMonthDays, nextMonthDays } = this.state;
    const days = [].concat(pastMonthDays, thisMonthDays, nextMonthDays);
    const groupedDays = this.getWeeksArray(days);
    return groupedDays.map((weekDays, index) => {
      return (
        <View key={index} style={styles.weekDays}>
          {this.renderDays(weekDays)}
        </View>
      );
    });
  }
  renderDays(weekDays) {
    return weekDays.map((day, index) => {
      return (
        <TouchableOpacity
          label={day}
          key={index}
          onPress={() => {}}
          style={styles.day}
          noDefaultStyles={true}
        >
          <Text
            style={styles.dayText}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    });
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF'
  },
  weekdaysText: {
    flex: 1,
    color: '#C0C0C0',
    textAlign: 'center'
  },
  weekDays: {
    flexDirection: 'row'
  },
  day: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 17,
    margin: 2
  },
  dayText: {
    textAlign: 'center',
    color: '#A9A9A9',
    fontSize: 15
  }
});
