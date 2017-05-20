import Expo from 'expo';
import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { range } from 'lodash';
import moment from 'moment';

export default class CalendarComponet extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.convertState(props.date);
    this.state.plans = {};
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.date) {
      let stateObj = this.convertState(nextProps.date);
      stateObj.plans = nextProps.plans;
      this.setState(stateObj);
    }
  }
  convertState(date) {
    const currentDate = moment(date);
    // 先月の最終日
    const lastDate = parseInt(
      moment(date).subtract(1, 'month').endOf('month').format('D'),
      10
    );
    const lastMonth = moment(date)
      .subtract(1, 'month')
      .startOf('month')
      .format('YYYY-MM');
    const nextMonth = moment(date)
      .add(1, 'month')
      .startOf('month')
      .format('YYYY-MM');
    const currentMonth = currentDate.format('YYYY-MM');

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
    const pastMonthDays = range(
      lastDate - startWeekday + 1,
      lastDate + 1
    ).map(d => {
      return `${lastMonth}-${('0' + d).slice(-2)}`;
    });
    // 今月のはじめから終わり
    const thisMonthDays = range(
      1,
      parseInt(currentDate.clone().endOf('month').format('D'), 10) + 1
    ).map(d => {
      return `${currentMonth}-${('0' + d).slice(-2)}`;
    });
    // 来月カレンダーに表示される来月分
    const nextMonthDays = range(1, 6 - endWeekday + 1).map(d => {
      return `${nextMonth}-${('0' + d).slice(-2)}`;
    });

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
      let dayForDisplay;
      if (day) {
        // 2017-05-06 -> 06
        dayForDisplay = day.split('-')[2];
      }
      let colorStyle = styles.dayColor;
      if (
        moment(day).format('YYYY-MM-DD') ===
        this.state.currentDate.format('YYYY-MM-DD')
      ) {
        colorStyle = styles.currentDayColor;
      } else if (
        moment(day).format('YYYY-MM') !==
        this.state.currentDate.format('YYYY-MM')
      ) {
        colorStyle = styles.anotherMonthColor;
      } else if (this.state.plans[moment(day).format('YYYY-MM-DD')]) {
        colorStyle = styles.planDayColor;
      }
      return (
        <TouchableOpacity
          label={day}
          key={index}
          onPress={() => {
            this.onPressCalendarDate.bind(this)(day);
          }}
          style={[styles.day, colorStyle]}
          noDefaultStyles={true}
        >
          <Text
            style={styles.dayText}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
          >
            {dayForDisplay}
          </Text>
        </TouchableOpacity>
      );
    });
  }
  onPressCalendarDate(date) {
    if (!this.props.onPress) {
      return;
    }
    this.props.onPress(date);
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
    padding: 10,
    margin: 2
  },
  dayColor: {
    backgroundColor: '#FFFFFB',
    borderColor: '#BDC0BA',
    borderWidth: 1
  },
  currentDayColor: {
    backgroundColor: '#51A8DD44',
    borderColor: '#0C0C0C',
    borderWidth: 1
  },
  anotherMonthColor: {
    backgroundColor: '#FFFFFB',
    borderColor: '#FFFFFB',
    borderWidth: 1
  },
  planDayColor: {
    backgroundColor: '#33A6B888',
    borderColor: '#BDC0BA',
    borderWidth: 1
  },
  dayText: {
    textAlign: 'center',
    color: '#1C1C1C'
  }
});
