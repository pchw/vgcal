import Expo, { Constants } from 'expo';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  DatePickerIOS,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import moment from 'moment';
import qs from 'qs';
import axios from 'axios';

export default class RegisterModalComponent extends React.Component {
  constructor(props) {
    super(props);
    const now = new Date();
    this.state = {
      name: '',
      detail: '',
      startDate: now,
      startTime: now,
      endTime: now,
      message: '',
      messageType: ''
    };
  }
  postGdoc() {
    if (!this.state.name) {
      return this.setState({
        message: '大会名を入力してください',
        messageType: 'error'
      });
    } else if (!this.state.detail) {
      return this.setState({
        message: '大会詳細を入力してください',
        messageType: 'error'
      });
    }
    // URL: https://docs.google.com/forms/d/e/1FAIpQLSfGiNE1u9QHvAEAPzEurRi86NJ1bcxZ2fAYRorsLnFd9sxvzA/formResponse
    // 大会名 entry.176820066
    // 大会詳細 entry.1436410033
    // 開催日 entry.1260341543_year, entry.1260341543_month, entry.1260341543_day
    // 開始時刻 entry.1441420962_hour, entry.1441420962_minute
    // 終了時刻 entry.366029149_hour, entry.366029149_minute
    axios
      .post(
        'https://docs.google.com/forms/d/e/1FAIpQLSfGiNE1u9QHvAEAPzEurRi86NJ1bcxZ2fAYRorsLnFd9sxvzA/formResponse',
        qs.stringify({
          'entry.176820066': this.state.name,
          'entry.1436410033': this.state.detail,
          'entry.1260341543_year': moment(this.state.startDate).format('YYYY'),
          'entry.1260341543_month': moment(this.state.startDate).format('MM'),
          'entry.1260341543_day': moment(this.state.startDate).format('DD'),
          'entry.1441420962_hour': moment(this.state.startTime).format('HH'),
          'entry.1441420962_minute': moment(this.state.startTime).format('mm'),
          'entry.366029149_hour': moment(this.state.endTime).format('HH'),
          'entry.366029149_minute': moment(this.state.endTime).format('mm')
        })
      )
      .then(response => {
        // 成功
        const now = new Date();
        this.setState({
          message: `${this.state.name} を登録しました`,
          messageType: '',
          name: '',
          detail: '',
          startDate: now,
          startTime: now,
          endTime: now
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          message: 'エラーが発生しました',
          messageType: 'error'
        });
      });
  }
  render() {
    let message;
    let messageStyle;
    if (this.state.message) {
      if (this.state.messageType === 'error') {
        messageStyle = { backgroundColor: '#CB1B45CC' };
      }
      message = (
        <TouchableOpacity
          onPress={() => {
            this.setState({ message: '' });
          }}
        >
          <View style={[styles.subHeader, messageStyle]}>
            <Text>{this.state.message}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <Modal animationType={'slide'}>
        <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
          <View style={styles.screen}>
            <View style={styles.header}>
              <View style={styles.headerItem}>
                <TouchableOpacity onPress={this.postGdoc.bind(this)}>
                  <Text>登録</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.headerItem}>
                <Text style={{ textAlign: 'center' }}>大会情報を入力</Text>
              </View>
              <View style={styles.headerItem}>
                <TouchableOpacity onPress={this.props.onClose.bind(this)}>
                  <Text style={styles.rightText}>閉じる</Text>
                </TouchableOpacity>
              </View>
            </View>
            {message}
            <View style={styles.body}>
              <ScrollView>
                <View style={styles.formRow}>
                  <View style={styles.formItem}>
                    <Text>大会名</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={this.state.name}
                    onChangeText={t => {
                      this.setState({ name: t });
                    }}
                  />
                </View>
                <View style={styles.formRow}>
                  <View style={styles.formItem}>
                    <Text>大会詳細</Text>
                  </View>
                  <TextInput
                    style={[styles.input, { height: 300 }]}
                    multiline={true}
                    value={this.state.detail}
                    onChangeText={t => {
                      this.setState({ detail: t });
                    }}
                  />
                </View>
                <View style={styles.formRow}>
                  <View style={styles.formItem}>
                    <Text>大会開催日</Text>
                  </View>
                  <DatePickerIOS
                    date={this.state.startDate}
                    minimumDate={new Date()}
                    mode={'date'}
                    onDateChange={d => {
                      this.setState({
                        startDate: d
                      });
                    }}
                  />
                </View>
                <View style={styles.formRow}>
                  <View style={styles.formItem}>
                    <Text>開始時刻</Text>
                  </View>
                  <DatePickerIOS
                    date={this.state.startTime}
                    minuteInterval={30}
                    mode={'time'}
                    onDateChange={d => {
                      this.setState({
                        startTime: d
                      });
                    }}
                  />
                </View>
                <View style={styles.formRow}>
                  <View style={styles.formItem}>
                    <Text>終了時刻</Text>
                  </View>
                  <DatePickerIOS
                    date={this.state.endTime}
                    minuteInterval={30}
                    mode={'time'}
                    onDateChange={d => {
                      this.setState({
                        endTime: d
                      });
                    }}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  rightText: {
    textAlign: 'right'
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
  subHeader: {
    alignItems: 'center',
    backgroundColor: '#51A8DD',
    padding: 10
  },
  formRow: {
    alignItems: 'stretch',
    padding: 15
  },
  formItem: {
    backgroundColor: '#EAB0B0',
    alignItems: 'center',
    padding: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 0
  },
  input: {
    borderColor: '#000000',
    borderStyle: 'solid',
    borderWidth: 1,
    marginBottom: 5,
    padding: 10,
    height: 60,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5
  },
  body: {
    flex: 25
  },
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
