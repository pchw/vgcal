import Expo, { Constants } from 'expo';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { range } from 'lodash';
import moment from 'moment';
import uuid from 'react-native-uuid';
import ical from './vendor/ical';

const ICAL_URL =
  'https://calendar.google.com/calendar/ical/rjvobdbsvqu8f3ddf6f0ofg0as%40group.calendar.google.com/public/basic.ics';

import Database from './js/db';
let db = new Database();

import Calendar from './js/CalendarComponent';
import Note from './js/NoteComponent';
import Loading from './js/LoadingComponent';
import RegisterModal from './js/RegisterModalComponent';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      plans: {},
      selectedDate: moment(),
      isLoading: false,
      loadedCount: 0,
      isShowRegisterModal: false
    };

    this.queryCalendarItem(this.state.selectedDate);
  }
  componentDidMount() {
    const self = this;
    let promises = [];
    this.setState({ isLoading: true });
    ical.fromURL(ICAL_URL, {}, function(err, data) {
      if (err) {
        alert(err);
      }
      db
        .prepare()
        .then(() => {
          for (const key in data) {
            promises.push(
              new Promise((resolve, reject) => {
                return db.upsertItem(data[key]).then(() => {
                  self.incrementLoaded();
                  return resolve();
                });
              })
            );
          }
          Promise.all(promises)
            .then(() => {
              self.setState({ isLoading: false });
              self.queryCalendarItem(self.state.selectedDate);
            })
            .catch(err => {
              alert(err);
            });
        })
        .catch(err => {
          alert(err);
        });
    });
  }
  render() {
    let notes = [];
    for (const key in this.state.items) {
      const item = this.state.items[key];
      notes.push(
        <Note
          key={item.uid}
          start={item.start}
          title={item.summary}
          description={item.description}
        />
      );
    }
    if (notes.length === 0) {
      notes.push(
        <Note
          key={uuid.v1()}
          start={this.state.selectedDate.format()}
          title={'予定されている大会はありません'}
          description={''}
        />
      );
    }
    let registerModalView;
    if (this.state.isShowRegisterModal) {
      registerModalView = (
        <RegisterModal
          onClose={() => {
            this.setState({ isShowRegisterModal: false });
          }}
        />
      );
    }

    let loadingView;
    if (this.state.isLoading) {
      loadingView = (
        <Loading
          text={`Loading calendar...[${this.state.loadedCount} loaded]`}
        />
      );
    }
    return (
      <View style={styles.container}>
        {loadingView}
        {registerModalView}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerItem}
            onPress={this.showRegisterModal.bind(this)}
          >
            <View style={styles.headerButton}>
              <Text>登録する</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerItem}>
            <Text style={styles.headerTitle}>VG Cal</Text>
          </View>

          <TouchableOpacity
            style={styles.headerItem}
            onPress={this.today.bind(this)}
          >
            <View>
              <Text style={styles.headerRight}>Today</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.calendarHeaderContainer}>
          <View style={styles.calendarHeaderItem}>
            <TouchableOpacity onPress={this.prevMonth.bind(this)}>
              <Entypo name="chevron-left" size={18} color="#333" />
            </TouchableOpacity>
            <Text style={styles.calendarHeaderText}>
              {this.state.selectedDate.format('YYYY')}
              {' '}
              {this.state.selectedDate.format('MMM')}
            </Text>
            <TouchableOpacity onPress={this.nextMonth.bind(this)}>
              <Entypo name="chevron-right" size={18} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        <Calendar
          style={styles.calendarContainer}
          date={this.state.selectedDate.format('YYYY-MM-DD')}
          onPress={this.onPressCalendarDate.bind(this)}
          plans={this.state.plans}
        />
        <View style={styles.noteContainer}>
          <ScrollView>
            {notes}
          </ScrollView>
        </View>
      </View>
    );
  }
  incrementLoaded() {
    this.setState({
      loadedCount: ++this.state.loadedCount
    });
  }
  queryCalendarItem(date) {
    promises = [];
    promises.push(
      db
        .prepare()
        .then(() => {
          return db.findItems({ date: date.format('YYYY-MM-DD') });
        })
        .then(items => {
          this.setState({ items: items });
          return Promise.resolve();
        })
        .catch(err => {
          alert(err);
        })
    );
    promises.push(
      db
        .prepare()
        .then(() => {
          return db.findCurrentMonthItems({ date: date.format('YYYY-MM') });
        })
        .then(items => {
          plans = {};
          (items || []).forEach(item => {
            plans[moment(item.start).format('YYYY-MM-DD')] = true;
          });
          this.setState({ plans: plans });
          return Promise.resolve();
        })
    );

    Promise.all(promises, () => {});
  }
  onPressCalendarDate(date) {
    this.setState({
      selectedDate: moment(date)
    });
    this.queryCalendarItem(moment(date));
  }
  nextMonth() {
    const day = this.state.selectedDate.clone().add(1, 'month');
    this.setState({
      selectedDate: day
    });
    this.queryCalendarItem(day);
  }
  prevMonth() {
    const day = this.state.selectedDate.clone().subtract(1, 'month');
    this.setState({
      selectedDate: day
    });
    this.queryCalendarItem(day);
  }
  today() {
    const day = moment();
    this.setState({
      selectedDate: day
    });
    this.queryCalendarItem(day);
  }
  showRegisterModal() {
    this.setState({
      isShowRegisterModal: true
    });
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFF8',
    flex: 1
  },
  header: {
    flex: 1,
    backgroundColor: '#EAB0B0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Constants.statusBarHeight + 15
  },
  headerItem: {
    flex: 1,
    alignSelf: 'center'
  },
  headerButton: {
    flexDirection: 'row'
  },
  headerTitle: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  headerRight: {
    textAlign: 'right'
  },
  noteContainer: {
    flex: 16
  },
  calendarContainer: {

  },
  calendarHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 15
  },
  calendarHeaderItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  calendarHeaderText: {
    fontWeight: 'bold',
    fontSize: 15
  }
});

Expo.registerRootComponent(App);
