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
import moment from 'moment';

export default class Note extends React.Component {
  constructor(props) {
    super(props);
    const start = moment(props.start);
    this.state = {
      startTime: start.format('hh:mm A'),
      startDate: start.format('DD'),
      startMonth: start.format('MMM'),
      startWeekday: start.format('dddd')
    };
  }
  render() {
    return (
      <View style={[styles.notes, this.props.style]}>
        <View style={styles.notesNotes}>
          <Text style={styles.notesText}>
            {this.props.title}
          </Text>
          <Text style={styles.notesDescription}>
            {this.props.description}
          </Text>
        </View>

        <View style={[styles.notesSelectedDate]}>
          <Text style={styles.smallText}>{this.state.startTime}</Text>
          <Text style={styles.bigText}>{this.state.startDate}</Text>
          <Text style={styles.smallText}>{this.state.startMonth}</Text>
          <View style={styles.inline}>
            <Text style={styles.smallText}>{this.state.startWeekday}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  notes: {
    marginTop: 10,
    padding: 20,
    borderColor: '#F5F5F5',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
    backgroundColor: '#FAFAFA'
  },
  notesNotes: {
    flex: 3
  },
  notesText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  notesDescription: {
    marginTop: 22
  },
  notesSelectedDate: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'column'
  },
  smallText: {
    fontSize: 15
  },
  bigText: {
    fontSize: 50,
    fontWeight: 'bold'
  },
  inline: {
    flexDirection: 'row'
  }
});
