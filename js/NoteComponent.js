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
import Autolink from 'react-native-autolink';

export default class Note extends React.Component {
  constructor(props) {
    super(props);
    const start = moment(props.start);
    this.state = {
      startTime: start.format('A hh:mm'),
      startDate: start.format('DD'),
      startMonth: start.format('MMM'),
      startWeekday: start.format('(ddd)')
    };
  }
  render() {
    return (
      <View style={[styles.notes, this.props.style]}>
        <View style={styles.notesNotes}>
          <Text style={styles.notesText}>
            {this.props.title}
          </Text>
          <Autolink
            style={styles.notesDescription}
            text={this.props.description}
          />
        </View>

        <View style={[styles.notesSelectedDate]}>
          <Text style={styles.smallText}>{this.state.startMonth}</Text>
          <Text style={styles.bigText}>{this.state.startDate}</Text>
          <Text style={styles.smallText}>{this.state.startWeekday}</Text>
          <Text style={styles.smallText}>{this.state.startTime}</Text>
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
